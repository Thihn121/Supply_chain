import { NavLink } from "react-router-dom";

function Sidebar({ networkStatus = "checking" }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">BC</div>

        <div>
          <div className="brand-title">SupplyChain</div>
          <div className="brand-subtitle">Blockchain Platform</div>
        </div>
      </div>

      <nav className="nav">
        <NavLink
            to="/"
            end
            className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
            }
            >
            <span>⌂</span>
            Dashboard
            </NavLink>

            <NavLink
            to="/traceability"
            className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
            }
            >
            <span>⌕</span>
            Traceability
            </NavLink>

            <NavLink
            to="/shipping"
            className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
            }
            >
            <span>⇄</span>
            Shipping
            </NavLink>

            <NavLink
            to="/create-product"
            className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
            }
            >
            <span>＋</span>
            Create Product
            </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="network-box">
          <div className="network-label">NETWORK</div>
          <div className="network-name">Hyperledger Fabric</div>

          <div
              className={`network-status ${networkStatus}`}
            >
              <span className="status-dot" />

              {networkStatus === "connected"
                ? "Connected"
                : networkStatus === "disconnected"
                ? "Disconnected"
                : "Checking..."}
            </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;