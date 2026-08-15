import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getProduct, productExists } from "../services/api";

function TraceProduct({ networkStatus }) {
  const navigate = useNavigate();

  const [productId, setProductId] = useState("");
  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    const id = productId.trim();

    if (!id) {
      setError("Please enter a Product ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setProduct(null);

      const existsResult = await productExists(id);

      const exists =
        existsResult?.exists === true ||
        existsResult?.exists === "true";

      if (!exists) {
        setError(`Product "${id}" does not exist.`);
        return;
      }

      const data = await getProduct(id);
      setProduct(data.result || data);

      navigate(`/products/${encodeURIComponent(id)}`);
    } catch (err) {
      setError(err.message || "Unable to find product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar networkStatus={networkStatus}/>

      <main className="main-content">
        <Header />

        <section className="page-container">
          <div className="page-heading">
            <h2>Trace Product</h2>
            <p>
              Search and trace product information stored on the blockchain.
            </p>
          </div>

          <form className="trace-search-card" onSubmit={handleSearch}>
            <label>Product ID</label>

            <div className="trace-search-row">
              <input
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter Product ID, e.g. P001"
              />

              <button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            {error && <div className="page-error">{error}</div>}
          </form>

          {product && (
            <div className="trace-preview">
              <div>
                <span>Product ID</span>
                <strong>{product.id}</strong>
              </div>

              <div>
                <span>Name</span>
                <strong>{product.name}</strong>
              </div>

              <div>
                <span>Origin</span>
                <strong>{product.placeOfOrigin}</strong>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default TraceProduct;