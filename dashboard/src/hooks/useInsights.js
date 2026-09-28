import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { mockStats, mockInsights, mockRecommendations } from '../utils/mockData';

export const useInsights = () => {
  const [data, setData] = useState({
    stats: mockStats,
    insights: mockInsights,
    recommendations: mockRecommendations,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Try to fetch from real API, fallback to mock data on failure
      const [statsRes, insightsRes, recsRes] = await Promise.all([
        axios.get('/api/stats').catch(() => ({ data: mockStats })),
        axios.get('/api/insights').catch(() => ({ data: mockInsights })),
        axios.get('/api/recommendations').catch(() => ({ data: mockRecommendations }))
      ]);

      setData({
        stats: statsRes.data,
        insights: insightsRes.data,
        recommendations: recsRes.data
      });
      setError(null);
    } catch (err) {
      console.error("Failed to fetch insights", err);
      setError("Failed to connect to real-time data source. Using fallback data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return { ...data, loading, error, refresh: fetchData };
};
