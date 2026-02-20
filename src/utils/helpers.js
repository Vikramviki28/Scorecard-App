/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Calculate total overs from balls
 * @param {number} balls - Total balls bowled
 * @returns {number} Overs (e.g., 5.4 for 5 overs 4 balls)
 */
export const ballsToOvers = (balls) => {
  const completeOvers = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return parseFloat(`${completeOvers}.${remainingBalls}`);
};

/**
 * Convert overs to balls
 * @param {number} overs - Overs in decimal format (e.g., 5.4)
 * @returns {number} Total balls
 */
export const oversToBalls = (overs) => {
  const completeOvers = Math.floor(overs);
  const remainingBalls = Math.round((overs - completeOvers) * 10);
  return completeOvers * 6 + remainingBalls;
};
