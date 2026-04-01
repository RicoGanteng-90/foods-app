'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function Foods() {
  const { accessToken, setAccessToken } = useAuth();

  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState('');

  const accessTokenRef = useRef(accessToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFoods = async () => {
      try {
        const res = await apiFetch(
          `/foods?page=${page}&limit=${limit}&search=${search}`,
          {
            method: 'GET',
            signal: controller.signal,
          },
          accessTokenRef.current,
          setAccessToken
        );

        const data = await res.json();

        if (!res.ok) {
          return setError(data.message);
        }

        setFoods(data.foods);
        setTotalPages(data.totalPages);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('Connection problem');
      }
    };

    const delayBounceFn = setTimeout(() => {
      fetchFoods();
    }, 500);

    return () => {
      clearTimeout(delayBounceFn);
      controller.abort();
    };
  }, [search, page, limit, setAccessToken]);

  const handleDelete = async (id) => {
    const confirmDelete = confirm('Delete this food?');

    if (!confirmDelete) return;

    await apiFetch(
      `/foods/${id}`,
      { method: 'DELETE' },
      accessTokenRef.current,
      setAccessToken
    );

    setFoods((prev) => prev.filter((food) => food._id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Foods</h1>
      <input
        type="text"
        placeholder="Search"
        className="border p-2 mb-3"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />
      <Link
        href="/dashboard/foods/create"
        className="bg-gray-700 text-white px-4 py-2 mb-3 ml-4 inline-block rounded-2xl"
      >
        Add food
      </Link>
      <table className="border w-full">
        <thead>
          <tr className="bg-gray-200">
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food._id}>
              <td className="border p-2">{food.name}</td>
              <td className="border p-2">{food.price}</td>
              <td className="border p-2">{food.category?.name || '-'}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(food._id)}
                  className="bg-red-600 text-white px-2 py-1"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex gap-2 items-center">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span>
          page {page} / {totalPages || 1}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
