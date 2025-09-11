import { API_BASE } from "../config/constants";

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/api/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  const data = await res.json();
  return data.data;
}

export async function createEvent(event, adminSecret) {
  const res = await fetch(`${API_BASE}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": adminSecret // temporary dev auth
    },
    body: JSON.stringify(event)
  });
  const data = await res.json();
  return data;
}
