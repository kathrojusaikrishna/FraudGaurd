import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>FraudGuard</h2>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">OVERVIEW</p>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/predict"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          Predict Transaction
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          Transactions
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-link">Settings</div>
      </div>
    </aside>
  );
}

export default Sidebar;
