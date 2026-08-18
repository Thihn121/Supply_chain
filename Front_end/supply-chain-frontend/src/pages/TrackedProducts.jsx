import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import { getAllProducts } from "../services/api";

function TrackedProducts({ networkStatus }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrackedProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const allProducts = await getAllProducts();

        const tracked = allProducts.filter(
          (product) =>
            Array.isArray(product.locationData?.previous) &&
            product.locationData.previous.length > 0
        );

        setProducts(tracked);
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Unable to load tracked products."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrackedProducts();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar networkStatus={networkStatus} />

      <main className="main-content">
        <Header />

        <section className="page-container">
          <div className="page-heading products-heading">
            <div>
              <h2>Tracked Items</h2>
              <p>
                Products that have location history on the blockchain.
              </p>
            </div>

            <div className="products-count">
              {products.length} tracked item(s)
            </div>
          </div>

          {loading && (
            <div className="loading-box">
              Loading tracked products...
            </div>
          )}

          {error && (
            <div className="page-error">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="empty-box">
              No tracked products found.
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="products-list">
              {products.map((product) => {
                const currentLocation =
                  product.locationData?.current?.location || "Unknown";

                const history =
                  Array.isArray(product.locationData?.previous)
                    ? product.locationData.previous
                    : [];

                return (
                  <div className="product-row" key={product.id}>
                    <div className="product-main">
                      <div className="product-id">
                        {product.id}
                      </div>

                      <div className="product-info">
                        <h3>{product.name || "Unnamed Product"}</h3>

                        <p>
                          {product.category || "No category"}
                          {product.placeOfOrigin
                            ? ` • ${product.placeOfOrigin}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="product-location">
                      <span>Current Location</span>
                      <strong>{currentLocation}</strong>
                    </div>

                    <div className="product-history-count">
                      <span>Locations</span>
                      <strong>{history.length + 1}</strong>
                    </div>

                    <Link
                      to={`/products/${encodeURIComponent(product.id)}`}
                      className="view-button"
                    >
                      View Details
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default TrackedProducts;