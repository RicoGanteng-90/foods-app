import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";
import AdminOrder from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import AddFood from "./pages/AddFood";
import AdminFoods from "./pages/AdminFoods";
import EditFood from "./pages/EditFood";

function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrder />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/foods"
          element={
            <AdminRoute>
              <AdminFoods />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/foods/add"
          element={
            <AdminRoute>
              <AddFood />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/edit-food/:id"
          element={
            <AdminRoute>
              <EditFood />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
