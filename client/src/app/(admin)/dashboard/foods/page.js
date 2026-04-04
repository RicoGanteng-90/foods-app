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
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [error, setError] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [previewOpen, setPreviewOpen] = useState(null);

  const accessTokenRef = useRef(accessToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

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

        setFoods(data.result);
        setTotalPages(data.pagination.totalPages);
        setHasNext(data.pagination.hasNextPage);
        setHasPrev(data.pagination.hasPrevPage);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('Connection problem');
      }
    };

    fetchFoods();
  }, [debouncedSearch, page, limit]);

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
        className="bg-gray-700 text-white px-4 py-2 mb-3 ml-4 inline-block rounded-2xl transition-transform active:scale-85"
      >
        Add food
      </Link>
      <table className="border w-full">
        <thead>
          <tr className="bg-gray-200">
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food._id}>
              <td className="border p-2">{food.name}</td>
              <td className="border p-2">{food.price}</td>
              <td className="border p-2">{food.category?.name || '-'}</td>
              <td className="border p-2 text-center align-middle">
                {food.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={food.imageUrl}
                    alt="Image"
                    className="w-16 h-16 object-cover cursor-pointer inline-block"
                    onClick={() => setPreviewOpen(food.imageUrl)}
                  />
                )}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(food._id)}
                  className="bg-red-600 text-white px-2 py-1 cursor-pointer transition-transform active:scale-90"
                >
                  Delete
                </button>
                <Link
                  className="bg-blue-600 text-white px-2 py-1 mr-2 cursor-pointer transition-transform active:scale-90"
                  href={`/dashboard/foods/edit/${food._id}`}
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex gap-2 items-center">
        <button
          disabled={!hasPrev}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span>
          page {page} / {totalPages || 1}
        </span>

        <button
          disabled={!hasNext}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {previewOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setPreviewOpen(null)}
        >
          <img
            src={previewOpen}
            alt="preview"
            className="max-w-5xl max-h-screen"
          />
        </div>
      )}
    </div>
  );
}
