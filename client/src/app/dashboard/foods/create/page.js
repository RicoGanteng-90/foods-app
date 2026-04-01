'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

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
          '/api/categories',
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
      if (preview) URL.revokeObjectURL(preview);

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
        />

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
          <Image
            src={preview}
            alt="preview"
            width={100}
            height={100}
            unoptimized
          />
        )}

        <button className="bg-black text-white p-2">Create Food</button>
      </form>
    </div>
  );
}
