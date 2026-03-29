import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";

function Cart() {
  const { cart, getCart } = useCart();
  const { accessToken } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const updateQty = async (foodId, quantity) => {
    setError("");
    try {
      await api.patch(`/carts/${foodId}`, { quantity });
      getCart();
    } catch (err) {
      setError(err.response?.data.message || "Something went wrong");
    }
  };

  const removeItem = async (foodId) => {
    await api.delete(`/carts/${foodId}`);
    getCart();
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.food.price,
    0,
  );

  useEffect(() => {
    if (accessToken) {
      getCart();
    }
  }, [accessToken]);

  return (
    <div>
      <h1>Cart</h1>
      {error && <p>{error}</p>}
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.food._id}>
              <h3>{item.food.name}</h3>
              <p>Price: {item.food.price}</p>

              <button
                onClick={() => updateQty(item.food._id, item.quantity - 1)}
              >
                -
              </button>

              <span>Quantity: {item.quantity}</span>

              <button
                onClick={() => updateQty(item.food._id, item.quantity + 1)}
              >
                +
              </button>

              <br />

              <button onClick={() => removeItem(item.food._id)}>Remove</button>

              <p>Subtotal: {item.food.price * item.quantity}</p>
            </div>
          ))}
          <h2>Total: {totalPrice}</h2>
          <button onClick={() => navigate("/checkout")}>Checkout</button>
        </>
      )}
    </div>
  );
}

export default Cart;
