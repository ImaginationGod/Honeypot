import api from "./api";

export async function getAnalytics() {
  try {
    const res = await api.get("/analytics");
    return res.data.data;
  } catch (error) {
    console.warn("Analytics API unavailable.");
    return null; // fallback
  }
}
