'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const { acceessToken, setAccessToken } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await apiFetch(
        '/users',
        { method: 'GET' },
        acceessToken,
        setAccessToken
      );

      const data = await res.json();
      setUsers(data.users);
    };

    fetchUsers();

    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-4">Users</h1>

      <table className="border w-full">
        <thead>
          <tr className="bg-gray-200 text-black">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
