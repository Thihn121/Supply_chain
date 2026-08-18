import { useState } from "react";
import QRCodeCard from "../components/QRCodeCard";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { createProduct, productExists } from "../services/api";
const initialForm = {
  id: "",
  barcode: "",
  name: "",
  placeOfOrigin: "",
  productionDate: "",
  expirationDate: "",
  unitQuantity: "",
  unitQuantityType: "",
  batchQuantity: "",
  unitPrice: "",
  category: "",
  variety: "",
  misc: "",
  location: "",
  arrivalDate: "",
};

function CreateProduct({networkStatus}) {
  const [form, setForm] = useState(initialForm);
  const [components, setComponents] = useState([]);
  const [createdProductId, setCreatedProductId] = useState("");
  const [componentInput, setComponentInput] = useState("");
  const [componentChecking, setComponentChecking] = useState(false);
  const [componentError, setComponentError] = useState("");
  const [componentSuccess, setComponentSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addComponent = async () => {
  const value = componentInput.trim();

  if (!value) {
    setComponentError("Please enter a Product ID.");
    return;
  }

  if (components.includes(value)) {
    setComponentError(`Component "${value}" has already been added.`);
    return;
  }

  try {
    setComponentChecking(true);
    setComponentError("");
    setComponentSuccess("");

    const result = await productExists(value);

    const exists =
      result?.exists === true ||
      result?.exists === "true";

    if (!exists) {
      setComponentError(
        `Product "${value}" does not exist on the blockchain.`
      );
      return;
    }

    setComponents((prev) => [...prev, value]);
    setComponentInput("");
    setComponentSuccess(
      `Product "${value}" is valid and has been added.`
    );
  } catch (error) {
    setComponentError(
      error.message || "Unable to check component product."
    );
  } finally {
    setComponentChecking(false);
  }
};
  const validateComponents = async () => {
    for (const componentId of components) {
      const result = await productExists(componentId);

      const exists =
        result?.exists === true ||
        result?.exists === "true";

      if (!exists) {
        throw new Error(
          `Component product "${componentId}" no longer exists.`
        );
      }
    }
  };
  const removeComponent = (id) => {
    setComponents((prev) => prev.filter((item) => item !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");
    setCreatedProductId("");
    try {
      await validateComponents();

      const product = {
        id: form.id.trim(),
        componentProductIds: components,
        barcode: form.barcode.trim(),
        name: form.name.trim(),
        placeOfOrigin: form.placeOfOrigin.trim(),
        productionDate: form.productionDate,
        expirationDate: form.expirationDate,
        unitQuantity: Number(form.unitQuantity),
        unitQuantityType: form.unitQuantityType.trim(),
        batchQuantity:
          form.batchQuantity === "" ? null : Number(form.batchQuantity),
        unitPrice: form.unitPrice.trim(),
        category: form.category.trim(),
        variety: form.variety.trim(),
        misc: form.misc.trim(),
        locationData: {
          previous: [],
          current: {
            location: form.location.trim(),
            arrivalDate: form.arrivalDate,
          },
        },
      };

      await createProduct(product);
      setCreatedProductId(product.id);

      setSuccess(`Product "${product.id}" đã được tạo thành công.`);

      setForm(initialForm);
      setComponents([]);
      setComponentInput("");
    } catch (err) {
      setError(err.message || "Không thể tạo Product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar networkStatus={networkStatus}/>

      <main className="main-content">
        <Header />

        <section className="create-page">
          <div className="page-title">
            <div>
              <h2>Create Product</h2>
              <p>
                Register a new product on the Hyperledger Fabric blockchain.
              </p>
            </div>
          </div>

          {/* {success && <div className="alert success-alert">{success}</div>} */}
          {success && (
            <div className="created-result">
              <div className="alert success-alert">
                {success}
              </div>

              {createdProductId && (
                <QRCodeCard productId={createdProductId} />
              )}
            </div>
          )}

          {error && (
            <div className="alert error-alert">
              {error}
            </div>
          )}
          <form className="product-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <div className="form-section-title">
                <h3>Basic Information</h3>
                <p>Information used to identify the product.</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Product ID <span>*</span>
                  </label>

                  <input
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="e.g. P001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Barcode <span>*</span>
                  </label>

                  <input
                    name="barcode"
                    value={form.barcode}
                    onChange={handleChange}
                    placeholder="Product barcode"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    Product Name <span>*</span>
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Product name"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    Place of Origin <span>*</span>
                  </label>

                  <input
                    name="placeOfOrigin"
                    value={form.placeOfOrigin}
                    onChange={handleChange}
                    placeholder="e.g. Da Lat"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-title">
                <h3>Production Information</h3>
                <p>Product quantity and production details.</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Production Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="productionDate"
                    value={form.productionDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Expiration Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="expirationDate"
                    value={form.expirationDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Unit Quantity <span>*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="unitQuantity"
                    value={form.unitQuantity}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Unit Quantity Type <span>*</span>
                  </label>

                  <input
                    name="unitQuantityType"
                    value={form.unitQuantityType}
                    onChange={handleChange}
                    placeholder="kg, box, liter..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Batch Quantity</label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="batchQuantity"
                    value={form.batchQuantity}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Unit Price <span>*</span>
                  </label>

                  <input
                    name="unitPrice"
                    value={form.unitPrice}
                    onChange={handleChange}
                    placeholder="e.g. 200000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Category <span>*</span>
                  </label>

                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Coffee"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Variety</label>

                  <input
                    name="variety"
                    value={form.variety}
                    onChange={handleChange}
                    placeholder="e.g. Arabica"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Additional Information</label>

                  <textarea
                    name="misc"
                    value={form.misc}
                    onChange={handleChange}
                    placeholder="Additional product information"
                    rows="4"
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-title">
                <h3>Initial Location</h3>
                <p>
                  The first location recorded for this product on the
                  blockchain.
                </p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Current Location <span>*</span>
                  </label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Factory A"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Arrival Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="arrivalDate"
                    value={form.arrivalDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-title">
                <h3>Component Products</h3>
                <p>
                  Add Product IDs used as components of this product.
                </p>
              </div>

              <div className="component-input">
                <input
                  value={componentInput}
                  onChange={(e) => {
                    setComponentInput(e.target.value);
                    setComponentError("");
                    setComponentSuccess("");
                  }}
                  placeholder="Enter component Product ID, e.g. P002"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addComponent();
                    }
                  }}
                />

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addComponent}
                  disabled={componentChecking}
                >
                  {componentChecking ? "Checking..." : "Check & Add"}
                </button>
              </div>

              {componentError && (
                <div className="component-message error">
                  {componentError}
                </div>
              )}

              {componentSuccess && (
                <div className="component-message success">
                  {componentSuccess}
                </div>
              )}

              <div className="component-list">
                {components.length === 0 ? (
                  <p className="empty-components">
                    No component products added.
                  </p>
                ) : (
                  components.map((id) => (
                    <div className="component-tag" key={id}>
                      <span>{id}</span>

                      <button
                        type="button"
                        onClick={() => removeComponent(id)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setForm(initialForm);
                  setCreatedProductId("");
                  setComponentError("");
                  setComponentSuccess("");
                  setComponents([]);
                  setComponentInput("");
                  setSuccess("");
                  setError("");
                }}
              >
                Reset
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default CreateProduct;