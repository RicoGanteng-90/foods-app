import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const getOrderDetail = async () => {
    const { data } = await api.get(`/orders/${id}`, {});

    setOrder(data.result);
  };

  useEffect(() => {
    getOrderDetail();
  }, [id]);

  const cancelOrderHandler = async () => {
    if (!window.confirm("Cancel this order?")) return;

    await api.patch(`/orders/${id}/cancel`, {});

    alert("Order cancelled");
    getOrderDetail();
  };

  if (!order) return <p>Loading...</p>;

  return (
    <div>
      <h1>Order detail</h1>

      <h3>Order number: {order.orderNumber}</h3>
      <p>Status: {order.status}</p>
      <p>Total: {order.total}</p>

      <h3>Items:</h3>
      {order.orderItems.map((item) => (
        <div key={item.food} style={{ borderBottom: "1px solid gray" }}>
          <p>{item.name}</p>
          <p>
            {item.quantity} x {item.price}
          </p>
        </div>
      ))}

      <h3>
        Total:{" "}
        {new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 2,
        }).format(order.total)}
      </h3>

      {order.status === "Pending" && (
        <button onClick={cancelOrderHandler}>Cancel order</button>
      )}

      <br />
      <button onClick={() => navigate("/orders")}>Back to order</button>
    </div>
  );
}

export default OrderDetail;
