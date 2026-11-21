import { useEffect, useState } from "react";
import API from "../services/api";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_transactions: 0,
    has_next: false,
    has_previous: false,
  });

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const recordsPerPage = 10;

  // Fetch transaction records whenever page or filter changes
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await API.get("/transactions", {
          params: {
            page: currentPage,
            limit: recordsPerPage,
            prediction: filter,
            search: search.trim() || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
          },
        });

        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      } catch (error) {
        setError(
          error.response?.data?.detail || "Unable to load transactions.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, filter, appliedSearch, startDate, endDate]);

  // Fetch overall statistics separately
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await API.get("/statistics");
        setStatistics(response.data);
      } catch (error) {
        console.error("Statistics error:", error);
      }
    };

    fetchStatistics();
  }, []);

  const handleFilter = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="transactions-page">
      <div className="page-heading">
        <h1>Transactions</h1>
        <p>View and manage all analyzed transactions.</p>
      </div>

      {/* Overall statistics */}
      <div className="transaction-summary">
        <div>
          <p>Total Transactions</p>
          <h2>{statistics?.total_transactions ?? "—"}</h2>
        </div>

        <div>
          <p>Fraud Transactions</p>
          <h2>{statistics?.fraud_transactions ?? "—"}</h2>
        </div>

        <div>
          <p>Legitimate Transactions</p>
          <h2>{statistics?.legitimate_transactions ?? "—"}</h2>
        </div>
      </div>

      {/* Filter */}

      <div className="transaction-toolbar">
        <div className="transaction-search">
          <input
            type="text"
            placeholder="Enter complete transaction ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button
            onClick={() => {
              setCurrentPage(1);
              setAppliedSearch(search.trim());
            }}
          >
            Search
          </button>
        </div>

        <select
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Transactions</option>
          <option value="Fraud">Fraud</option>
          <option value="Legitimate">Legitimate</option>
        </select>

        <div className="date-filters">
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => {
              setStartDate(event.target.value);
              setCurrentPage(1);
            }}
          />

          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => {
              setEndDate(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <button
          className="clear-filters-button"
          onClick={() => {
            setSearch("");
            setAppliedSearch("");
            setFilter("All");
            setStartDate("");
            setEndDate("");
            setCurrentPage(1);
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Transaction table */}
      <div className="transactions-table-card">
        <div className="section-heading">
          <h3>Transaction Records</h3>

          <span>{pagination.total_transactions} records found</span>
        </div>

        {loading ? (
          <p className="empty-message">Loading transactions...</p>
        ) : error ? (
          <p className="empty-message">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="empty-message">No transactions found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Prediction</th>
                  <th>Probability</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => {
                  const prediction = transaction.prediction;

                  return (
                    <tr key={transaction._id}>
                      <td title={transaction._id}>{transaction._id}</td>

                      <td>₹{Number(transaction.features.Amount).toFixed(2)}</td>

                      <td>
                        <span
                          className={`status ${
                            prediction.result === "Fraud"
                              ? "fraud"
                              : "legitimate"
                          }`}
                        >
                          {prediction.result}
                        </span>
                      </td>

                      <td>
                        {(prediction.fraud_probability * 100).toFixed(2)}%
                      </td>

                      <td>
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>

                      <td>
                        <button
                          className="view-button"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="pagination">
          <span>{pagination.total_transactions} total records</span>

          <div>
            <button
              disabled={!pagination.has_previous || loading}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Previous
            </button>

            <span>
              Page {pagination.total_pages === 0 ? 0 : pagination.current_page}{" "}
              of {pagination.total_pages}
            </span>

            <button
              disabled={!pagination.has_next || loading}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Transaction details */}
      {selectedTransaction && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="transaction-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <h2>Transaction Details</h2>
                <p>{selectedTransaction._id}</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </button>
            </div>

            <div className="modal-result">
              <p>Prediction</p>

              <h2>{selectedTransaction.prediction.result}</h2>

              <p>
                Fraud Probability:{" "}
                {(
                  selectedTransaction.prediction.fraud_probability * 100
                ).toFixed(2)}
                %
              </p>
            </div>

            <div className="modal-information">
              <div>
                <span>Amount</span>
                <strong>
                  ₹{Number(selectedTransaction.features.Amount).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Transaction Time</span>
                <strong>{selectedTransaction.features.Time}</strong>
              </div>

              <div>
                <span>Threshold</span>
                <strong>
                  {selectedTransaction.prediction.threshold * 100}%
                </strong>
              </div>

              <div>
                <span>Created At</span>
                <strong>
                  {new Date(selectedTransaction.created_at).toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="modal-feature-section">
              <h3>Model Features</h3>

              <div className="modal-feature-grid">
                {Object.entries(selectedTransaction.features).map(
                  ([key, value]) => (
                    <div key={key}>
                      <span>{key}</span>
                      <strong>{value}</strong>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
