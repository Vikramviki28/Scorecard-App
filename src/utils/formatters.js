import { format } from 'date-fns';
import { ballsToOvers } from './helpers';

/**
 * Format overs display (e.g., "5.4" for 5 overs 4 balls)
 * @param {number} overs - Overs in decimal format
 * @returns {string} Formatted overs
 */
export const formatOvers = (overs) => {
  if (overs === 0) return '0.0';
  return overs.toFixed(1);
};

/**
 * Format strike rate
 * @param {number} runs - Runs scored
 * @param {number} balls - Balls faced
 * @returns {string} Strike rate formatted to 2 decimals
 */
export const formatStrikeRate = (runs, balls) => {
  if (balls === 0) return '0.00';
  return ((runs / balls) * 100).toFixed(2);
};

/**
 * Format economy rate
 * @param {number} runs - Runs conceded
 * @param {number} balls - Balls bowled
 * @returns {string} Economy rate formatted to 2 decimals
 */
export const formatEconomyRate = (runs, balls) => {
  if (balls === 0) return '0.00';
  const overs = balls / 6;
  return (runs / overs).toFixed(2);
};

/**
 * Format run rate (current run rate)
 * @param {number} runs - Total runs
 * @param {number} balls - Total balls
 * @returns {string} Run rate formatted to 2 decimals
 */
export const formatRunRate = (runs, balls) => {
  if (balls === 0) return '0.00';
  const overs = balls / 6;
  return (runs / overs).toFixed(2);
};

/**
 * Format bowling figures (O-M-R-W)
 * @param {Object} stats - Bowling stats
 * @returns {string} Formatted figures
 */
export const formatBowlingFigures = (stats) => {
  const overs = ballsToOvers(stats.balls);
  return `${formatOvers(overs)}-${stats.maidens}-${stats.runs}-${stats.wickets}`;
};

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} formatString - Date format string
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
};

/**
 * Format match score (e.g., "150/5 (10 overs)")
 * @param {Object} score - Score object with runs, wickets, overs
 * @returns {string} Formatted score
 */
export const formatMatchScore = (score) => {
  return `${score.runs}/${score.wickets} (${formatOvers(score.overs)} overs)`;
};

/**
 * Format player name (capitalize first letters)
 * @param {string} name - Player name
 * @returns {string} Formatted name
 */
export const formatPlayerName = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
