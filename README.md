# FraudGuard – Credit Card Fraud Detection System

FraudGuard is a machine learning-powered web application that detects potentially fraudulent credit card transactions. It uses an XGBoost classification model to estimate fraud probability and classify transactions as **Fraudulent** or **Legitimate**.

The application provides a dashboard for monitoring transactions, analyzing fraud statistics, and reviewing prediction history.

## Live Demo

- **Frontend:** https://fraud-guard-c372aonoh-sai-krishna-s-projects3.vercel.app
- **Backend API:** https://fraudgaurd-hx4a.onrender.com
- **API Documentation:** https://fraudgaurd-hx4a.onrender.com/docs

## Features

- Credit card transaction fraud prediction using XGBoost.
- Fraud probability estimation for every transaction.
- Configurable classification threshold.
- MongoDB Atlas integration for storing predictions.
- Interactive dashboard with transaction statistics.
- Fraudulent vs. legitimate transaction distribution.
- Recent transaction history.
- Transaction search and filtering.
- Date-based transaction filtering.
- Paginated transaction records.
- REST API built with FastAPI.
- Docker-based local development.
- Cloud deployment using Render and Vercel.

## Technology Stack

| Category             | Technologies                  |
| -------------------- | ----------------------------- |
| Programming Language | Python, JavaScript            |
| Machine Learning     | Scikit-learn, XGBoost         |
| Data Processing      | Pandas, NumPy                 |
| Visualization        | Matplotlib, Seaborn, Recharts |
| Backend              | FastAPI                       |
| Frontend             | React, Vite                   |
| Database             | MongoDB Atlas                 |
| API Communication    | Axios                         |
| Model Serialization  | Joblib                        |
| Containerization     | Docker, Docker Compose        |
| Backend Deployment   | Render                        |
| Frontend Deployment  | Vercel                        |

## Machine Learning Model

The project uses the Credit Card Fraud Detection dataset from Kaggle.

**Dataset characteristics:**

- Total transactions: 284,807
- Total features: 30
- Legitimate transactions: 284,315
- Fraudulent transactions: 492
- Fraud rate: Approximately 0.173%

The dataset contains:

- `Time`
- `V1` to `V28` – PCA-transformed features
- `Amount`
- `Class` – target variable

### Model Performance

The selected XGBoost model uses a classification threshold of 0.7.

| Metric    |  Result |
| --------- | ------: |
| Precision |  96.20% |
| Recall    |  80.00% |
| F1 Score  |    0.87 |
| PR-AUC    | 0.82004 |

Confusion Matrix:

|                   | Predicted Legitimate | Predicted Fraud |
| ----------------- | -------------------: | --------------: |
| Actual Legitimate |               56,648 |               3 |
| Actual Fraud      |                   19 |              76 |

These results are from the project's evaluated test set and should not be interpreted as a guarantee of real-world performance.

## Project Structure

```text
fraud-detection-system/
│
├── backend/
│   ├── main.py
│   └── schemas.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── Dockerfile
│
├── models/
│   └── fraud_detection_model.pkl
│
├── notebooks/
├── tests/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .dockerignore
├── .gitignore
└── README.md
```

## Installation and Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/kathrojusaikrishna/FraudGaurd.git
cd FraudGaurd
```

### 2. Create and activate a Python virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=fraud_detection
```

Never commit your `.env` file or expose database credentials publicly.

### 5. Start the backend

```bash
uvicorn backend.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Docker Setup

You can also run the application using Docker Compose.

Build and start:

```bash
docker compose up -d --build
```

Stop the containers:

```bash
docker compose down
```

## API Endpoints

| Method | Endpoint                         | Description               |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/`                              | Backend information       |
| GET    | `/health`                        | Health check              |
| GET    | `/model-info`                    | Model information         |
| POST   | `/predict`                       | Predict transaction fraud |
| GET    | `/transactions`                  | Retrieve transactions     |
| GET    | `/transactions/{transaction_id}` | Retrieve a transaction    |
| GET    | `/statistics`                    | Dashboard statistics      |

## Deployment Architecture

```text
           React Frontend
                |
              Vercel
                |
             Axios
                |
             FastAPI
              Render
                |
       -------------------
       |                 |
  XGBoost Model     MongoDB Atlas
       |                 |
       -------------------
```

1. The user enters transaction features through the React interface.
2. Axios sends the transaction data to the FastAPI backend.
3. The backend loads the trained XGBoost model and generates a prediction.
4. The model calculates the fraud probability.
5. The classification threshold determines whether the transaction is fraudulent or legitimate.
6. The prediction and transaction details are stored in MongoDB Atlas.
7. The frontend displays the prediction and updated dashboard statistics.

## Important Notes

- The model expects 30 numerical input features: `Time`, `V1`–`V28`, and `Amount`.
- `V1`–`V28` are PCA-transformed features, not raw merchant or card details.
- The Kaggle dataset is not included in the repository.
- Keep MongoDB credentials and other secrets in environment variables.
- Model evaluation results are dataset-specific.

## Future Improvements

- Real-time transaction monitoring.
- Advanced fraud analytics and trend visualization.
- Explainable AI using SHAP.
- Automated model retraining.
- Improved transaction feature engineering.
- Model performance monitoring and drift detection.

## Author

Kathroju Sai Krishna
Developed as a Machine Learning and Full-Stack Development project.

**FraudGuard – Intelligent Credit Card Fraud Detection.**
