import { QRCodeSVG } from "qrcode.react";

function QRCodeCard({ productId }) {
  if (!productId) {
    return null;
  }
    const productUrl = `${window.location.origin}/products/${encodeURIComponent(
    productId
  )}`;

  return (
    <div className="qr-card">
      <div className="qr-header">
        <div>
          <h3>Product QR Code</h3>
          <p>Scan to trace this product</p>
        </div>
      </div>

      <div className="qr-content">
        <QRCodeSVG
          value={productUrl}
          size={180}
          level="H"
          includeMargin
        />

        <div className="qr-info">
          <span>Product ID</span>
          <strong>{productId}</strong>

          <span>Trace URL</span>
          <small>{productUrl}</small>
        </div>
      </div>
    </div>
  );
}

export default QRCodeCard;