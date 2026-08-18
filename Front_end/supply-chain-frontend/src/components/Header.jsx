function Header() {
  return (
    <header className="header">
      <div>
        <h1>Tracking system</h1>
        <p>Supply chain information sharing and traceability</p>
      </div>

      <div className="user-area">
        <div className="user-avatar">M</div>
        <div>
          <div className="user-name">Manager</div>
          <div className="user-role">Blockchain User</div>
        </div>
      </div>
    </header>
  );
}

export default Header;