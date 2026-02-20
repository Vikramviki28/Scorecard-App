/**
 * Partnership model representing runs scored between two batsmen
 */
export class Partnership {
  constructor(batsman1Id, batsman2Id, wicketNumber, startScore) {
    this.batsman1Id = batsman1Id;
    this.batsman2Id = batsman2Id;
    this.wicketNumber = wicketNumber; // 1st wicket, 2nd wicket, etc.
    this.runs = 0;
    this.balls = 0;
    this.startScore = startScore; // Score when partnership started
    this.endScore = null; // Score when partnership ended
    this.isActive = true;
  }

  /**
   * Add runs to the partnership
   * @param {number} runs - Runs scored
   * @param {boolean} isValidBall - Whether it's a valid ball
   */
  addRuns(runs, isValidBall = true) {
    this.runs += runs;
    if (isValidBall) {
      this.balls += 1;
    }
  }

  /**
   * End the partnership
   * @param {number} endScore - Total score when partnership ended
   */
  endPartnership(endScore) {
    this.isActive = false;
    this.endScore = endScore;
  }

  /**
   * Get partnership run rate
   * @returns {number}
   */
  getRunRate() {
    if (this.balls === 0) return 0;
    const overs = this.balls / 6;
    return parseFloat((this.runs / overs).toFixed(2));
  }

  /**
   * Convert partnership to plain object for storage
   */
  toJSON() {
    return {
      batsman1Id: this.batsman1Id,
      batsman2Id: this.batsman2Id,
      wicketNumber: this.wicketNumber,
      runs: this.runs,
      balls: this.balls,
      startScore: this.startScore,
      endScore: this.endScore,
      isActive: this.isActive
    };
  }

  /**
   * Create Partnership instance from plain object
   * @param {Object} data - Partnership data
   * @returns {Partnership}
   */
  static fromJSON(data) {
    const partnership = new Partnership(
      data.batsman1Id,
      data.batsman2Id,
      data.wicketNumber,
      data.startScore
    );
    partnership.runs = data.runs;
    partnership.balls = data.balls;
    partnership.endScore = data.endScore;
    partnership.isActive = data.isActive;
    return partnership;
  }
}
