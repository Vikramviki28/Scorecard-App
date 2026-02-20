/**
 * Calculation Service for cricket statistics
 */

/**
 * Calculate strike rate
 * @param {number} runs - Runs scored
 * @param {number} balls - Balls faced
 * @returns {number} Strike rate
 */
export const calculateStrikeRate = (runs, balls) => {
  if (balls === 0) return 0;
  return parseFloat(((runs / balls) * 100).toFixed(2));
};

/**
 * Calculate economy rate
 * @param {number} runs - Runs conceded
 * @param {number} balls - Balls bowled
 * @returns {number} Economy rate
 */
export const calculateEconomyRate = (runs, balls) => {
  if (balls === 0) return 0;
  const overs = balls / 6;
  return parseFloat((runs / overs).toFixed(2));
};

/**
 * Calculate run rate (current run rate)
 * @param {number} runs - Total runs
 * @param {number} balls - Total balls
 * @returns {number} Run rate
 */
export const calculateRunRate = (runs, balls) => {
  if (balls === 0) return 0;
  const overs = balls / 6;
  return parseFloat((runs / overs).toFixed(2));
};

/**
 * Calculate required run rate
 * @param {number} target - Target score
 * @param {number} currentRuns - Current runs
 * @param {number} ballsRemaining - Balls remaining
 * @returns {number} Required run rate
 */
export const calculateRequiredRunRate = (target, currentRuns, ballsRemaining) => {
  const runsNeeded = target - currentRuns;
  if (ballsRemaining === 0) return 0;

  const oversRemaining = ballsRemaining / 6;
  return parseFloat((runsNeeded / oversRemaining).toFixed(2));
};

/**
 * Calculate balls remaining
 * @param {number} totalOvers - Total overs in match
 * @param {number} ballsBowled - Balls bowled so far
 * @returns {number} Balls remaining
 */
export const calculateBallsRemaining = (totalOvers, ballsBowled) => {
  const totalBalls = totalOvers * 6;
  return Math.max(0, totalBalls - ballsBowled);
};

/**
 * Calculate partnerships from innings
 * @param {Innings} innings - Innings object
 * @param {Team} battingTeam - Batting team
 * @returns {Array<Object>} Array of partnerships with batsman names
 */
export const calculatePartnerships = (innings, battingTeam) => {
  if (!innings) return [];

  const partnerships = [...innings.partnerships];

  // Add current partnership if active
  if (innings.currentPartnership) {
    partnerships.push(innings.currentPartnership);
  }

  // Enrich with player names
  return partnerships.map(p => {
    const batsman1 = battingTeam.getPlayer(p.batsman1Id);
    const batsman2 = battingTeam.getPlayer(p.batsman2Id);

    return {
      wicketNumber: p.wicketNumber,
      batsman1Name: batsman1 ? batsman1.name : 'Unknown',
      batsman2Name: batsman2 ? batsman2.name : 'Unknown',
      runs: p.runs,
      balls: p.balls,
      runRate: p.getRunRate(),
      isActive: p.isActive
    };
  });
};

/**
 * Calculate fall of wickets with player names
 * @param {Innings} innings - Innings object
 * @param {Team} battingTeam - Batting team
 * @param {Team} bowlingTeam - Bowling team
 * @returns {Array<Object>} Array of fall of wickets
 */
export const calculateFallOfWickets = (innings, battingTeam, bowlingTeam) => {
  if (!innings) return [];

  return innings.fallOfWickets.map(fow => {
    const batsman = battingTeam.getPlayer(fow.batsmanId);
    const bowler = bowlingTeam.getPlayer(fow.bowlerId);
    const fielder = fow.fielderId ? bowlingTeam.getPlayer(fow.fielderId) : null;

    return {
      runs: fow.runs,
      wickets: fow.wickets,
      overs: fow.overs,
      batsmanName: batsman ? batsman.name : 'Unknown',
      batsmanRuns: batsman ? batsman.battingStats.runs : 0,
      bowlerName: bowler ? bowler.name : 'Unknown',
      fielderName: fielder ? fielder.name : null,
      wicketType: fow.wicketType
    };
  });
};

/**
 * Get batting statistics for all batsmen
 * @param {Team} team - Team object
 * @returns {Array<Object>} Array of batting stats
 */
export const getBattingStatistics = (team) => {
  return team.players
    .filter(player => player.battingStats.balls > 0 || player.battingStats.isOut)
    .map(player => ({
      name: player.name,
      runs: player.battingStats.runs,
      balls: player.battingStats.balls,
      fours: player.battingStats.fours,
      sixes: player.battingStats.sixes,
      strikeRate: player.battingStats.strikeRate,
      isOut: player.battingStats.isOut,
      dismissalType: player.battingStats.dismissalType,
      dismissedBy: player.battingStats.dismissedBy
    }))
    .sort((a, b) => b.runs - a.runs); // Sort by runs (highest first)
};

/**
 * Get bowling statistics for all bowlers
 * @param {Team} team - Team object
 * @returns {Array<Object>} Array of bowling stats
 */
export const getBowlingStatistics = (team) => {
  return team.players
    .filter(player => player.bowlingStats.balls > 0)
    .map(player => ({
      name: player.name,
      overs: player.bowlingStats.overs.toFixed(1),
      maidens: player.bowlingStats.maidens,
      runs: player.bowlingStats.runs,
      wickets: player.bowlingStats.wickets,
      economyRate: player.bowlingStats.economyRate,
      balls: player.bowlingStats.balls
    }))
    .sort((a, b) => b.wickets - a.wickets); // Sort by wickets (highest first)
};

/**
 * Calculate match summary statistics
 * @param {Match} match - Match object
 * @returns {Object} Match summary
 */
export const calculateMatchSummary = (match) => {
  const firstInnings = match.innings.first;
  const secondInnings = match.innings.second;

  const summary = {
    firstInnings: null,
    secondInnings: null,
    result: match.result
  };

  if (firstInnings) {
    summary.firstInnings = {
      teamName: match.teams[firstInnings.battingTeamId === match.teams.teamA.id ? 'teamA' : 'teamB'].name,
      runs: firstInnings.score.runs,
      wickets: firstInnings.score.wickets,
      overs: firstInnings.score.overs,
      runRate: firstInnings.getCurrentRunRate(),
      extras: firstInnings.extras.total
    };
  }

  if (secondInnings) {
    summary.secondInnings = {
      teamName: match.teams[secondInnings.battingTeamId === match.teams.teamA.id ? 'teamA' : 'teamB'].name,
      runs: secondInnings.score.runs,
      wickets: secondInnings.score.wickets,
      overs: secondInnings.score.overs,
      runRate: secondInnings.getCurrentRunRate(),
      extras: secondInnings.extras.total
    };
  }

  return summary;
};

/**
 * Get top scorers from a team
 * @param {Team} team - Team object
 * @param {number} limit - Number of top scorers to return
 * @returns {Array<Object>} Top scorers
 */
export const getTopScorers = (team, limit = 3) => {
  return team.players
    .filter(player => player.battingStats.balls > 0)
    .sort((a, b) => b.battingStats.runs - a.battingStats.runs)
    .slice(0, limit)
    .map(player => ({
      name: player.name,
      runs: player.battingStats.runs,
      balls: player.battingStats.balls,
      strikeRate: player.battingStats.strikeRate
    }));
};

/**
 * Get top wicket takers from a team
 * @param {Team} team - Team object
 * @param {number} limit - Number of top bowlers to return
 * @returns {Array<Object>} Top wicket takers
 */
export const getTopWicketTakers = (team, limit = 3) => {
  return team.players
    .filter(player => player.bowlingStats.balls > 0)
    .sort((a, b) => b.bowlingStats.wickets - a.bowlingStats.wickets)
    .slice(0, limit)
    .map(player => ({
      name: player.name,
      wickets: player.bowlingStats.wickets,
      runs: player.bowlingStats.runs,
      economyRate: player.bowlingStats.economyRate
    }));
};

/**
 * Calculate projected score (based on current run rate)
 * @param {number} currentRuns - Current runs
 * @param {number} ballsBowled - Balls bowled
 * @param {number} totalOvers - Total overs in match
 * @returns {number} Projected score
 */
export const calculateProjectedScore = (currentRuns, ballsBowled, totalOvers) => {
  if (ballsBowled === 0) return 0;

  const currentRunRate = calculateRunRate(currentRuns, ballsBowled);
  const totalBalls = totalOvers * 6;
  const projectedScore = Math.round(currentRunRate * (totalBalls / 6));

  return projectedScore;
};

/**
 * Check if target is achievable
 * @param {number} target - Target score
 * @param {number} currentRuns - Current runs
 * @param {number} ballsRemaining - Balls remaining
 * @param {number} wicketsRemaining - Wickets remaining
 * @returns {Object} Analysis of target achievability
 */
export const analyzeTarget = (target, currentRuns, ballsRemaining, wicketsRemaining) => {
  const runsNeeded = target - currentRuns;
  const requiredRunRate = calculateRequiredRunRate(target, currentRuns, ballsRemaining);

  return {
    runsNeeded,
    ballsRemaining,
    wicketsRemaining,
    requiredRunRate,
    isAchievable: requiredRunRate <= 12 && wicketsRemaining >= 2,
    difficulty:
      requiredRunRate < 6
        ? 'easy'
        : requiredRunRate < 9
        ? 'moderate'
        : requiredRunRate < 12
        ? 'difficult'
        : 'very difficult'
  };
};
