/**
 * Ball model representing a single delivery in cricket
 */
export class Ball {
  constructor(batsmanId, bowlerId) {
    this.timestamp = new Date();
    this.batsmanId = batsmanId;
    this.bowlerId = bowlerId;
    this.runs = 0;
    this.isWicket = false;
    this.wicketType = null;
    this.fielderId = null;
    this.isWide = false;
    this.isNoBall = false;
    this.isBye = false;
    this.isLegBye = false;
  }

  /**
   * Set runs scored on this ball
   * @param {number} runs - Runs scored
   */
  setRuns(runs) {
    this.runs = runs;
  }

  /**
   * Mark as wicket
   * @param {string} wicketType - Type of wicket
   * @param {string} fielderId - ID of fielder (if applicable)
   */
  setWicket(wicketType, fielderId = null) {
    this.isWicket = true;
    this.wicketType = wicketType;
    this.fielderId = fielderId;
  }

  /**
   * Mark as wide
   * @param {number} additionalRuns - Additional runs scored (default 1)
   */
  setWide(additionalRuns = 1) {
    this.isWide = true;
    this.runs = additionalRuns;
  }

  /**
   * Mark as no-ball
   * @param {number} runs - Runs scored off the no-ball
   */
  setNoBall(runs = 1) {
    this.isNoBall = true;
    this.runs = runs;
  }

  /**
   * Mark as bye
   * @param {number} runs - Byes scored
   */
  setBye(runs) {
    this.isBye = true;
    this.runs = runs;
  }

  /**
   * Mark as leg-bye
   * @param {number} runs - Leg-byes scored
   */
  setLegBye(runs) {
    this.isLegBye = true;
    this.runs = runs;
  }

  /**
   * Check if this is a valid ball (counts towards over)
   * @returns {boolean}
   */
  isValidBall() {
    return !this.isWide && !this.isNoBall;
  }

  /**
   * Check if this is a boundary
   * @returns {boolean}
   */
  isBoundary() {
    return this.runs === 4 || this.runs === 6;
  }

  /**
   * Get display string for the ball (for over summary)
   * @returns {string}
   */
  getDisplayString() {
    if (this.isWicket) return 'W';
    if (this.isWide) return `${this.runs}wd`;
    if (this.isNoBall) return this.runs > 0 ? `${this.runs}+nb` : 'nb';
    if (this.isBye) return `${this.runs}b`;
    if (this.isLegBye) return `${this.runs}lb`;
    return this.runs.toString();
  }

  /**
   * Convert ball to plain object for storage
   */
  toJSON() {
    return {
      timestamp: this.timestamp.toISOString(),
      batsmanId: this.batsmanId,
      bowlerId: this.bowlerId,
      runs: this.runs,
      isWicket: this.isWicket,
      wicketType: this.wicketType,
      fielderId: this.fielderId,
      isWide: this.isWide,
      isNoBall: this.isNoBall,
      isBye: this.isBye,
      isLegBye: this.isLegBye
    };
  }

  /**
   * Create Ball instance from plain object
   * @param {Object} data - Ball data
   * @returns {Ball}
   */
  static fromJSON(data) {
    const ball = new Ball(data.batsmanId, data.bowlerId);
    ball.timestamp = new Date(data.timestamp);
    ball.runs = data.runs;
    ball.isWicket = data.isWicket;
    ball.wicketType = data.wicketType;
    ball.fielderId = data.fielderId;
    ball.isWide = data.isWide;
    ball.isNoBall = data.isNoBall;
    ball.isBye = data.isBye;
    ball.isLegBye = data.isLegBye;
    return ball;
  }
}
