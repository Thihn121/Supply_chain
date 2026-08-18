import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CreateProduct from "./pages/CreateProduct";
import TraceProduct from "./pages/TraceProduct";
import ShipProduct from "./pages/ShipProduct";
import ProductDetail from "./pages/ProductDetail";
import Products from "./pages/Products";
import TrackedProducts from "./pages/TrackedProducts";
import { getHealth } from "./services/api";

function App() {
  const [networkStatus, setNetworkStatus] = useState("checking");
  const [healthData, setHealthData] = useState(null);

  const checkNetwork = async () => {
    try {
      const data = await getHealth();

      setHealthData(data);
      setNetworkStatus("connected");
    } catch (error) {
      console.error("Health check failed:", error);

      setHealthData(null);
      setNetworkStatus("disconnected");
    }
  };

  useEffect(() => {
    checkNetwork();

    const interval = setInterval(checkNetwork, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              networkStatus={networkStatus}
              healthData={healthData}
            />
          }
        />

        <Route
          path="/create-product"
          element={
            <CreateProduct networkStatus={networkStatus} />
          }
        />

        <Route
          path="/traceability"
          element={
            <TraceProduct networkStatus={networkStatus} />
          }
        />

        <Route
          path="/shipping"
          element={
            <ShipProduct networkStatus={networkStatus} />
          }
        />
        
        <Route
          path="/products/:id"
          element={
            <ProductDetail networkStatus={networkStatus} />
          }
        />
        <Route
          path="/products"
          element={
            <Products networkStatus={networkStatus} />
          }
        />

        <Route
          path="/tracked-products"
          element={
            <TrackedProducts networkStatus={networkStatus} />
          }
        />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;