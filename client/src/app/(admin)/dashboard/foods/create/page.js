'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

export default function CreateFood() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);

  const router = useRouter();
  const { accessToken, setAccessToken } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiFetch(
          '/categories',
          { method: 'GET' },
          accessToken,
          setAccessToken
        );

        const data = await res.json();

        if (res.ok) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Gagal ambil kategori:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('stock', stock);

    if (image) formData.append('image', image);

    await apiFetch(
      '/foods',
      {
        method: 'POST',
        body: formData,
      },
      accessToken,
      setAccessToken
    );

    router.push('/dashboard/foods');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setImage(file);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div>
      <h1 className="text-2xl mb-4">Create Food</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-96">
        <input
          type="text"
          placeholder="Food Name"
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select
          className="border p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Price"
          className="border p-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Stock"
          className="border p-2"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input type="file" className="border p-2" onChange={handleFileChange} />

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="preview"
            style={{ height: 'auto', width: 'auto' }}
          />
        )}

        <button className="bg-black text-white p-2 cursor-pointer hover:opacity-85 transition-transform active:scale-90">
          Create Food
        </button>
      </form>
    </div>
  );
}
