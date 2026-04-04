'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white p-5">
      <h1 className="text-xl mb-6">Admin Panel</h1>

      <div className="flex flex-col gap-3">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/foods">Foods</Link>
        <Link href="/dashboard/categories">Categories</Link>
        <Link href="/dashboard/orders">Orders</Link>
        <Link href="/dashboard/users">Users</Link>
      </div>
    </div>
  );
}
