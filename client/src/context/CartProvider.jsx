import { useState } from "react";
import { useAuth } from "./useAuth";
import { CartContext } from "./CartContext";
import api from "../api/axios";

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { accessToken } = useAuth();

  const getCart = async () => {
    if (!accessToken) return;

    const res = await api.get("/carts", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    setCart(res.data.result);
  };

  const addToCart = async (foodId) => {
    if (!accessToken) {
      alert("Please login first");
      return;
    }

    await api.post(
      "/carts",
      { food: foodId, quantity: 1 },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    getCart();
  };

  return (
    <CartContext.Provider value={{ cart, getCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}
