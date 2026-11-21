function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <h2>Dashboard Overview</h2>
        <p>Monitor and analyze financial transactions</p>
      </div>

      <div className="navbar-actions">
        <div className="search-box">
          <input type="text" placeholder="Search transactions..." />
        </div>

        <div className="profile">
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
