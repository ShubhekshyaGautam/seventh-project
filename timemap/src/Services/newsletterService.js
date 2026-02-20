import { API_URL } from "./api";

export const subscribeNewsletter = async (email) => {
  const res = await fetch(`${API_URL}/newsletter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  if (!res.ok) throw new Error("Failed");
  return res.json();
};
