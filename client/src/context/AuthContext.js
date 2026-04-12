'use client';

import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useState, useContext, createContext, useEffect } from 'react';

export function AuthProvider({ children }) {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLC_API_URL}/auth/verify-refresh`,
          {},
          { withCredentials: true }
        );

        setAccessToken(data.newAccessToken);
      } catch {
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return { children };
}
