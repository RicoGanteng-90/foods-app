export async function apiFetch(url, options = {}, accessToken, setAccessToken) {
  const isFormData = options.body instanceof FormData;
  let res = await fetch(`http://localhost:5000/api${url}`, {
    ...options,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
    credentials: 'include',
  });

  if (res.status === 401) {
    const refreshRes = await fetch('http://localhost:5000/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();

      setAccessToken(data.newAccessToken);

      res = await fetch(`http://localhost:5000/api${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          Authorization: `Bearer ${data.newAccessToken}`,
        },
        credentials: 'include',
      });
    } else {
      window.location.href = '/login';
    }
  } else if (res.status === 403) {
    setAccessToken(null);
    window.location.href = '/login';
  }

  return res;
}
