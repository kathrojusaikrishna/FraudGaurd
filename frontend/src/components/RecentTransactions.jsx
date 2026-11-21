import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

function RecentTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async () => {
    try {
      setError("");

      const response = await API.get("/transactions", {
        params: {
          page: 1,
          limit: 5,
          prediction: "All",
        },
      });

      setTransactions(response.data.transactions);
    } catch (err) {
      console.error("Recent transactions error:", err);
      setError("Unable to load recent transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();

    window.addEventListener("transactionCreated", fetchTransactions);
    window.addEventListener("focus", fetchTransactions);

    return () => {
      window.removeEventListener("transactionCreated", fetchTransactions);
      window.removeEventListener("focus", fetchTransactions);
    };
  }, [fetchTransactions]);

  if (loading) return <p>Loading recent transactions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="recent-transactions">
      <h3>Recent Transactions</h3>

      {transactions.length === 0 ? (
        <p>No transactions available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Prediction</th>
              <th>Fraud Probability</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td title={transaction._id}>{transaction._id.slice(-8)}</td>

                <td>{transaction.prediction.result}</td>

                <td>
                  {(transaction.prediction.fraud_probability * 100).toFixed(2)}%
                </td>

                <td>{new Date(transaction.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RecentTransactions;
