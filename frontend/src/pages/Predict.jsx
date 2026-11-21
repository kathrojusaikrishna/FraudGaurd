import { useState } from "react";
import API from "../services/api";

const featureNames = [
  "Time",
  ...Array.from({ length: 28 }, (_, i) => `V${i + 1}`),
  "Amount",
];

const initialFeatures = Object.fromEntries(
  featureNames.map((name) => [name, ""]),
);

function Predict() {
  const [features, setFeatures] = useState(initialFeatures);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFeatures((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Convert input strings into numbers
      const payload = Object.fromEntries(
        featureNames.map((name) => [name, Number(features[name])]),
      );

      // Send transaction to FastAPI
      const response = await API.post("/predict", payload);

      setResult(response.data);
      window.dispatchEvent(new Event("transactionCreated"));
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Unable to predict transaction. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFeatures(initialFeatures);
    setResult(null);
    setError("");
  };

  return (
    <div className="predict-page">
      <div className="page-heading">
        <h1>Transaction Prediction</h1>
        <p>Enter transaction features to evaluate its fraud risk.</p>
      </div>

      <div className="input-notice">
        <h3>Model input requirements</h3>
        <p>
          This model requires 28 PCA-transformed features (V1–V28), transaction
          time and transaction amount. Enter numeric values for all 30 features.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-section-heading">
            <h3>Transaction Information</h3>
            <p>Basic transaction features</p>
          </div>

          <div className="feature-grid">
            {["Time", "Amount"].map((name) => (
              <div className="form-group" key={name}>
                <label htmlFor={name}>
                  {name === "Time" ? "Transaction Time" : "Transaction Amount"}
                </label>

                <input
                  id={name}
                  type="number"
                  name={name}
                  value={features[name]}
                  onChange={handleChange}
                  min="0"
                  step="any"
                  required
                  placeholder={`Enter ${name}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <h3>PCA Components</h3>
            <p>Enter values for V1 through V28</p>
          </div>

          <div className="feature-grid">
            {featureNames
              .filter((name) => name.startsWith("V"))
              .map((name) => (
                <div className="form-group" key={name}>
                  <label htmlFor={name}>{name}</label>

                  <input
                    id={name}
                    type="number"
                    name={name}
                    value={features[name]}
                    onChange={handleChange}
                    step="any"
                    required
                    placeholder={`Enter ${name}`}
                  />
                </div>
              ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleReset}
          >
            Clear Form
          </button>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Analyzing Transaction..." : "Analyze Transaction"}
          </button>
        </div>
      </form>

      {result && (
        <div
          className={`prediction-result ${
            result.prediction === "Fraud" ? "fraud-result" : "legitimate-result"
          }`}
        >
          <div className="result-heading">
            <div>
              <p>Prediction Result</p>

              <h2>{result.prediction}</h2>
            </div>

            <span className="result-status">
              {result.prediction === "Fraud" ? "High Risk" : "Low Risk"}
            </span>
          </div>

          <div className="result-details">
            <div>
              <p>Fraud Probability</p>
              <h3>{(result.fraud_probability * 100).toFixed(2)}%</h3>
            </div>

            <div>
              <p>Classification Threshold</p>
              <h3>{(result.threshold * 100).toFixed(0)}%</h3>
            </div>

            <div>
              <p>Transaction ID</p>
              <h3 className="transaction-id">{result.transaction_id}</h3>
            </div>
          </div>

          <p className="saved-message">
            Prediction successfully saved to the database.
          </p>
        </div>
      )}
    </div>
  );
}

export default Predict;
