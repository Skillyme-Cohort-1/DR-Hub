import { BACKEND_URL } from "../utils/constants";
export const API_BASE_URL = BACKEND_URL.endsWith("/") ? BACKEND_URL.slice(0, -1) : BACKEND_URL;

export async function apiFetch(path, { token, method = "GET", body, headers = {} } = {}) {
  const config = {
    method,
    headers: { Accept: "*/*", ...headers },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(body);
  } else if (body) {
    config.body = body;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.message || `Request failed (${response.status})`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
