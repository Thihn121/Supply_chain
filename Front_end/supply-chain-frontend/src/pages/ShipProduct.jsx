import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getProduct, productExists, shipProduct } from "../services/api";

function ShipProduct({ networkStatus }) {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialProductId = queryParams.get("productId") || "";

  const [form, setForm] = useState({
    productId: initialProductId,
    newLocation: "",
    arrivalDate: "",
  });

  const [product, setProduct] = useState(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialProductId) {
      checkProduct(initialProductId);
    }
  }, []);

  const checkProduct = async (id) => {
    const productId = id.trim();

    if (!productId) return;

    try {
      setChecking(true);
      setError("");
      setMessage("");

      const existsResult = await productExists(productId);

      const exists =
        existsResult?.exists === true ||
        existsResult?.exists === "true";

      if (!exists) {
        setProduct(null);
        setError(`Product "${productId}" does not exist.`);
        return;
      }

      const data = await getProduct(productId);
      setProduct(data);
    } catch (err) {
      setProduct(null);
      setError(err.message || "Unable to check product.");
    } finally {
      setChecking(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheck = async () => {
    await checkProduct(form.productId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product) {
      setError("Please verify the Product ID first.");
      return;
    }

    if (!form.newLocation.trim()) {
      setError("New location is required.");
      return;
    }

    if (!form.arrivalDate) {
      setError("Arrival date is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await shipProduct({
        productId: form.productId.trim(),
        newLocation: form.newLocation.trim(),
        arrivalDate: form.arrivalDate,
      });

      setMessage(
        `Product "${form.productId}" was successfully moved to "${form.newLocation}".`
      );

      const updatedProduct = await getProduct(form.productId.trim());
      setProduct(updatedProduct);
    } catch (err) {
      setError(err.message || "Unable to update product location.");
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
            <h2>Ship Product</h2>
            <p>
              Update the current location of a product on the blockchain.
            </p>
          </div>

          <section className="shipping-card">
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">
                <h3>Shipment Information</h3>
                <p>
                  The current location will be stored in the product history
                  before the new location is updated.
                </p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Product ID *</label>

                  <div className="inline-input">
                    <input
                      name="productId"
                      value={form.productId}
                      onChange={handleChange}
                      placeholder="e.g. P001"
                      required
                    />

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleCheck}
                      disabled={checking}
                    >
                      {checking ? "Checking..." : "Check"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Location *</label>

                  <input
                    name="newLocation"
                    value={form.newLocation}
                    onChange={handleChange}
                    placeholder="e.g. Warehouse A"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Arrival Date *</label>

                  <input
                    type="date"
                    name="arrivalDate"
                    value={form.arrivalDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {product && (
                <div className="shipping-product-preview">
                  <div>
                    <span>Product</span>
                    <strong>{product.name}</strong>
                  </div>

                  <div>
                    <span>Product ID</span>
                    <strong>{product.id}</strong>
                  </div>

                  <div>
                    <span>Current Location</span>
                    <strong>
                      {product.locationData?.current?.location || "Unknown"}
                    </strong>
                  </div>
                </div>
              )}

              {message && (
                <div className="alert success-alert">{message}</div>
              )}

              {error && <div className="alert error-alert">{error}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate("/traceability")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading || !product}
                >
                  {loading ? "Updating..." : "Update Location"}
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}

export default ShipProduct;