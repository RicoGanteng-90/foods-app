import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminDashboard() {
  const [stats, setStats] = useState(null);

  const getStats = async () => {
    const { data } = await api.get("orders/admin/dashboard");

    setStats(data);
  };

  useEffect(() => {
    getStats();
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1>Admin dashboard</h1>

      <p>Total Orders: {stats.totalOrders}</p>
      <p>Total Users: {stats.totalUsers}</p>
      <p>Total Foods: {stats.totalFoods}</p>
      <p>
        Total Revenue:{" "}
        {new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 2,
        }).format(stats.revenue)}
      </p>

      <h3>Order Status</h3>
      <p>Pending: {stats.pending}</p>
      <p>Confirmed: {stats.confirmed}</p>
      <p>Cooking: {stats.cooking}</p>
      <p>Delivered: {stats.delivered}</p>
      <p>Cancelled: {stats.cancelled}</p>
    </div>
  );
}

export default AdminDashboard;
