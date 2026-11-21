import { useEffect, useState, useCallback } from "react";

import API from "../services/api";

import FraudChart from "../components/FraudChart";
import RecentTransactions from "../components/RecentTransactions";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard statistics
  const fetchDashboardData = useCallback(async () => {
    try {
      setError("");

      const response = await API.get("/statistics");

      setStats(response.data);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      setError("Unable to fetch dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial dashboard loading
    fetchDashboardData();

    // Refresh after a new prediction
    window.addEventListener("transactionCreated", fetchDashboardData);

    // Refresh when returning to the browser tab
    window.addEventListener("focus", fetchDashboardData);

    return () => {
      window.removeEventListener("transactionCreated", fetchDashboardData);

      window.removeEventListener("focus", fetchDashboardData);
    };
  }, [fetchDashboardData]);

  if (loading) {
    return <p className="page-message">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="page-message">{error}</p>;
  }

  const cards = [
    {
      title: "Total Transactions",
      value: stats.total_transactions,
    },
    {
      title: "Fraud Transactions",
      value: stats.fraud_transactions,
    },
    {
      title: "Legitimate Transactions",
      value: stats.legitimate_transactions,
    },
    {
      title: "Fraud Percentage",
      value: `${stats.fraud_percentage}%`,
    },
  ];

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Welcome Back, Admin</h1>
        <p>Here's what's happening with your transactions.</p>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.title}>
            <div className="stat-card-top">
              <span>{card.title}</span>
            </div>

            <h2>{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <FraudChart
          fraud={stats.fraud_transactions}
          legitimate={stats.legitimate_transactions}
        />

        <div className="chart-card probability-card">
          <h3>Average Fraud Probability</h3>

          <p className="chart-subtitle">
            Average across all evaluated transactions
          </p>

          <h2>{(stats.average_fraud_probability * 100).toFixed(2)}%</h2>
        </div>
      </div>

      <RecentTransactions />
    </div>
  );
}

export default Dashboard;
