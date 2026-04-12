'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/axios';

export default function EditFood() {
  const router = useRouter();
  const params = useParams();
  const { accessToken, setAccessToken } = useAuth();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);

  const accessTokenRef = useRef(accessToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    const fetchData = async () => {
      const [foodRes, categoriesRes] = await Promise.all([
        apiFetch(
          `/foods/${params.id}`,
          { method: 'GET' },
          accessTokenRef.current,
          setAccessToken
        ),
        apiFetch('/categories', { method: 'GET' }, accessToken, setAccessToken),
      ]);

      const [foodData, categoriesData] = await Promise.all([
        foodRes.json(),
        categoriesRes.json(),
      ]);

      const food = foodData.food;

      setName(food.name);
      setPrice(food.price);
      setStock(food.stock);
      setCategory(food.category._id);
      setDescription(food.description);
      setCategories(categoriesData.categories);
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category', category);
    formData.append('description', description);

    if (image) formData.append('image', image);

    await apiFetch(
      `/foods/${params.id}`,
      {
        method: 'PUT',
        body: formData,
      },
      accessTokenRef.current,
      setAccessToken
    );

    router.push('/dashboard/foods');
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Edit Food</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-96">
        <input
          type="text"
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          className="border p-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="number"
          className="border p-2"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <select
          className="border p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <textarea
          className="border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <button className="bg-black text-white p-2">Update Food</button>
      </form>
    </div>
  );
}
