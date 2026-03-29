import { useCart } from "../context/useCart";

function FoodCard({ food }) {
  const { addToCart } = useCart();

  return (
    <div style={{ border: "1px solid gray", padding: "10px", margin: "10px" }}>
      {food.imageUrl ? (
        <img src={food.imageUrl} alt={food.name} width="150" />
      ) : (
        <div style={{ width: "200px", height: "150px", background: "#eee" }}>
          No image
        </div>
      )}

      <h3>{food.name}</h3>
      <p>Price: {food.price}</p>
      <button onClick={() => addToCart(food._id)}>Add to cart</button>
    </div>
  );
}

export default FoodCard;
