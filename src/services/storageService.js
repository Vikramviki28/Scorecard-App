import { STORAGE_KEYS } from '../utils/constants';
import { Match } from '../models/Match';

/**
 * Storage Service for managing localStorage operations
 */

/**
 * Save current match to localStorage
 * @param {Match} match - Current match object
 */
export const saveCurrentMatch = (match) => {
  try {
    const matchData = match.toJSON();
    localStorage.setItem(STORAGE_KEYS.CURRENT_MATCH, JSON.stringify(matchData));
    return true;
  } catch (error) {
    console.error('Error saving current match:', error);
    return false;
  }
};

/**
 * Load current match from localStorage
 * @returns {Match|null}
 */
export const loadCurrentMatch = () => {
  try {
    const matchData = localStorage.getItem(STORAGE_KEYS.CURRENT_MATCH);
    if (!matchData) return null;

    const parsedData = JSON.parse(matchData);
    return Match.fromJSON(parsedData);
  } catch (error) {
    console.error('Error loading current match:', error);
    return null;
  }
};

/**
 * Clear current match from localStorage
 */
export const clearCurrentMatch = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_MATCH);
    return true;
  } catch (error) {
    console.error('Error clearing current match:', error);
    return false;
  }
};

/**
 * Save completed match to history
 * @param {Match} match - Completed match object
 */
export const saveMatchToHistory = (match) => {
  try {
    const history = loadMatchHistory();
    const matchData = match.toJSON();

    // Add to beginning of array (most recent first)
    history.unshift(matchData);

    // Limit history to 100 matches
    const limitedHistory = history.slice(0, 100);

    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(limitedHistory));

    // Clear current match
    clearCurrentMatch();

    return true;
  } catch (error) {
    console.error('Error saving match to history:', error);
    return false;
  }
};

/**
 * Load match history from localStorage
 * @returns {Array<Object>} Array of match data objects
 */
export const loadMatchHistory = () => {
  try {
    const historyData = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
    if (!historyData) return [];

    return JSON.parse(historyData);
  } catch (error) {
    console.error('Error loading match history:', error);
    return [];
  }
};

/**
 * Get a specific match from history by ID
 * @param {string} matchId - ID of the match
 * @returns {Match|null}
 */
export const getMatchFromHistory = (matchId) => {
  try {
    const history = loadMatchHistory();
    const matchData = history.find(m => m.id === matchId);

    if (!matchData) return null;

    return Match.fromJSON(matchData);
  } catch (error) {
    console.error('Error getting match from history:', error);
    return null;
  }
};

/**
 * Delete a match from history
 * @param {string} matchId - ID of the match to delete
 */
export const deleteMatchFromHistory = (matchId) => {
  try {
    const history = loadMatchHistory();
    const updatedHistory = history.filter(m => m.id !== matchId);

    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error deleting match from history:', error);
    return false;
  }
};

/**
 * Clear all match history
 */
export const clearMatchHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.MATCH_HISTORY);
    return true;
  } catch (error) {
    console.error('Error clearing match history:', error);
    return false;
  }
};

/**
 * Save app settings to localStorage
 * @param {Object} settings - Settings object
 */
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Load app settings from localStorage
 * @returns {Object} Settings object
 */
export const loadSettings = () => {
  try {
    const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!settingsData) {
      // Return default settings
      return {
        theme: 'light',
        defaultOvers: 10,
        defaultPlayersPerTeam: 11,
        soundEnabled: false,
        confirmBeforeWicket: true
      };
    }

    return JSON.parse(settingsData);
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      theme: 'light',
      defaultOvers: 10,
      defaultPlayersPerTeam: 11,
      soundEnabled: false,
      confirmBeforeWicket: true
    };
  }
};

/**
 * Save player names for autocomplete
 * @param {Array<string>} players - Array of player names
 */
export const savePlayerNames = (players) => {
  try {
    const existingPlayers = loadPlayerNames();
    const allPlayers = [...new Set([...existingPlayers, ...players])];

    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(allPlayers));
    return true;
  } catch (error) {
    console.error('Error saving player names:', error);
    return false;
  }
};

/**
 * Load saved player names
 * @returns {Array<string>} Array of player names
 */
export const loadPlayerNames = () => {
  try {
    const playersData = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (!playersData) return [];

    return JSON.parse(playersData);
  } catch (error) {
    console.error('Error loading player names:', error);
    return [];
  }
};

/**
 * Export match data as JSON
 * @param {Match} match - Match to export
 * @returns {string} JSON string
 */
export const exportMatchAsJSON = (match) => {
  try {
    const matchData = match.toJSON();
    return JSON.stringify(matchData, null, 2);
  } catch (error) {
    console.error('Error exporting match:', error);
    return null;
  }
};

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};
