import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axiosPrivate from "../api/axiosPrivate";
import api from "../api/axios";
import axios from "axios";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyRefresh = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:5000/api/auth/verify-refresh",
          {},
          { withCredentials: true },
        );

        const { result: accessToken, user } = data;

        setAccessToken(accessToken);
        setUser(user);
      } catch (err) {
        console.log("Refresh failed:", err.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    !accessToken ? verifyRefresh() : setLoading(false);
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const { requestIntercept, responseIntercept } = axiosPrivate(
      accessToken,
      setAccessToken,
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken]);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      setAccessToken(null);
      navigate("login");
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      accessToken,
      setAccessToken,
      login,
      logout,
    }),
    [accessToken, user, loading],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
