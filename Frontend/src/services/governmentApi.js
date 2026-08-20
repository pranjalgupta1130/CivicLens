const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchWithTimeout(url, options = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const governmentApi = {
  // Get dashboard summary KPIs
  async getDashboardSummary() {
    try {
      return await fetchWithTimeout(`${BASE_URL}/dashboard/summary`);
    } catch (error) {
      console.warn("Backend unavailable, using fallback mock for dashboard summary:", error.message);
      return null;
    }
  },

  // Get department budget ledgers
  async getDepartments() {
    try {
      return await fetchWithTimeout(`${BASE_URL}/departments`);
    } catch (error) {
      console.warn("Backend unavailable, using fallback mock for departments:", error.message);
      return null;
    }
  },

  // Get anomalies / unusual spending alerts
  async getAnomalies() {
    try {
      return await fetchWithTimeout(`${BASE_URL}/anomalies`);
    } catch (error) {
      console.warn("Backend unavailable, using fallback mock for anomalies:", error.message);
      return null;
    }
  },

  // Query RAG explanation or AI assistant answer
  async askQuestion(question, language = 'en') {
    try {
      return await fetchWithTimeout(`${BASE_URL}/investigations/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language })
      });
    } catch (error) {
      console.warn("Backend unavailable, using fallback mock for AI question:", error.message);
      return null;
    }
  }
};
