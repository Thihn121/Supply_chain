import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import { useEffect, useState } from "react";
import { getHealth, getAllProducts } from "../services/api";
import { createProduct } from "../services/api";
import { Link } from "react-router-dom";

function Dashboard({ networkStatus, healthData }) {
  const [products, setProducts] = useState([]);
  //Load Product
  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    }
  };
  
   const checkNetwork = async () => {
    try {
      const data = await getHealth();

      setHealthData(data);
      setNetworkStatus("connected");
    } catch (error) {
      setHealthData(null);
      setNetworkStatus("disconnected");
    }
  };
  useEffect(() => {
    checkNetwork();
    loadProducts();
    const interval = setInterval(() => {
      checkNetwork();
      loadProducts();
    }, 10000);

    return () => clearInterval(interval);
  }, []);
  const totalProducts = products.length;
  const trackedProducts = products.filter(
    (product) =>
      Array.isArray(product.locationData?.previous) &&
      product.locationData.previous.length > 0
  );

  const trackedItems = trackedProducts.length;
  return (
    <div className="app-layout">
      <Sidebar networkStatus={networkStatus}/>

      <main className="main-content">
        <Header />

        <section className="dashboard-content">
          <div className="stats-grid">
            <Link to="/products" className="stat-link">
              <StatCard
                title="Products"
                value={products.length}
                description="Products stored on blockchain"
                icon="▣"
              />
            </Link>

            <Link to="/tracked-products" className="stat-link">
              <StatCard
                title="Tracked Items"
                value={trackedItems}
                description="Products with location history"
                icon="⌖"
              />
            </Link>

            <StatCard
              title="Network"
              value={
                networkStatus === "connected"
                  ? "ONLINE"
                  : networkStatus === "disconnected"
                  ? "OFFLINE"
                  : "CHECKING"
              }
              description="Hyperledger Fabric network"
              icon="◉"
            />
          </div>

          <section className="quick-section">
            <div className="section-heading">
                <div>
                <h2>Quick Actions</h2>
                <p>Common supply chain operations</p>
                </div>
            </div>

            <div className="quick-grid">
                <Link to="/create-product" className="quick-card">
                    <div className="quick-icon create">＋</div>

                    <div>
                    <h3>Create Product</h3>
                    <p>Register a new product on blockchain</p>
                    </div>
                </Link>

                <Link to="/traceability" className="quick-card">
                    <div className="quick-icon trace">⌕</div>

                    <div>
                    <h3>Trace Product</h3>
                    <p>View product information and history</p>
                    </div>
                </Link>

                <Link to="/shipping" className="quick-card">
                    <div className="quick-icon ship">⇄</div>

                    <div>
                    <h3>Ship Product</h3>
                    <p>Update the product location</p>
                    </div>
                </Link>
                </div>
            </section>

          <section className="status-section">
            <div className="status-header">
              <div>
                <h2>Blockchain Status</h2>
                <p>Current application connection</p>
              </div>

              <span
                className={`network-badge ${
                  networkStatus === "connected"
                    ? "connected"
                    : networkStatus === "disconnected"
                    ? "disconnected"
                    : "checking"
                }`}
              >
                <span className="status-dot" />

                {networkStatus === "connected"
                  ? "Connected"
                  : networkStatus === "disconnected"
                  ? "Disconnected"
                  : "Checking..."}
              </span>
            </div>

            <div className="status-grid">
              <div className="status-item">
                <span>Blockchain</span>
                <strong>
                  {healthData?.blockchain || "Unavailable"}
                </strong>
              </div>

              <div className="status-item">
                <span>Channel</span>
                <strong>
                  {healthData?.channel || "Unavailable"}
                </strong>
              </div>

              <div className="status-item">
                <span>Chaincode</span>
                <strong>
                  {healthData?.chaincode || "Unavailable"}
                </strong>
              </div>

              <div className="status-item">
                <span>Identity</span>
                <strong>
                  {healthData?.identity || "Unavailable"}
                </strong>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;