import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import QRCodeCard from "../components/QRCodeCard";
import { getProductWithHistory } from "../services/api";

function ProductDetail({ networkStatus }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getProductWithHistory(id);

        setData(result);
      } catch (err) {
        setError(err.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

    const product = useMemo(() => {
    if (!data) return null;
    return data.result || data;
    }, [data]);

    const components = useMemo(() => {
    return Array.isArray(product?.componentProducts)
        ? product.componentProducts
        : [];
    }, [product]);

  const history = useMemo(() => {
    const locationData = product?.locationData;

    if (!locationData) return [];

    const previous = Array.isArray(locationData.previous)
      ? locationData.previous
      : [];

    const current = locationData.current
      ? [locationData.current]
      : [];

    return [...previous, ...current];
  }, [product]);

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header />
          <section className="page-container">
            <div className="loading-box">Loading product...</div>
          </section>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="app-layout">
        <Sidebar networkStatus={networkStatus}/>
        <main className="main-content">
          <Header />

          <section className="page-container">
            <div className="page-error large-error">
              {error || "Product not found."}
            </div>

            <button
              className="secondary-button"
              onClick={() => navigate("/traceability")}
            >
              Back to Traceability
            </button>
          </section>
        </main>
      </div>
    );
  }

  const currentLocation = product.locationData?.current?.location || "Unknown";

  return (
    <div className="app-layout">
      <Sidebar networkStatus={networkStatus}/>

      <main className="main-content">
        <Header />

        <section className="page-container">
          <div className="detail-top">
            <div>
              <div className="breadcrumb">
                <Link to="/traceability">Traceability</Link>
                <span>/</span>
                <span>{product.id}</span>
              </div>

              <h2>{product.name}</h2>
              <p>Product ID: {product.id}</p>
            </div>

            <div className="detail-actions">
              <Link
                className="secondary-button link-button"
                to={`/shipping?productId=${encodeURIComponent(product.id)}`}
              >
                Ship Product
              </Link>
            </div>
          </div>

          <section className="detail-grid">
            <div className="detail-card">
              <div className="card-title">
                <h3>Product Information</h3>
              </div>
              <QRCodeCard productId={product.id} />
              <div className="info-grid">
                <div className="info-item">
                  <span>Product ID</span>
                  <strong>{product.id}</strong>
                </div>

                <div className="info-item">
                  <span>Barcode</span>
                  <strong>{product.barcode || "—"}</strong>
                </div>

                <div className="info-item">
                  <span>Origin</span>
                  <strong>{product.placeOfOrigin || "—"}</strong>
                </div>

                <div className="info-item">
                  <span>Category</span>
                  <strong>{product.category || "—"}</strong>
                </div>

                <div className="info-item">
                  <span>Variety</span>
                  <strong>{product.variety || "—"}</strong>
                </div>

                <div className="info-item">
                  <span>Quantity</span>
                  <strong>
                    {product.unitQuantity ?? "—"}{" "}
                    {product.unitQuantityType || ""}
                  </strong>
                </div>

                <div className="info-item">
                  <span>Production Date</span>
                  <strong>{product.productionDate || "—"}</strong>
                </div>

                <div className="info-item">
                  <span>Expiration Date</span>
                  <strong>{product.expirationDate || "—"}</strong>
                </div>

                <div className="info-item">
                  <span>Unit Price</span>
                  <strong>{product.unitPrice || "—"}</strong>
                </div>
              </div>
            </div>

            <div className="detail-card current-location-card">
              <div className="card-title">
                <h3>Current Location</h3>
              </div>

              <div className="current-location">
                <div className="location-icon">⌖</div>

                <div>
                  <span>Current Location</span>
                  <strong>{currentLocation}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="detail-card">
            <div className="card-title">
              <h3>Component Products</h3>
              <span>{components.length} component(s)</span>
            </div>

            {components.length === 0 ? (
              <div className="empty-box">
                This product does not contain any component products.
              </div>
            ) : (
              <div className="component-detail-list">
                {components.map((component, index) => {
                  const componentId =
                    typeof component === "string"
                      ? component
                      : component.id;

                  const componentName =
                    typeof component === "string"
                      ? component
                      : component.name;

                  return (
                    <Link
                      key={`${componentId}-${index}`}
                      to={`/products/${encodeURIComponent(componentId)}`}
                      className="component-detail-item"
                    >
                      <div className="component-id">{componentId}</div>

                      <div className="component-name">
                        {componentName || "Product component"}
                      </div>

                      <div className="component-arrow">→</div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="detail-card">
            <div className="card-title">
              <h3>Location History</h3>
              <span>{history.length} location(s)</span>
            </div>

            {history.length === 0 ? (
              <div className="empty-box">
                No location history available.
              </div>
            ) : (
              <div className="timeline">
                {history.map((entry, index) => {
                  const isCurrent =
                    index === history.length - 1 &&
                    entry.location === currentLocation;

                  return (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-line">
                        <div
                          className={`timeline-dot ${
                            isCurrent ? "current" : ""
                          }`}
                        />
                      </div>

                      <div className="timeline-content">
                        <div className="timeline-location">
                          {entry.location}
                        </div>

                        <div className="timeline-date">
                          {entry.arrivalDate || "Unknown date"}
                        </div>

                        {isCurrent && (
                          <span className="current-badge">Current</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default ProductDetail;