
from pathlib import Path
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import os

import joblib
import pandas as pd
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas import TransactionFeatures

from datetime import datetime, timezone, timedelta
from bson import ObjectId
from math import ceil



# Load environment variables

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "fraud_detection")

if not MONGODB_URL:
    raise RuntimeError("MONGODB_URL is missing from .env")



# Connect to MongoDB during application startup

@asynccontextmanager
async def lifespan(app: FastAPI):

    client = AsyncMongoClient(MONGODB_URL)

    try:
        # Verify Atlas connection
        await client.admin.command("ping")
        print("MongoDB Atlas connected successfully!")

        # Select database and collection
        app.state.db = client[DATABASE_NAME]
        app.state.transactions = app.state.db["transactions"]

        yield

    finally:
        await client.close()
        print("MongoDB connection closed.")



# Create FastAPI application

app = FastAPI(
    title="Credit Card Fraud Detection API",
    description="Fraud detection using XGBoost and MongoDB",
    version="1.0.0",
    lifespan=lifespan
)



# Configure CORS

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://fraud-gaurd-cyan.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Load trained ML model

MODEL_PATH = BASE_DIR / "models" / "fraud_detection_model.pkl"

try:
    artifact = joblib.load(MODEL_PATH)

    model = artifact["model"]
    THRESHOLD = float(artifact["threshold"])

except FileNotFoundError:
    raise RuntimeError(f"Model file not found: {MODEL_PATH}")

except (KeyError, TypeError, ValueError) as error:
    raise RuntimeError(f"Invalid model artifact: {error}")


FEATURE_NAMES = (
    ["Time"]
    + [f"V{i}" for i in range(1, 29)]
    + ["Amount"]
)



# Home endpoint

@app.get("/")
async def home():

    return {
        "message": "Credit Card Fraud Detection API",
        "status": "running"
    }



# Health endpoint

@app.get("/health")
async def health_check():

    return {
        "status": "healthy",
        "model_loaded": model is not None
    }



# Model information

@app.get("/model-info")
async def model_info():

    return {
        "model_name": artifact.get("model_name", "XGBoost"),
        "threshold": THRESHOLD,
        "features_required": len(FEATURE_NAMES)
    }



# Predict and save transaction

@app.post("/predict")
async def predict_fraud(transaction: TransactionFeatures):

    try:
        # Convert validated input into a dictionary
        transaction_data = transaction.model_dump()

        # Create DataFrame in the correct feature order
        input_df = pd.DataFrame(
            [transaction_data],
            columns=FEATURE_NAMES
        )

        # Predict fraud probability
        probability = float(
            model.predict_proba(input_df)[0][1]
        )

        # Apply classification threshold
        prediction = int(probability >= THRESHOLD)

        result = "Fraud" if prediction == 1 else "Legitimate"

        # Prepare MongoDB document
        document = {
            "features": transaction_data,

            "prediction": {
                "result": result,
                "class": prediction,
                "fraud_probability": probability,
                "threshold": THRESHOLD
            },

            "created_at": datetime.now(timezone.utc)
        }

        # Save transaction in MongoDB
        insert_result = await app.state.transactions.insert_one(
            document
        )

        # Return prediction and database ID
        return {
            "transaction_id": str(insert_result.inserted_id),
            "prediction": result,
            "prediction_class": prediction,
            "fraud_probability": round(probability, 6),
            "threshold": THRESHOLD,
            "saved_to_database": True
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )


# Retrieve transaction history
@app.get("/transactions")
async def get_transactions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    prediction: str = Query(default="All"),
    search: str | None = Query(default=None),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None)
):
    try:
        collection = app.state.transactions

        if prediction not in ["All", "Fraud", "Legitimate"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid prediction filter"
            )

        query = {}

        # Filter by prediction
        if prediction != "All":
            query["prediction.result"] = prediction

        # Search by complete MongoDB transaction ID
        if search and search.strip():
            transaction_id = search.strip()

            if not ObjectId.is_valid(transaction_id):
                raise HTTPException(
                    status_code=400,
                    detail="Enter a valid 24-character transaction ID"
                )

            query["_id"] = ObjectId(transaction_id)

        # Filter by starting date (inclusive)
        if start_date or end_date:
            date_filter = {}

            try:
                if start_date:
                    start = datetime.strptime(
                        start_date, "%Y-%m-%d"
                    ).replace(tzinfo=timezone.utc)

                    date_filter["$gte"] = start

                if end_date:
                    end = datetime.strptime(
                        end_date, "%Y-%m-%d"
                    ).replace(tzinfo=timezone.utc)

                    # Include the entire end date
                    date_filter["$lt"] = end + timedelta(days=1)

            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Dates must use YYYY-MM-DD format"
                )

            query["created_at"] = date_filter

        total_transactions = await collection.count_documents(query)

        total_pages = ceil(total_transactions / limit)
        skip_count = (page - 1) * limit

        cursor = (
            collection.find(query)
            .sort("created_at", -1)
            .skip(skip_count)
            .limit(limit)
        )

        transactions = await cursor.to_list(length=limit)

        for transaction in transactions:
            transaction["_id"] = str(transaction["_id"])

        return {
            "transactions": transactions,
            "pagination": {
                "current_page": page,
                "limit": limit,
                "total_transactions": total_transactions,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1
            }
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve transactions: {str(error)}"
        )


@app.get("/statistics")
async def get_statistics():

    try:
        collection = app.state.transactions

        # Total number of saved transactions
        total_transactions = await collection.count_documents({})

        # Total fraud transactions
        fraud_transactions = await collection.count_documents({
            "prediction.class": 1
        })

        # Total legitimate transactions
        legitimate_transactions = await collection.count_documents({
            "prediction.class": 0
        })

        # Calculate fraud percentage
        fraud_percentage = (
            (fraud_transactions / total_transactions) * 100
            if total_transactions > 0
            else 0
        )

        # Calculate average fraud probability
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "average_probability": {
                        "$avg": "$prediction.fraud_probability"
                    }
                }
            }
        ]

        cursor = await collection.aggregate(pipeline)

        result = await cursor.to_list(length=1)

        average_probability = (
            result[0]["average_probability"]
            if result
            else 0
        )

        return {
            "total_transactions": total_transactions,
            "fraud_transactions": fraud_transactions,
            "legitimate_transactions": legitimate_transactions,
            "fraud_percentage": round(fraud_percentage, 2),
            "average_fraud_probability": round(average_probability, 4)
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Could not calculate statistics: {str(error)}"
        )
