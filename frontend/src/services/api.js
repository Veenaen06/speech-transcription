
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;

  return response.json();
}

export const getTranscriptions = () =>
  request("/transcriptions/");

export const createTranscription = (data) =>
  request("/transcriptions/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateTranscription = (id, data) =>
  request(`/transcriptions/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteTranscription = (id) =>
  request(`/transcriptions/${id}/`, {
    method: "DELETE",
  });
