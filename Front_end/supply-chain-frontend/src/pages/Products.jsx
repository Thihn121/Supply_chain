import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import { getAllProducts } from "../services/api";

function Products({ networkStatus }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllProducts();

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar networkStatus={networkStatus} />

      <main className="main-content">
        <Header />

        <section className="page-container">
          <div className="page-heading products-heading">
            <div>
              <h2>Products</h2>
              <p>
                All products currently stored on the blockchain.
              </p>
            </div>

            <div className="products-count">
              {products.length} product(s)
            </div>
          </div>

          {loading && (
            <div className="loading-box">
              Loading products...
            </div>
          )}

          {error && (
            <div className="page-error">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="empty-box">
              No products found on the blockchain.
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="products-list">
              {products.map((product) => {
                const currentLocation =
                  product.locationData?.current?.location || "Unknown";

                const hasHistory =
                  Array.isArray(product.locationData?.previous) &&
                  product.locationData.previous.length > 0;

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

                    <div className="product-status">
                      {hasHistory ? (
                        <span className="history-badge">
                          Tracked
                        </span>
                      ) : (
                        <span className="new-badge">
                          New
                        </span>
                      )}
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

export default Products;