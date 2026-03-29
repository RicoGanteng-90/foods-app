import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Checkout() {
  const navigate = useNavigate();

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [addressNote, setAddressNote] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const handleCheckout = async () => {
    await api.post("/orders", {
      deliveryAddress: {
        street,
        city,
        province,
        addressNote,
      },
      orderNote,
      paymentMethod,
    });

    alert("Order created");
    navigate("/orders");
  };

  return (
    <div>
      <h1>Checkout</h1>

      <input placeholder="Street" onChange={(e) => setStreet(e.target.value)} />
      <input placeholder="City" onChange={(e) => setCity(e.target.value)} />
      <input
        placeholder="Province"
        onChange={(e) => setProvince(e.target.value)}
      />
      <input
        placeholder="Address note"
        onChange={(e) => setAddressNote(e.target.value)}
      />
      <input
        placeholder="Order note"
        onChange={(e) => setOrderNote(e.target.value)}
      />
      <select onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="COD">COD</option>
        <option value="Transfer">Transfer</option>
        <option value="E-Wallet">E-Wallet</option>
      </select>

      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
}

export default Checkout;
