import { supabase } from "./supabase";

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function authenticatedFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("AUTH_REQUIRED");

  return fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

