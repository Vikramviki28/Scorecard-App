import { Over } from './Over';
import { Partnership } from './Partnership';
import { ballsToOvers } from '../utils/helpers';

/**
 * Innings model representing one team's batting innings
 */
export class Innings {
  constructor(battingTeamId, bowlingTeamId) {
    this.battingTeamId = battingTeamId;
    this.bowlingTeamId = bowlingTeamId;
    this.overs = [];
    this.currentOver = null;
    this.score = {
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0
    };
    this.extras = {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      total: 0
    };
    this.partnerships = [];
    this.fallOfWickets = [];
    this.currentPartnership = null;
  }

  /**
   * Start a new over
   * @param {string} bowlerId - ID of the bowler
   */
  startNewOver(bowlerId) {
    const overNumber = this.overs.length + 1;
    this.currentOver = new Over(bowlerId, overNumber);
  }

  /**
   * Add a ball to the current over
   * @param {Ball} ball - Ball instance
   */
  addBall(ball) {
    if (!this.currentOver) {
      throw new Error('No current over. Start a new over first.');
    }

    this.currentOver.addBall(ball);

    // Update score
    if (ball.isNoBall) {
      // No-ball: batsman runs + 1 penalty run
      this.score.runs += ball.runs + 1;
    } else {
      this.score.runs += ball.runs;
    }

    // Update balls count (only for valid balls)
    if (ball.isValidBall()) {
      this.score.balls += 1;
      this.score.overs = ballsToOvers(this.score.balls);
    }

    // Update extras
    if (ball.isWide) {
      this.extras.wides += ball.runs;
      this.extras.total += ball.runs;
    }
    if (ball.isNoBall) {
      this.extras.noBalls += 1; // Only the 1-run penalty
      this.extras.total += 1;
    }
    if (ball.isBye) {
      this.extras.byes += ball.runs;
      this.extras.total += ball.runs;
    }
    if (ball.isLegBye) {
      this.extras.legByes += ball.runs;
      this.extras.total += ball.runs;
    }

    // Update current partnership
    if (this.currentPartnership) {
      this.currentPartnership.addRuns(ball.runs, ball.isValidBall());
    }

    // Handle wicket
    if (ball.isWicket) {
      this.score.wickets += 1;
      this.addFallOfWicket(ball);

      // End current partnership
      if (this.currentPartnership) {
        this.currentPartnership.endPartnership(this.score.runs);
      }
    }

    // Check if over is complete
    if (this.currentOver.isOverComplete()) {
      this.completeOver();
    }
  }

  /**
   * Complete the current over
   */
  completeOver() {
    if (this.currentOver) {
      this.overs.push(this.currentOver);
      this.currentOver = null;
    }
  }

  /**
   * Remove the last ball (for undo functionality)
   * @returns {Ball|null}
   */
  removeLastBall() {
    if (!this.currentOver || this.currentOver.balls.length === 0) {
      // Check if we need to reopen the last completed over
      if (this.overs.length > 0) {
        this.currentOver = this.overs.pop();
      } else {
        return null;
      }
    }

    const lastBall = this.currentOver.removeLastBall();
    if (!lastBall) return null;

    // Update score
    if (lastBall.isNoBall) {
      this.score.runs -= (lastBall.runs + 1);
    } else {
      this.score.runs -= lastBall.runs;
    }

    if (lastBall.isValidBall()) {
      this.score.balls -= 1;
      this.score.overs = ballsToOvers(this.score.balls);
    }

    // Update extras
    if (lastBall.isWide) {
      this.extras.wides -= lastBall.runs;
      this.extras.total -= lastBall.runs;
    }
    if (lastBall.isNoBall) {
      this.extras.noBalls -= 1;
      this.extras.total -= 1;
    }
    if (lastBall.isBye) {
      this.extras.byes -= lastBall.runs;
      this.extras.total -= lastBall.runs;
    }
    if (lastBall.isLegBye) {
      this.extras.legByes -= lastBall.runs;
      this.extras.total -= lastBall.runs;
    }

    // Update current partnership
    if (this.currentPartnership) {
      this.currentPartnership.runs -= lastBall.runs;
      if (lastBall.isValidBall()) {
        this.currentPartnership.balls -= 1;
      }
    }

    // Handle wicket removal
    if (lastBall.isWicket) {
      this.score.wickets -= 1;
      this.fallOfWickets.pop();

      // Restore previous partnership
      if (this.partnerships.length > 0) {
        this.currentPartnership = this.partnerships.pop();
        this.currentPartnership.isActive = true;
        this.currentPartnership.endScore = null;
      }
    }

    return lastBall;
  }

  /**
   * Start a new partnership
   * @param {string} batsman1Id - First batsman ID
   * @param {string} batsman2Id - Second batsman ID
   */
  startPartnership(batsman1Id, batsman2Id) {
    const wicketNumber = this.score.wickets + 1;
    this.currentPartnership = new Partnership(
      batsman1Id,
      batsman2Id,
      wicketNumber,
      this.score.runs
    );
  }

  /**
   * Add fall of wicket record
   * @param {Ball} ball - Ball on which wicket fell
   */
  addFallOfWicket(ball) {
    this.fallOfWickets.push({
      runs: this.score.runs,
      wickets: this.score.wickets,
      overs: this.score.overs,
      batsmanId: ball.batsmanId,
      bowlerId: ball.bowlerId,
      wicketType: ball.wicketType,
      fielderId: ball.fielderId
    });

    // Archive current partnership
    if (this.currentPartnership) {
      this.partnerships.push(this.currentPartnership);
      this.currentPartnership = null;
    }
  }

  /**
   * Get current run rate
   * @returns {number}
   */
  getCurrentRunRate() {
    if (this.score.balls === 0) return 0;
    const overs = this.score.balls / 6;
    return parseFloat((this.score.runs / overs).toFixed(2));
  }

  /**
   * Convert innings to plain object for storage
   */
  toJSON() {
    return {
      battingTeamId: this.battingTeamId,
      bowlingTeamId: this.bowlingTeamId,
      overs: this.overs.map(over => over.toJSON()),
      currentOver: this.currentOver ? this.currentOver.toJSON() : null,
      score: { ...this.score },
      extras: { ...this.extras },
      partnerships: this.partnerships.map(p => p.toJSON()),
      currentPartnership: this.currentPartnership ? this.currentPartnership.toJSON() : null,
      fallOfWickets: [...this.fallOfWickets]
    };
  }

  /**
   * Create Innings instance from plain object
   * @param {Object} data - Innings data
   * @returns {Innings}
   */
  static fromJSON(data) {
    const innings = new Innings(data.battingTeamId, data.bowlingTeamId);
    innings.overs = data.overs.map(overData => Over.fromJSON(overData));
    innings.currentOver = data.currentOver ? Over.fromJSON(data.currentOver) : null;
    innings.score = { ...data.score };
    innings.extras = { ...data.extras };
    innings.partnerships = data.partnerships.map(p => Partnership.fromJSON(p));
    innings.currentPartnership = data.currentPartnership
      ? Partnership.fromJSON(data.currentPartnership)
      : null;
    innings.fallOfWickets = [...data.fallOfWickets];
    return innings;
  }
}
