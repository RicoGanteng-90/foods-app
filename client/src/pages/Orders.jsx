import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const getMyOrders = async () => {
    const { data } = await api.get("/orders/my", {});

    setOrders(data.result);
  };

  useEffect(() => {
    getMyOrders();
  }, []);

  return (
    <div>
      <h1>Orders page</h1>

      {orders.map((order) => (
        <div
          key={order._id}
          style={{ border: "1px solid black", margin: "10px" }}
        >
          <h3>Order Number: {order.orderNumber}</h3>
          <p>Status: {order.status}</p>
          <p>Total: {order.total}</p>

          <h4>Items: </h4>
          {order.orderItems.map((item) => (
            <div key={item.food}>
              <p>{item.name}</p>
              <p>
                {item.quantity} x {item.price}
              </p>
            </div>
          ))}
          <h4>
            Total:{" "}
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 2,
            }).format(order.total)}
          </h4>

          <button onClick={() => navigate(`/orders/${order._id}`)}>
            View detail
          </button>
        </div>
      ))}
    </div>
  );
}

export default Orders;
