import { useState, useEffect } from "react";
import api from "../api/axios";

function AddFood() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    const { data } = await api.get("/categories");
    setCategories(data.result);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("category", category);
    formData.append("image", image);

    await api.post("/foods/add-food", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Food added succesfully");
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImage("");
  };

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }

    const obcjectUrl = URL.createObjectURL(image);
    setPreview(obcjectUrl);

    return () => URL.revokeObjectURL(obcjectUrl);
  }, [image]);

  return (
    <div>
      <h1>Add Food</h1>

      <form onSubmit={submitHandler}>
        <input
          type="text"
          placeholder="Food name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          name="image"
          onChange={(e) => {
            setImage(e.target.files[0]);
          }}
        />

        {preview && <img src={preview} alt="Image" width="150" />}

        <button type="submit">Add Food</button>
      </form>
    </div>
  );
}

export default AddFood;
