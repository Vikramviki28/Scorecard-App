import { generateId } from '../utils/helpers';

/**
 * Player model representing a cricket player with batting and bowling statistics
 */
export class Player {
  constructor(name) {
    this.id = generateId();
    this.name = name;
    this.battingStats = {
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
      dismissalType: null,
      dismissedBy: null,
      fielder: null
    };
    this.bowlingStats = {
      overs: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      economyRate: 0,
      balls: 0
    };
  }

  /**
   * Update batting statistics
   * @param {number} runs - Runs scored
   * @param {boolean} isBoundary - Whether it's a boundary (4 or 6)
   */
  addRuns(runs) {
    this.battingStats.runs += runs;
    this.battingStats.balls += 1;

    if (runs === 4) this.battingStats.fours += 1;
    if (runs === 6) this.battingStats.sixes += 1;

    this.updateStrikeRate();
  }

  /**
   * Update strike rate
   */
  updateStrikeRate() {
    if (this.battingStats.balls === 0) {
      this.battingStats.strikeRate = 0;
    } else {
      this.battingStats.strikeRate = parseFloat(
        ((this.battingStats.runs / this.battingStats.balls) * 100).toFixed(2)
      );
    }
  }

  /**
   * Mark player as out
   * @param {string} dismissalType - Type of dismissal
   * @param {string} dismissedBy - Player who got the wicket (bowler)
   * @param {string} fielder - Fielder involved (if applicable)
   */
  setOut(dismissalType, dismissedBy = null, fielder = null) {
    this.battingStats.isOut = true;
    this.battingStats.dismissalType = dismissalType;
    this.battingStats.dismissedBy = dismissedBy;
    this.battingStats.fielder = fielder;
  }

  /**
   * Add bowling statistics
   * @param {number} runs - Runs conceded
   * @param {boolean} isWicket - Whether a wicket was taken
   * @param {boolean} isValidBall - Whether it's a valid ball (not wide/no-ball)
   */
  addBowlingStats(runs, isWicket = false, isValidBall = true) {
    this.bowlingStats.runs += runs;

    if (isValidBall) {
      this.bowlingStats.balls += 1;
      this.bowlingStats.overs = this.bowlingStats.balls / 6;
    }

    if (isWicket) {
      this.bowlingStats.wickets += 1;
    }

    this.updateEconomyRate();
  }

  /**
   * Update economy rate
   */
  updateEconomyRate() {
    if (this.bowlingStats.balls === 0) {
      this.bowlingStats.economyRate = 0;
    } else {
      const overs = this.bowlingStats.balls / 6;
      this.bowlingStats.economyRate = parseFloat(
        (this.bowlingStats.runs / overs).toFixed(2)
      );
    }
  }

  /**
   * Check if bowler completed a maiden over
   * @param {number} runsInOver - Runs conceded in the over
   * @returns {boolean}
   */
  checkMaiden(runsInOver) {
    if (runsInOver === 0) {
      this.bowlingStats.maidens += 1;
      return true;
    }
    return false;
  }

  /**
   * Convert player to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      battingStats: { ...this.battingStats },
      bowlingStats: { ...this.bowlingStats }
    };
  }

  /**
   * Create Player instance from plain object
   * @param {Object} data - Player data
   * @returns {Player}
   */
  static fromJSON(data) {
    const player = new Player(data.name);
    player.id = data.id;
    player.battingStats = { ...data.battingStats };
    player.bowlingStats = { ...data.bowlingStats };
    return player;
  }
}
