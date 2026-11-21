import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

function FraudChart({ fraud, legitimate }) {
  const data = [
    { name: "Fraud", value: fraud },
    { name: "Legitimate", value: legitimate },
  ];

  const COLORS = ["#ef4444", "#22c55e"];

  return (
    <div className="chart-card">
      <h3>Transaction Distribution</h3>
      <p className="chart-subtitle">Fraudulent vs legitimate transactions</p>

      {fraud + legitimate === 0 ? (
        <p className="empty-message">No transaction data available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
              }}
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default FraudChart;
