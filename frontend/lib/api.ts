// lib/api.ts
export const API_BASE = String(process.env.NEXT_PUBLIC_API_BASE);

console.log(API_BASE, "API_BASE");

export async function fetchAPI(
  path: string,
  options: RequestInit = {},
  token?: string
) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
