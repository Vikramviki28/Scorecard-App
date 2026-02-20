import { generateId } from '../utils/helpers';
import { Team } from './Team';
import { Innings } from './Innings';
import { MATCH_STATUS, MATCH_TYPES, DEFAULT_CONFIG } from '../utils/constants';

/**
 * Match model representing a complete cricket match
 */
export class Match {
  constructor() {
    this.id = generateId();
    this.timestamp = new Date();
    this.config = {
      totalOvers: DEFAULT_CONFIG.TOTAL_OVERS,
      playersPerTeam: DEFAULT_CONFIG.PLAYERS_PER_TEAM,
      matchType: DEFAULT_CONFIG.MATCH_TYPE
    };
    this.teams = {
      teamA: new Team('Team A'),
      teamB: new Team('Team B')
    };
    this.toss = null; // { winner: 'teamA' | 'teamB', decision: 'bat' | 'bowl' }
    this.currentInnings = 1;
    this.innings = {
      first: null,
      second: null
    };
    this.currentState = {
      battingTeam: null,
      bowlingTeam: null,
      strikerId: null,
      nonStrikerId: null,
      bowlerId: null
    };
    this.result = null; // { winner: 'teamA' | 'teamB' | 'tie', margin: string }
    this.status = MATCH_STATUS.SETUP;
  }

  /**
   * Set match configuration
   * @param {Object} config - Match configuration
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set team names
   * @param {string} teamAName - Team A name
   * @param {string} teamBName - Team B name
   */
  setTeamNames(teamAName, teamBName) {
    this.teams.teamA.name = teamAName;
    this.teams.teamB.name = teamBName;
  }

  /**
   * Set toss result
   * @param {string} winner - 'teamA' or 'teamB'
   * @param {string} decision - 'bat' or 'bowl'
   */
  setToss(winner, decision) {
    this.toss = { winner, decision };

    // Determine batting and bowling teams for first innings
    if (decision === 'bat') {
      this.currentState.battingTeam = winner;
      this.currentState.bowlingTeam = winner === 'teamA' ? 'teamB' : 'teamA';
    } else {
      this.currentState.bowlingTeam = winner;
      this.currentState.battingTeam = winner === 'teamA' ? 'teamB' : 'teamA';
    }
  }

  /**
   * Start the match
   * @param {string} strikerId - ID of opening batsman (striker)
   * @param {string} nonStrikerId - ID of opening batsman (non-striker)
   * @param {string} bowlerId - ID of opening bowler
   */
  startMatch(strikerId, nonStrikerId, bowlerId) {
    this.currentState.strikerId = strikerId;
    this.currentState.nonStrikerId = nonStrikerId;
    this.currentState.bowlerId = bowlerId;

    // Create first innings
    const battingTeamId = this.teams[this.currentState.battingTeam].id;
    const bowlingTeamId = this.teams[this.currentState.bowlingTeam].id;

    this.innings.first = new Innings(battingTeamId, bowlingTeamId);
    this.innings.first.startNewOver(bowlerId);
    this.innings.first.startPartnership(strikerId, nonStrikerId);

    this.status = MATCH_STATUS.LIVE;
  }

  /**
   * Start second innings
   * @param {string} strikerId - ID of opening batsman (striker)
   * @param {string} nonStrikerId - ID of opening batsman (non-striker)
   * @param {string} bowlerId - ID of opening bowler
   */
  startSecondInnings(strikerId, nonStrikerId, bowlerId) {
    this.currentInnings = 2;

    // Swap batting and bowling teams
    const temp = this.currentState.battingTeam;
    this.currentState.battingTeam = this.currentState.bowlingTeam;
    this.currentState.bowlingTeam = temp;

    this.currentState.strikerId = strikerId;
    this.currentState.nonStrikerId = nonStrikerId;
    this.currentState.bowlerId = bowlerId;

    // Create second innings
    const battingTeamId = this.teams[this.currentState.battingTeam].id;
    const bowlingTeamId = this.teams[this.currentState.bowlingTeam].id;

    this.innings.second = new Innings(battingTeamId, bowlingTeamId);
    this.innings.second.startNewOver(bowlerId);
    this.innings.second.startPartnership(strikerId, nonStrikerId);

    this.status = MATCH_STATUS.LIVE;
  }

  /**
   * Get current innings
   * @returns {Innings|null}
   */
  getCurrentInnings() {
    return this.currentInnings === 1 ? this.innings.first : this.innings.second;
  }

  /**
   * Get target for second innings
   * @returns {number|null}
   */
  getTarget() {
    if (this.currentInnings === 1 || !this.innings.first) return null;
    return this.innings.first.score.runs + 1;
  }

  /**
   * Swap striker and non-striker
   */
  swapBatsmen() {
    const temp = this.currentState.strikerId;
    this.currentState.strikerId = this.currentState.nonStrikerId;
    this.currentState.nonStrikerId = temp;
  }

  /**
   * Set new batsman (after wicket)
   * @param {string} newBatsmanId - ID of new batsman
   */
  setNewBatsman(newBatsmanId) {
    this.currentState.strikerId = newBatsmanId;
  }

  /**
   * Set new bowler (after over completion)
   * @param {string} newBowlerId - ID of new bowler
   */
  setNewBowler(newBowlerId) {
    this.currentState.bowlerId = newBowlerId;
  }

  /**
   * Check if innings is complete
   * @returns {boolean}
   */
  isInningsComplete() {
    const innings = this.getCurrentInnings();
    if (!innings) return false;

    const battingTeam = this.teams[this.currentState.battingTeam];

    // All out
    if (innings.score.wickets >= battingTeam.players.length - 1) {
      return true;
    }

    // Overs completed (for limited overs match)
    if (this.config.matchType === MATCH_TYPES.LIMITED) {
      if (innings.score.overs >= this.config.totalOvers) {
        return true;
      }
    }

    // Target chased (second innings)
    if (this.currentInnings === 2) {
      const target = this.getTarget();
      if (innings.score.runs >= target) {
        return true;
      }
    }

    return false;
  }

  /**
   * Complete current innings
   */
  completeInnings() {
    if (this.currentInnings === 1) {
      this.status = MATCH_STATUS.INNINGS_BREAK;
    } else {
      this.completeMatch();
    }
  }

  /**
   * Complete the match and calculate result
   */
  completeMatch() {
    this.status = MATCH_STATUS.COMPLETED;

    const firstInnings = this.innings.first;
    const secondInnings = this.innings.second;

    if (!firstInnings || !secondInnings) {
      return;
    }

    const firstScore = firstInnings.score.runs;
    const secondScore = secondInnings.score.runs;

    if (secondScore > firstScore) {
      // Second innings team won
      const wicketsRemaining =
        this.teams[this.currentState.battingTeam].players.length -
        1 -
        secondInnings.score.wickets;

      this.result = {
        winner: this.currentState.battingTeam,
        margin: `${wicketsRemaining} wickets`
      };
    } else if (firstScore > secondScore) {
      // First innings team won
      const runsMargin = firstScore - secondScore;

      this.result = {
        winner: this.currentState.bowlingTeam,
        margin: `${runsMargin} runs`
      };
    } else {
      // Tie
      this.result = {
        winner: 'tie',
        margin: 'Match tied'
      };
    }
  }

  /**
   * Get batting team
   * @returns {Team}
   */
  getBattingTeam() {
    return this.teams[this.currentState.battingTeam];
  }

  /**
   * Get bowling team
   * @returns {Team}
   */
  getBowlingTeam() {
    return this.teams[this.currentState.bowlingTeam];
  }

  /**
   * Get Man of the Match (only from winning team)
   * @returns {{ player: Player, points: number, summary: string } | null}
   */
  getManOfMatch() {
    if (!this.result || this.result.winner === 'tie') return null;

    const winningTeam = this.teams[this.result.winner];
    if (!winningTeam) return null;

    let bestPlayer = null;
    let bestPoints = -1;

    for (const player of winningTeam.players) {
      let points = 0;
      const bat = player.battingStats;
      const bowl = player.bowlingStats;

      // Batting points
      points += bat.runs;
      points += bat.fours * 1;
      points += bat.sixes * 2;
      if (bat.balls >= 6 && bat.strikeRate > 120) points += 10;
      if (bat.runs >= 50) points += 20;
      if (bat.runs >= 30) points += 10;

      // Bowling points
      points += bowl.wickets * 25;
      if (bowl.balls >= 6) {
        const overs = bowl.balls / 6;
        const economy = bowl.runs / overs;
        if (economy < 6) points += 15;
        else if (economy < 8) points += 5;
      }
      points += bowl.maidens * 10;

      if (points > bestPoints) {
        bestPoints = points;
        bestPlayer = player;
      }
    }

    if (!bestPlayer) return null;

    // Build summary
    const parts = [];
    if (bestPlayer.battingStats.runs > 0) {
      parts.push(`${bestPlayer.battingStats.runs}(${bestPlayer.battingStats.balls})`);
    }
    if (bestPlayer.bowlingStats.wickets > 0) {
      parts.push(`${bestPlayer.bowlingStats.wickets}/${bestPlayer.bowlingStats.runs}`);
    }

    return {
      player: bestPlayer,
      points: bestPoints,
      summary: parts.join(' & ') || 'Team contribution'
    };
  }

  /**
   * Convert match to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp.toISOString(),
      config: { ...this.config },
      teams: {
        teamA: this.teams.teamA.toJSON(),
        teamB: this.teams.teamB.toJSON()
      },
      toss: this.toss,
      currentInnings: this.currentInnings,
      innings: {
        first: this.innings.first ? this.innings.first.toJSON() : null,
        second: this.innings.second ? this.innings.second.toJSON() : null
      },
      currentState: { ...this.currentState },
      result: this.result,
      status: this.status
    };
  }

  /**
   * Create Match instance from plain object
   * @param {Object} data - Match data
   * @returns {Match}
   */
  static fromJSON(data) {
    const match = new Match();
    match.id = data.id;
    match.timestamp = new Date(data.timestamp);
    match.config = { ...data.config };
    match.teams = {
      teamA: Team.fromJSON(data.teams.teamA),
      teamB: Team.fromJSON(data.teams.teamB)
    };
    match.toss = data.toss;
    match.currentInnings = data.currentInnings;
    match.innings = {
      first: data.innings.first ? Innings.fromJSON(data.innings.first) : null,
      second: data.innings.second ? Innings.fromJSON(data.innings.second) : null
    };
    match.currentState = { ...data.currentState };
    match.result = data.result;
    match.status = data.status;
    return match;
  }
}
