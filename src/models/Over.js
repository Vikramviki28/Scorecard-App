import { Ball } from './Ball';

/**
 * Over model representing 6 legal deliveries
 */
export class Over {
  constructor(bowlerId, overNumber) {
    this.bowlerId = bowlerId;
    this.overNumber = overNumber;
    this.balls = [];
    this.runs = 0;
    this.wickets = 0;
    this.isComplete = false;
    this.isMaiden = false;
  }

  /**
   * Add a ball to the over
   * @param {Ball} ball - Ball instance
   */
  addBall(ball) {
    this.balls.push(ball);
    // No-ball: batsman runs + 1 penalty
    this.runs += ball.isNoBall ? ball.runs + 1 : ball.runs;

    if (ball.isWicket) {
      this.wickets += 1;
    }

    // Check if over is complete (6 valid balls)
    if (this.getValidBallsCount() === 6) {
      this.isComplete = true;
      // Check for maiden over
      if (this.runs === 0) {
        this.isMaiden = true;
      }
    }
  }

  /**
   * Remove the last ball from the over
   * @returns {Ball|null} The removed ball or null if no balls
   */
  removeLastBall() {
    if (this.balls.length === 0) return null;

    const lastBall = this.balls.pop();
    this.runs -= lastBall.isNoBall ? lastBall.runs + 1 : lastBall.runs;

    if (lastBall.isWicket) {
      this.wickets -= 1;
    }

    this.isComplete = false;
    this.isMaiden = false;

    return lastBall;
  }

  /**
   * Get count of valid balls (not wide or no-ball)
   * @returns {number}
   */
  getValidBallsCount() {
    return this.balls.filter(ball => ball.isValidBall()).length;
  }

  /**
   * Get total balls bowled (including extras)
   * @returns {number}
   */
  getTotalBalls() {
    return this.balls.length;
  }

  /**
   * Get over summary for display
   * @returns {Array<string>}
   */
  getSummary() {
    return this.balls.map(ball => ball.getDisplayString());
  }

  /**
   * Check if over is complete
   * @returns {boolean}
   */
  isOverComplete() {
    return this.isComplete;
  }

  /**
   * Convert over to plain object for storage
   */
  toJSON() {
    return {
      bowlerId: this.bowlerId,
      overNumber: this.overNumber,
      balls: this.balls.map(ball => ball.toJSON()),
      runs: this.runs,
      wickets: this.wickets,
      isComplete: this.isComplete,
      isMaiden: this.isMaiden
    };
  }

  /**
   * Create Over instance from plain object
   * @param {Object} data - Over data
   * @returns {Over}
   */
  static fromJSON(data) {
    const over = new Over(data.bowlerId, data.overNumber);
    over.balls = data.balls.map(ballData => Ball.fromJSON(ballData));
    over.runs = data.runs;
    over.wickets = data.wickets;
    over.isComplete = data.isComplete;
    over.isMaiden = data.isMaiden;
    return over;
  }
}
