import { useState, useEffect } from "react";
import api from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";

function EditFood() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getFood = async () => {
      const { data } = await api.get(`/foods/${id}`);
      const food = data.result;

      setName(food.name);
      setDescription(food.description);
      setPrice(food.price);
      setCategory(food.category._id);
      setStock(food.stock);
      setPreview(food.imageUrl);
    };
    getFood();
  }, [id]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    const { data } = await api.get("/categories", {});
    setCategories(data.result);
  };

  useEffect(() => {
    if (!image) return;

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("stock", stock);

    if (image) {
      formData.append("image", image);
    }

    await api.put(`/foods/${id}`, formData, {});

    alert("Food updated");
    navigate("/admin/foods");
  };

  return (
    <form onSubmit={handleUpdate}>
      <h1>Edit Food</h1>

      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input value={price} onChange={(e) => setPrice(e.target.value)} />
      <input value={stock} onChange={(e) => setStock(e.target.value)} />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">--Choose category--</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {preview && <img src={preview} alt="Image" width="300" />}
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />

      <button type="submit">Update Food</button>
    </form>
  );
}

export default EditFood;
