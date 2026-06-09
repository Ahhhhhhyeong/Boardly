export const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000") as string;

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiPatch<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiDelete<T = unknown>(path: string): Promise<T | null> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 204) return null;
  return handleResponse(res);
}
