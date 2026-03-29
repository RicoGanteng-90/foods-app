import { useState, useEffect } from "react";
import api from "../api/axios";

function AdminOrder() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const getAllOrders = async () => {
    const { data } = await api.get("/orders/admin", {
      params: {
        page,
        limit: 10,
        search,
      },
    });

    setOrders(data.result);
    setTotalPages(data.totalPages);
  };

  useEffect(() => {
    getAllOrders();
  }, [page, search]);

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });

    getAllOrders();
  };

  return (
    <div>
      <h1>Admin Orders</h1>

      <input
        type="text"
        placeholder="Search order"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      {orders.map((order) => (
        <div key={order._id} style={{ border: "1px solid black", margin: 10 }}>
          <h3>Order: {order.orderNumber}</h3>
          <p>User: {order.user?.name}</p>
          <p>Status: {order.status}</p>
          <p>Total: {order.total}</p>

          <select
            value={order.status}
            onChange={(e) => updateStatus(order._id, e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cooking">Cooking</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      ))}

      <div>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span>
          {" "}
          Page {page} of {totalPages}{" "}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminOrder;
