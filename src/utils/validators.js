import { DEFAULT_CONFIG } from './constants';

/**
 * Validate team name
 * @param {string} name - Team name
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export const validateTeamName = (name) => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Team name is required' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Team name must be at least 2 characters' };
  }
  if (name.trim().length > 30) {
    return { valid: false, error: 'Team name must be less than 30 characters' };
  }
  return { valid: true, error: null };
};

/**
 * Validate player name
 * @param {string} name - Player name
 * @returns {Object} Validation result
 */
export const validatePlayerName = (name) => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Player name is required' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Player name must be at least 2 characters' };
  }
  if (name.trim().length > 25) {
    return { valid: false, error: 'Player name must be less than 25 characters' };
  }
  return { valid: true, error: null };
};

/**
 * Validate number of overs
 * @param {number} overs - Number of overs
 * @returns {Object} Validation result
 */
export const validateOvers = (overs) => {
  if (!overs || overs <= 0) {
    return { valid: false, error: 'Overs must be greater than 0' };
  }
  if (overs > 50) {
    return { valid: false, error: 'Overs cannot exceed 50' };
  }
  if (!Number.isInteger(overs)) {
    return { valid: false, error: 'Overs must be a whole number' };
  }
  return { valid: true, error: null };
};

/**
 * Validate team size
 * @param {number} size - Number of players
 * @returns {Object} Validation result
 */
export const validateTeamSize = (size) => {
  if (!size || size < DEFAULT_CONFIG.MIN_PLAYERS) {
    return { valid: false, error: `Team must have at least ${DEFAULT_CONFIG.MIN_PLAYERS} players` };
  }
  if (size > DEFAULT_CONFIG.MAX_PLAYERS) {
    return { valid: false, error: `Team cannot have more than ${DEFAULT_CONFIG.MAX_PLAYERS} players` };
  }
  return { valid: true, error: null };
};

/**
 * Validate runs input
 * @param {number} runs - Runs to validate
 * @returns {Object} Validation result
 */
export const validateRuns = (runs) => {
  if (runs < 0) {
    return { valid: false, error: 'Runs cannot be negative' };
  }
  if (runs > 6) {
    return { valid: false, error: 'Runs cannot exceed 6' };
  }
  return { valid: true, error: null };
};

/**
 * Check if teams have duplicate player names
 * @param {Array} team1Players - Team 1 player names
 * @param {Array} team2Players - Team 2 player names
 * @returns {Object} Validation result
 */
export const validateNoDuplicatePlayers = (team1Players, team2Players) => {
  const allPlayers = [...team1Players, ...team2Players];
  const uniquePlayers = new Set(allPlayers.map(p => p.toLowerCase().trim()));

  if (uniquePlayers.size !== allPlayers.length) {
    return { valid: false, error: 'Duplicate player names found' };
  }
  return { valid: true, error: null };
};
