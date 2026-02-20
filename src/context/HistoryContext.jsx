import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loadMatchHistory,
  getMatchFromHistory,
  deleteMatchFromHistory,
  clearMatchHistory
} from '../services/storageService';

const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    teams: []
  });

  // Load match history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const history = loadMatchHistory();
    setMatches(history);
  };

  const getMatch = (matchId) => {
    return getMatchFromHistory(matchId);
  };

  const deleteMatch = (matchId) => {
    const success = deleteMatchFromHistory(matchId);
    if (success) {
      loadHistory(); // Reload history
    }
    return success;
  };

  const clearHistory = () => {
    const success = clearMatchHistory();
    if (success) {
      setMatches([]);
    }
    return success;
  };

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const getFilteredMatches = () => {
    let filtered = [...matches];

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.timestamp);

        if (filters.dateRange.start && matchDate < new Date(filters.dateRange.start)) {
          return false;
        }

        if (filters.dateRange.end && matchDate > new Date(filters.dateRange.end)) {
          return false;
        }

        return true;
      });
    }

    // Filter by teams
    if (filters.teams.length > 0) {
      filtered = filtered.filter(match => {
        const teamNames = [match.teams.teamA.name, match.teams.teamB.name];
        return filters.teams.some(team => teamNames.includes(team));
      });
    }

    return filtered;
  };

  const value = {
    matches,
    loadHistory,
    getMatch,
    deleteMatch,
    clearHistory,
    filters,
    updateFilters,
    getFilteredMatches
  };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
