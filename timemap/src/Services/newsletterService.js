import { API_URL } from "./api";

// ── Existing: newsletter subscription ──
export const subscribeNewsletter = async (email) => {
  const res = await fetch(`${API_URL}/newsletter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to subscribe");
  return res.json();
};

// ── New: fetch at-risk tasks for a user (for Notifications page) ──
export const checkReminders = async (userId) => {
  const res = await fetch(`${API_URL}/reminders/check/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch reminders");
  return res.json(); // { email, tasks, count }
};

// ── New: send reminder email to a specific user ──
export const sendReminder = async (userId) => {
  const res = await fetch(`${API_URL}/reminders/send/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to send reminder");
  return res.json(); // { message, tasks_flagged }
};

// ── New: trigger reminders for ALL users (admin / cron use) ──
export const sendAllReminders = async () => {
  const res = await fetch(`${API_URL}/reminders/send-all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to send all reminders");
  return res.json(); // { results: [...] }
};
