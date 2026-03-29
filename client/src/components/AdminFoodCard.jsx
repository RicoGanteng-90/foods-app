import { useNavigate } from "react-router-dom";

function AdminFoodCard({ food, onDelete }) {
  const navigate = useNavigate();
  return (
    <div>
      {food.imageUrl ? (
        <img src={food.imageUrl} alt={food.name} width="150" />
      ) : (
        <div style={{ width: "200px", height: "150px", background: "#eee" }}>
          No image
        </div>
      )}

      <h3>{food.name}</h3>
      <p>Price: {food.price}</p>
      <p>Category: {food.category.name}</p>
      <p>Stock: {food.stock}</p>
      <button onClick={() => navigate(`/admin/edit-food/${food._id}`)}>
        Edit food
      </button>
      <button onClick={() => onDelete(food._id)}>Delete food</button>
    </div>
  );
}

export default AdminFoodCard;
