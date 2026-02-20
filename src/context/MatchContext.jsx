import { createContext, useContext, useReducer, useEffect } from 'react';
import { Match } from '../models/Match';
import { saveCurrentMatch, loadCurrentMatch } from '../services/storageService';
import { MATCH_STATUS } from '../utils/constants';

const MatchContext = createContext();

// Deep clone using toJSON/fromJSON to make reducer pure (StrictMode safe)
const deepClone = (match) => {
  if (!match) return null;
  return Match.fromJSON(match.toJSON());
};

// Action types
const ACTIONS = {
  CREATE_MATCH: 'CREATE_MATCH',
  LOAD_MATCH: 'LOAD_MATCH',
  SET_TEAMS: 'SET_TEAMS',
  SET_TOSS: 'SET_TOSS',
  START_MATCH: 'START_MATCH',
  ADD_BALL: 'ADD_BALL',
  UNDO_LAST_BALL: 'UNDO_LAST_BALL',
  ADD_WICKET: 'ADD_WICKET',
  ADD_EXTRA: 'ADD_EXTRA',
  COMPLETE_OVER: 'COMPLETE_OVER',
  START_SECOND_INNINGS: 'START_SECOND_INNINGS',
  COMPLETE_MATCH: 'COMPLETE_MATCH',
  CLEAR_MATCH: 'CLEAR_MATCH',
  SET_NEW_BATSMAN: 'SET_NEW_BATSMAN',
  SWAP_BATSMEN: 'SWAP_BATSMEN',
  EDIT_PLAYER_NAME: 'EDIT_PLAYER_NAME'
};

// Reducer function (pure — deep clones before mutating)
const matchReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.CREATE_MATCH: {
      const newMatch = new Match();
      if (action.payload?.config) {
        newMatch.setConfig(action.payload.config);
      }
      return newMatch;
    }

    case ACTIONS.LOAD_MATCH:
      return action.payload;

    case ACTIONS.SET_TEAMS: {
      const m = deepClone(state);
      m.setTeamNames(action.payload.teamAName, action.payload.teamBName);
      action.payload.teamAPlayers.forEach(playerName => {
        m.teams.teamA.addPlayer(playerName);
      });
      action.payload.teamBPlayers.forEach(playerName => {
        m.teams.teamB.addPlayer(playerName);
      });
      return m;
    }

    case ACTIONS.SET_TOSS: {
      const m = deepClone(state);
      m.setToss(action.payload.winner, action.payload.decision);
      return m;
    }

    case ACTIONS.START_MATCH: {
      const m = deepClone(state);
      m.startMatch(
        action.payload.strikerId,
        action.payload.nonStrikerId,
        action.payload.bowlerId
      );
      return m;
    }

    case ACTIONS.ADD_BALL: {
      const m = deepClone(state);
      const innings = m.getCurrentInnings();
      const ball = action.payload;

      // Add ball to current over (updates innings score, overs, extras, partnership)
      innings.addBall(ball);

      // Update player stats
      const striker = m.getBattingTeam().getPlayer(ball.batsmanId);
      const bowler = m.getBowlingTeam().getPlayer(ball.bowlerId);

      if (striker && ball.isNoBall && ball.runs > 0) {
        // No-ball: batsman gets the runs scored off bat, but no ball faced
        striker.battingStats.runs += ball.runs;
        if (ball.runs === 4) striker.battingStats.fours += 1;
        if (ball.runs === 6) striker.battingStats.sixes += 1;
        striker.updateStrikeRate();
      } else if (striker && !ball.isBye && !ball.isLegBye && !ball.isWide && !ball.isNoBall) {
        // Normal ball: add runs + count as ball faced
        striker.addRuns(ball.runs);
      }

      if (bowler) {
        // Bowler charged with all runs (including NB penalty)
        const bowlerRuns = ball.isNoBall ? ball.runs + 1 : ball.runs;
        bowler.addBowlingStats(bowlerRuns, ball.isWicket, ball.isValidBall());
      }

      // Swap batsmen for odd runs (total runs including extras for wide/nb)
      const totalRuns = ball.isNoBall ? ball.runs + 1 : ball.runs;
      if (totalRuns % 2 === 1 && !ball.isWicket) {
        m.swapBatsmen();
      }

      // Mark batsman as out on wicket
      if (ball.isWicket && striker) {
        striker.setOut(ball.wicketType, ball.bowlerId, ball.fielderId);
      }

      // Check if innings is complete
      if (m.isInningsComplete()) {
        m.completeInnings();
      }

      return m;
    }

    case ACTIONS.UNDO_LAST_BALL: {
      const m = deepClone(state);
      const currentInnings = m.getCurrentInnings();
      const removedBall = currentInnings.removeLastBall();

      if (removedBall) {
        const batsman = m.getBattingTeam().getPlayer(removedBall.batsmanId);
        const bowlerToRevert = m.getBowlingTeam().getPlayer(removedBall.bowlerId);

        if (batsman && removedBall.isNoBall && removedBall.runs > 0) {
          // No-ball: revert batsman runs (no ball faced was counted)
          batsman.battingStats.runs -= removedBall.runs;
          if (removedBall.runs === 4) batsman.battingStats.fours -= 1;
          if (removedBall.runs === 6) batsman.battingStats.sixes -= 1;
          batsman.updateStrikeRate();
        } else if (batsman && !removedBall.isBye && !removedBall.isLegBye && !removedBall.isWide && !removedBall.isNoBall) {
          // Normal ball: revert runs + ball faced
          batsman.battingStats.runs -= removedBall.runs;
          batsman.battingStats.balls -= 1;
          if (removedBall.runs === 4) batsman.battingStats.fours -= 1;
          if (removedBall.runs === 6) batsman.battingStats.sixes -= 1;
          batsman.updateStrikeRate();
        }

        if (bowlerToRevert) {
          // Bowler: revert all runs (including NB penalty)
          const bowlerRuns = removedBall.isNoBall ? removedBall.runs + 1 : removedBall.runs;
          bowlerToRevert.bowlingStats.runs -= bowlerRuns;
          if (removedBall.isValidBall()) {
            bowlerToRevert.bowlingStats.balls -= 1;
            bowlerToRevert.bowlingStats.overs = bowlerToRevert.bowlingStats.balls / 6;
          }
          if (removedBall.isWicket) {
            bowlerToRevert.bowlingStats.wickets -= 1;
          }
          bowlerToRevert.updateEconomyRate();
        }

        // Swap batsmen back if odd total runs
        const totalRuns = removedBall.isNoBall ? removedBall.runs + 1 : removedBall.runs;
        if (totalRuns % 2 === 1 && !removedBall.isWicket) {
          m.swapBatsmen();
        }

        // Revert wicket
        if (removedBall.isWicket && batsman) {
          batsman.battingStats.isOut = false;
          batsman.battingStats.dismissalType = null;
          batsman.battingStats.dismissedBy = null;
          batsman.battingStats.fielder = null;
        }
      }

      return m;
    }

    case ACTIONS.ADD_WICKET: {
      const m = deepClone(state);
      const { dismissalType, bowlerId, fielderId, newBatsmanId } = action.payload;

      const outBatsman = m.getBattingTeam().getPlayer(m.currentState.strikerId);
      if (outBatsman) {
        outBatsman.setOut(dismissalType, bowlerId, fielderId);
      }

      m.setNewBatsman(newBatsmanId);

      const inningsForPartnership = m.getCurrentInnings();
      inningsForPartnership.startPartnership(newBatsmanId, m.currentState.nonStrikerId);

      return m;
    }

    case ACTIONS.COMPLETE_OVER: {
      const m = deepClone(state);
      const inningsToComplete = m.getCurrentInnings();

      // Check for maiden over
      if (inningsToComplete.currentOver) {
        const bowlerForMaiden = m.getBowlingTeam().getPlayer(inningsToComplete.currentOver.bowlerId);
        if (bowlerForMaiden) {
          bowlerForMaiden.checkMaiden(inningsToComplete.currentOver.runs);
        }
        inningsToComplete.completeOver();
      } else if (inningsToComplete.overs.length > 0) {
        const lastOver = inningsToComplete.overs[inningsToComplete.overs.length - 1];
        const bowlerForMaiden = m.getBowlingTeam().getPlayer(lastOver.bowlerId);
        if (bowlerForMaiden) {
          bowlerForMaiden.checkMaiden(lastOver.runs);
        }
      }

      m.setNewBowler(action.payload.newBowlerId);
      inningsToComplete.startNewOver(action.payload.newBowlerId);
      m.swapBatsmen();

      return m;
    }

    case ACTIONS.START_SECOND_INNINGS: {
      const m = deepClone(state);
      m.startSecondInnings(
        action.payload.strikerId,
        action.payload.nonStrikerId,
        action.payload.bowlerId
      );
      return m;
    }

    case ACTIONS.COMPLETE_MATCH: {
      const m = deepClone(state);
      m.completeMatch();
      return m;
    }

    case ACTIONS.SET_NEW_BATSMAN: {
      const m = deepClone(state);
      m.currentState.strikerId = action.payload.playerId;
      const inningsForNewBat = m.getCurrentInnings();
      inningsForNewBat.startPartnership(action.payload.playerId, m.currentState.nonStrikerId);
      return m;
    }

    case ACTIONS.SWAP_BATSMEN: {
      const m = deepClone(state);
      m.swapBatsmen();
      return m;
    }

    case ACTIONS.EDIT_PLAYER_NAME: {
      const m = deepClone(state);
      const { playerId, newName, teamKey } = action.payload;
      const team = m.teams[teamKey];
      if (team) {
        const player = team.getPlayer(playerId);
        if (player) {
          player.name = newName;
        }
      }
      return m;
    }

    case ACTIONS.CLEAR_MATCH:
      return null;

    default:
      return state;
  }
};

export const MatchProvider = ({ children }) => {
  const [match, dispatch] = useReducer(matchReducer, null);

  // Auto-save to localStorage whenever match changes
  useEffect(() => {
    if (match && match.status !== MATCH_STATUS.COMPLETED) {
      saveCurrentMatch(match);
    }
  }, [match]);

  // Load saved match on mount
  useEffect(() => {
    const savedMatch = loadCurrentMatch();
    if (savedMatch) {
      dispatch({ type: ACTIONS.LOAD_MATCH, payload: savedMatch });
    }
  }, []);

  const value = {
    match,
    dispatch,
    ACTIONS
  };

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};

export { ACTIONS };
