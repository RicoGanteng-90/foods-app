import api from "./axios";
import axios from "axios";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const axiosPrivate = (accessToken, setAccessToken) => {
  const requestIntercept = api.interceptors.request.use(
    (config) => {
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  const responseIntercept = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const prevRequest = error.config;

      if (error.response.status === 401 && !prevRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              prevRequest.headers.Authorization = `Bearer ${token}`;
              return api(prevRequest);
            })
            .catch((error) => Promise.reject(error));
        }

        prevRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post(
            "http://localhost:5000/api/auth/refresh",
            {},
            { withCredentials: true },
          );

          const newAccessToken = data.result;
          setAccessToken(newAccessToken);

          processQueue(null, newAccessToken);
          isRefreshing = false;

          prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(prevRequest);
        } catch (err) {
          processQueue(err, null);
          isRefreshing = false;

          setAccessToken(null);
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    },
  );

  return { requestIntercept, responseIntercept };
};

export default axiosPrivate;
