
import pandas as pd
import requests

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Load dataset
df = pd.read_csv("dataset/creditcard.csv")

# Select 10 legitimate and 10 fraudulent transactions
legitimate = df[df["Class"] == 0].sample(
    n=10, random_state=42
)

fraud = df[df["Class"] == 1].sample(
    n=10, random_state=42
)

test_data = pd.concat([legitimate, fraud]).sample(
    frac=1, random_state=42
)

feature_columns = (
    ["Time"] +
    [f"V{i}" for i in range(1, 29)] +
    ["Amount"]
)

actual = []
predicted = []

print("Testing FastAPI prediction endpoint...\n")

for index, row in test_data.iterrows():

    payload = {
        feature: float(row[feature])
        for feature in feature_columns
    }

    response = requests.post(
        "http://127.0.0.1:8000/predict",
        json=payload,
        timeout=30
    )

    response.raise_for_status()

    result = response.json()

    actual_class = int(row["Class"])
    predicted_class = int(result["prediction_class"])

    actual.append(actual_class)
    predicted.append(predicted_class)

    print(
        f"Actual: {actual_class} | "
        f"Predicted: {predicted_class} | "
        f"Probability: {result['fraud_probability']:.4f}"
    )

# Calculate evaluation metrics
print("\n========== API EVALUATION ==========")

print("Accuracy:", accuracy_score(actual, predicted))
print(
    "Precision:",
    precision_score(actual, predicted, zero_division=0)
)
print(
    "Recall:",
    recall_score(actual, predicted, zero_division=0)
)
print(
    "F1 Score:",
    f1_score(actual, predicted, zero_division=0)
)

print("\nConfusion Matrix:")
print(confusion_matrix(actual, predicted))

print("\nClassification Report:")
print(
    classification_report(
        actual,
        predicted,
        target_names=["Legitimate", "Fraud"],
        zero_division=0
    )
)
