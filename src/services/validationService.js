import {
  validateTeamName,
  validatePlayerName,
  validateOvers,
  validateTeamSize,
  validateRuns,
  validateNoDuplicatePlayers
} from '../utils/validators';

/**
 * Validation Service for match setup and scoring
 */

/**
 * Validate match configuration
 * @param {Object} config - Match configuration
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
export const validateMatchConfig = (config) => {
  const errors = {};

  const oversValidation = validateOvers(config.totalOvers);
  if (!oversValidation.valid) {
    errors.totalOvers = oversValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate team setup
 * @param {Object} teamData - Team data { name, players }
 * @returns {Object} Validation result
 */
export const validateTeamSetup = (teamData) => {
  const errors = {};

  // Validate team name
  const nameValidation = validateTeamName(teamData.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.error;
  }

  // Validate team size
  const sizeValidation = validateTeamSize(teamData.players.length);
  if (!sizeValidation.valid) {
    errors.players = sizeValidation.error;
  }

  // Validate individual player names
  teamData.players.forEach((playerName, index) => {
    const playerValidation = validatePlayerName(playerName);
    if (!playerValidation.valid) {
      errors[`player_${index}`] = playerValidation.error;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate both teams
 * @param {Object} team1Data - Team 1 data
 * @param {Object} team2Data - Team 2 data
 * @returns {Object} Validation result
 */
export const validateBothTeams = (team1Data, team2Data) => {
  const errors = {};

  // Validate team 1
  const team1Validation = validateTeamSetup(team1Data);
  if (!team1Validation.valid) {
    errors.team1 = team1Validation.errors;
  }

  // Validate team 2
  const team2Validation = validateTeamSetup(team2Data);
  if (!team2Validation.valid) {
    errors.team2 = team2Validation.errors;
  }

  // Check for duplicate team names
  if (team1Data.name.toLowerCase().trim() === team2Data.name.toLowerCase().trim()) {
    errors.duplicateTeamNames = 'Team names must be different';
  }

  // Check for duplicate player names across teams
  const duplicateValidation = validateNoDuplicatePlayers(
    team1Data.players,
    team2Data.players
  );
  if (!duplicateValidation.valid) {
    errors.duplicatePlayers = duplicateValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate toss selection
 * @param {Object} tossData - Toss data { winner, decision }
 * @returns {Object} Validation result
 */
export const validateToss = (tossData) => {
  const errors = {};

  if (!tossData.winner) {
    errors.winner = 'Toss winner must be selected';
  }

  if (!tossData.decision) {
    errors.decision = 'Toss decision must be selected';
  }

  if (tossData.winner && !['teamA', 'teamB'].includes(tossData.winner)) {
    errors.winner = 'Invalid toss winner';
  }

  if (tossData.decision && !['bat', 'bowl'].includes(tossData.decision)) {
    errors.decision = 'Invalid toss decision';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate opening players selection
 * @param {Object} selection - Opening players { striker, nonStriker, bowler }
 * @param {Team} battingTeam - Batting team
 * @param {Team} bowlingTeam - Bowling team
 * @returns {Object} Validation result
 */
export const validateOpeningPlayers = (selection, battingTeam, bowlingTeam) => {
  const errors = {};

  if (!selection.striker) {
    errors.striker = 'Opening batsman (striker) must be selected';
  }

  if (!selection.nonStriker) {
    errors.nonStriker = 'Opening batsman (non-striker) must be selected';
  }

  if (!selection.bowler) {
    errors.bowler = 'Opening bowler must be selected';
  }

  // Check if striker and non-striker are different
  if (selection.striker === selection.nonStriker) {
    errors.sameBatsmen = 'Striker and non-striker must be different players';
  }

  // Check if striker exists in batting team
  if (selection.striker && !battingTeam.getPlayer(selection.striker)) {
    errors.striker = 'Invalid batsman selected';
  }

  // Check if non-striker exists in batting team
  if (selection.nonStriker && !battingTeam.getPlayer(selection.nonStriker)) {
    errors.nonStriker = 'Invalid batsman selected';
  }

  // Check if bowler exists in bowling team
  if (selection.bowler && !bowlingTeam.getPlayer(selection.bowler)) {
    errors.bowler = 'Invalid bowler selected';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate run input
 * @param {number} runs - Runs scored
 * @returns {Object} Validation result
 */
export const validateRunInput = (runs) => {
  const validation = validateRuns(runs);
  return validation;
};

/**
 * Validate wicket data
 * @param {Object} wicketData - Wicket data { type, fielder, newBatsman }
 * @param {Team} battingTeam - Batting team
 * @param {Team} bowlingTeam - Bowling team
 * @returns {Object} Validation result
 */
export const validateWicket = (wicketData, battingTeam, bowlingTeam) => {
  const errors = {};

  if (!wicketData.type) {
    errors.type = 'Wicket type must be selected';
  }

  // Check if new batsman is available
  const availableBatsmen = battingTeam.getAvailableBatsmen();
  if (availableBatsmen.length === 0) {
    errors.newBatsman = 'No more batsmen available';
  }

  if (wicketData.newBatsman && !battingTeam.getPlayer(wicketData.newBatsman)) {
    errors.newBatsman = 'Invalid batsman selected';
  }

  // Validate fielder if required
  if (
    ['caught', 'run-out', 'stumped'].includes(wicketData.type) &&
    wicketData.fielder &&
    !bowlingTeam.getPlayer(wicketData.fielder)
  ) {
    errors.fielder = 'Invalid fielder selected';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate new bowler selection
 * @param {string} bowlerId - Bowler ID
 * @param {string} previousBowlerId - Previous bowler ID
 * @param {Team} bowlingTeam - Bowling team
 * @returns {Object} Validation result
 */
export const validateNewBowler = (bowlerId, previousBowlerId, bowlingTeam) => {
  const errors = {};

  if (!bowlerId) {
    errors.bowler = 'Bowler must be selected';
  }

  if (bowlerId === previousBowlerId) {
    errors.bowler = 'Bowler cannot bowl consecutive overs';
  }

  if (bowlerId && !bowlingTeam.getPlayer(bowlerId)) {
    errors.bowler = 'Invalid bowler selected';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate extra input
 * @param {Object} extraData - Extra data { type, runs }
 * @returns {Object} Validation result
 */
export const validateExtra = (extraData) => {
  const errors = {};

  if (!extraData.type) {
    errors.type = 'Extra type must be selected';
  }

  if (!['wide', 'no-ball', 'bye', 'leg-bye'].includes(extraData.type)) {
    errors.type = 'Invalid extra type';
  }

  if (extraData.runs === undefined || extraData.runs === null) {
    errors.runs = 'Runs must be specified';
  }

  if (extraData.runs < 0) {
    errors.runs = 'Runs cannot be negative';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
