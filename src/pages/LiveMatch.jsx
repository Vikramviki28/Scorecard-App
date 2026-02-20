import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatch, ACTIONS } from '../context/MatchContext';
import { Ball } from '../models/Ball';
import { MATCH_STATUS, WICKET_TYPES } from '../utils/constants';
import { saveMatchToHistory } from '../services/storageService';
import PlayerNameInput from '../components/scoreboard/PlayerNameInput';
import Modal from '../components/common/Modal';
import { formatOvers } from '../utils/formatters';
import { encodeMatchForShare } from '../utils/shareCodec';
import './LiveMatch.css';

const getOrdinal = (n) => {
  if (n > 3 && n < 21) return n + 'th';
  switch (n % 10) {
    case 1: return n + 'st';
    case 2: return n + 'nd';
    case 3: return n + 'rd';
    default: return n + 'th';
  }
};

const LiveMatch = () => {
  const navigate = useNavigate();
  const { match, dispatch } = useMatch();
  const [showPlayerInput, setShowPlayerInput] = useState(null);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [showNoBallModal, setShowNoBallModal] = useState(false);
  const [selectedWicketType, setSelectedWicketType] = useState('bowled');
  const [pendingPlayers, setPendingPlayers] = useState({
    strikerId: null,
    nonStrikerId: null
  });
  const [editingPlayer, setEditingPlayer] = useState(null); // { playerId, teamKey, currentName }
  const [editName, setEditName] = useState('');
  const [showInningsBreak, setShowInningsBreak] = useState(false);
  const [battingCardInnings, setBattingCardInnings] = useState(null); // null = current innings
  const [bowlingCardInnings, setBowlingCardInnings] = useState(null);
  const [secondInningsPending, setSecondInningsPending] = useState({
    strikerId: null,
    nonStrikerId: null
  });
  const [matchSaved, setMatchSaved] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);
  const scorecardRef = useRef(null);

  // Show initial player input when match is in setup
  useEffect(() => {
    if (!match) {
      navigate('/');
      return;
    }
    if (match.status === MATCH_STATUS.SETUP && !showPlayerInput) {
      setShowPlayerInput({ type: 'striker', count: 1 });
    }
  }, [match, navigate]);

  // Detect innings break
  useEffect(() => {
    if (!match) return;
    if (match.status === MATCH_STATUS.INNINGS_BREAK) {
      setShowInningsBreak(true);
    }
  }, [match]);

  // Detect over completion - prompt for new bowler
  useEffect(() => {
    if (!match || match.status !== MATCH_STATUS.LIVE) return;
    if (showPlayerInput) return;
    const currentInnings = match.getCurrentInnings();
    if (currentInnings && !currentInnings.currentOver) {
      setShowPlayerInput({ type: 'bowler', count: 0 });
    }
  }, [match, showPlayerInput]);

  if (!match) return null;

  // ─── Event Handlers ───

  // For second innings: teams swap — new batting = old bowling, new bowling = old batting
  const isInningsBreak = match.status === MATCH_STATUS.INNINGS_BREAK;
  const newBattingTeamKey = isInningsBreak ? match.currentState.bowlingTeam : match.currentState.battingTeam;
  const newBowlingTeamKey = isInningsBreak ? match.currentState.battingTeam : match.currentState.bowlingTeam;

  const validatePlayerName = (name) => {
    let team;
    if (isInningsBreak) {
      // During innings break, teams swap for input
      team = showPlayerInput?.type === 'bowler'
        ? match.teams[newBowlingTeamKey]
        : match.teams[newBattingTeamKey];
    } else {
      team = showPlayerInput?.type === 'bowler'
        ? match.getBowlingTeam()
        : match.getBattingTeam();
    }
    if (team) {
      const existing = team.getPlayerByName(name);
      if (existing) {
        return `"${name}" already exists in ${team.name}`;
      }
    }
    return null;
  };

  const handleStartSecondInnings = () => {
    setShowInningsBreak(false);
    setShowPlayerInput({ type: 'striker', count: 10 }); // count 10+ = second innings
  };

  const handlePlayerNameSubmit = (name) => {
    // Determine which team to add the player to
    let player;
    const isSecondInningsSetup = showPlayerInput.count >= 10;

    if (isSecondInningsSetup) {
      // Second innings: batting team = old bowling team, bowling team = old batting team
      if (showPlayerInput.type === 'bowler') {
        player = match.teams[newBowlingTeamKey].addPlayer(name);
      } else {
        player = match.teams[newBattingTeamKey].addPlayer(name);
      }
    } else {
      const battingTeam = match.getBattingTeam();
      const bowlingTeam = match.getBowlingTeam();
      if (showPlayerInput.type === 'bowler') {
        player = bowlingTeam.addPlayer(name);
      } else {
        player = battingTeam.addPlayer(name);
      }
    }

    // First innings setup (count 1-3)
    if (showPlayerInput.type === 'striker' && showPlayerInput.count === 1) {
      setPendingPlayers(prev => ({ ...prev, strikerId: player.id }));
      setShowPlayerInput({ type: 'non-striker', count: 2 });
    } else if (showPlayerInput.type === 'non-striker' && showPlayerInput.count === 2) {
      setPendingPlayers(prev => ({ ...prev, nonStrikerId: player.id }));
      setShowPlayerInput({ type: 'bowler', count: 3 });
    } else if (showPlayerInput.type === 'bowler' && showPlayerInput.count === 3) {
      dispatch({
        type: ACTIONS.START_MATCH,
        payload: {
          strikerId: pendingPlayers.strikerId,
          nonStrikerId: pendingPlayers.nonStrikerId,
          bowlerId: player.id
        }
      });
      setShowPlayerInput(null);

    // Second innings setup (count 10-12)
    } else if (showPlayerInput.type === 'striker' && showPlayerInput.count === 10) {
      setSecondInningsPending(prev => ({ ...prev, strikerId: player.id }));
      setShowPlayerInput({ type: 'non-striker', count: 11 });
    } else if (showPlayerInput.type === 'non-striker' && showPlayerInput.count === 11) {
      setSecondInningsPending(prev => ({ ...prev, nonStrikerId: player.id }));
      setShowPlayerInput({ type: 'bowler', count: 12 });
    } else if (showPlayerInput.type === 'bowler' && showPlayerInput.count === 12) {
      dispatch({
        type: ACTIONS.START_SECOND_INNINGS,
        payload: {
          strikerId: secondInningsPending.strikerId,
          nonStrikerId: secondInningsPending.nonStrikerId,
          bowlerId: player.id
        }
      });
      setShowPlayerInput(null);
    } else if (showPlayerInput.type === 'striker' && showPlayerInput.count === 0) {
      dispatch({
        type: ACTIONS.SET_NEW_BATSMAN,
        payload: { playerId: player.id }
      });
      setShowPlayerInput(null);
    } else if (showPlayerInput.type === 'bowler' && showPlayerInput.count === 0) {
      dispatch({
        type: ACTIONS.COMPLETE_OVER,
        payload: { newBowlerId: player.id }
      });
      setShowPlayerInput(null);
    }
  };

  const handleRunScored = (runs) => {
    const ball = new Ball(match.currentState.strikerId, match.currentState.bowlerId);
    ball.setRuns(runs);
    dispatch({ type: ACTIONS.ADD_BALL, payload: ball });
  };

  const handleWicket = () => {
    const ball = new Ball(match.currentState.strikerId, match.currentState.bowlerId);
    ball.setWicket(selectedWicketType);
    dispatch({ type: ACTIONS.ADD_BALL, payload: ball });
    setShowPlayerInput({ type: 'striker', count: 0 });
    setShowWicketModal(false);
    setSelectedWicketType('bowled');
  };

  const handleExtra = (type, runs) => {
    const ball = new Ball(match.currentState.strikerId, match.currentState.bowlerId);
    if (type === 'wide') ball.setWide(runs);
    else if (type === 'noball') ball.setNoBall(runs);
    else if (type === 'bye') ball.setBye(runs);
    else if (type === 'legbye') ball.setLegBye(runs);
    dispatch({ type: ACTIONS.ADD_BALL, payload: ball });
    setShowExtrasModal(false);
    setShowNoBallModal(false);
  };

  const handleUndo = () => {
    dispatch({ type: ACTIONS.UNDO_LAST_BALL });
  };

  const handleSwapBatsmen = () => {
    dispatch({ type: ACTIONS.SWAP_BATSMEN });
  };

  const openEditName = (playerId, teamKey, currentName) => {
    setEditingPlayer({ playerId, teamKey, currentName });
    setEditName(currentName);
  };

  const handleEditNameSubmit = () => {
    if (!editName.trim() || editName.trim().length < 2) return;
    dispatch({
      type: ACTIONS.EDIT_PLAYER_NAME,
      payload: { playerId: editingPlayer.playerId, newName: editName.trim(), teamKey: editingPlayer.teamKey }
    });
    setEditingPlayer(null);
    setEditName('');
  };

  const handleViewScorecard = () => {
    setShowScorecard(prev => !prev);
    if (!showScorecard) {
      setTimeout(() => scorecardRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const handleSaveMatch = () => {
    if (!match || matchSaved) return;
    saveMatchToHistory(match);
    setMatchSaved(true);
  };

  const generateMatchSummary = () => {
    if (!match || !match.result) return '';

    const teamA = match.teams.teamA?.name || 'Team A';
    const teamB = match.teams.teamB?.name || 'Team B';

    // Determine which team batted first/second
    const firstBatKey = match.currentState.bowlingTeam; // after swap, bowling = first batting
    const secondBatKey = match.currentState.battingTeam;
    const firstBatTeam = match.teams[firstBatKey];
    const secondBatTeam = match.teams[secondBatKey];
    const firstBowlTeam = match.teams[secondBatKey]; // first bowling = second batting
    const secondBowlTeam = match.teams[firstBatKey];

    const inn1 = match.innings.first;
    const inn2 = match.innings.second;

    // Result
    let resultText = '';
    if (match.result.winner === 'tie') {
      resultText = 'Match Tied!';
    } else {
      const winner = match.teams[match.result.winner]?.name;
      resultText = `${winner} Won by ${match.result.margin}`;
    }

    // Build batting lines
    const buildBatLines = (team) => {
      return team.getAllPlayers()
        .filter(p => p.battingStats.balls > 0 || p.battingStats.isOut)
        .map(p => {
          const out = p.battingStats.isOut ? '' : '*';
          return `${p.name} ${p.battingStats.runs}${out}(${p.battingStats.balls})`;
        }).join(', ');
    };

    // Build bowling lines
    const buildBowlLines = (team) => {
      return team.getAllPlayers()
        .filter(p => p.bowlingStats.balls > 0)
        .map(p => `${p.name} ${formatOvers(p.bowlingStats.overs)}-${p.bowlingStats.maidens}-${p.bowlingStats.runs}-${p.bowlingStats.wickets}`)
        .join(', ');
    };

    let text = `stumps2stumps\n`;
    text += `${teamA} vs ${teamB} | ${match.config.totalOvers} Overs\n\n`;
    text += `${resultText}\n\n`;

    if (inn1) {
      text += `--- 1st Innings ---\n`;
      text += `${firstBatTeam.name}: ${inn1.score.runs}/${inn1.score.wickets} (${formatOvers(inn1.score.overs)} ov)\n`;
      text += `${buildBatLines(firstBatTeam)}\n`;
      text += `Extras: ${inn1.extras.total}\n`;
      text += `Bowling: ${buildBowlLines(firstBowlTeam)}\n\n`;
    }

    if (inn2) {
      text += `--- 2nd Innings ---\n`;
      text += `${secondBatTeam.name}: ${inn2.score.runs}/${inn2.score.wickets} (${formatOvers(inn2.score.overs)} ov)\n`;
      text += `${buildBatLines(secondBatTeam)}\n`;
      text += `Extras: ${inn2.extras.total}\n`;
      text += `Bowling: ${buildBowlLines(secondBowlTeam)}\n\n`;
    }

    const momData = match.getManOfMatch();
    if (momData) {
      text += `Man of the Match: ${momData.player.name} - ${momData.summary}\n`;
    }

    text += `\nScored on stumps2stumps`;
    return text;
  };

  const handleShare = async () => {
    const text = generateMatchSummary();
    const scorecardUrl = encodeMatchForShare(match);
    const shareData = {
      title: `${match.teams.teamA?.name} vs ${match.teams.teamB?.name} - stumps2stumps`,
      text: text,
      url: scorecardUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(scorecardUrl);
        alert('Scorecard link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(scorecardUrl);
          alert('Scorecard link copied to clipboard!');
        } catch {
          // ignore
        }
      }
    }
  };

  // ─── Computed Data ───

  const currentInnings = match.getCurrentInnings();
  const battingTeam = match.getBattingTeam();
  const bowlingTeam = match.getBowlingTeam();
  const striker = battingTeam?.getPlayer(match.currentState.strikerId);
  const nonStriker = battingTeam?.getPlayer(match.currentState.nonStrikerId);
  const bowler = bowlingTeam?.getPlayer(match.currentState.bowlerId);
  const score = currentInnings?.score || { runs: 0, wickets: 0, overs: 0, balls: 0 };

  const partnership = currentInnings?.currentPartnership;
  const currentOver = currentInnings?.currentOver;
  const allPartnerships = [...(currentInnings?.partnerships || []), partnership].filter(Boolean);
  const maxPartnershipRuns = Math.max(...allPartnerships.map(p => p.runs), 1);

  const getAbbr = (name) => name ? name.substring(0, 2).toUpperCase() : '??';
  const runRate = score.balls > 0 ? (score.runs / (score.balls / 6)).toFixed(2) : '0.00';
  const target = match.getTarget();
  const isCompleted = match.status === MATCH_STATUS.COMPLETED;
  const mom = isCompleted ? match.getManOfMatch() : null;
  const winnerTeam = isCompleted && match.result?.winner !== 'tie' ? match.teams[match.result.winner] : null;
  const remainingBalls = match.config.totalOvers * 6 - score.balls;
  const requiredRate = target && remainingBalls > 0
    ? ((target - score.runs) / (remainingBalls / 6)).toFixed(2) : null;

  // First innings stats (for innings break + second innings display)
  const firstInnings = match.innings.first;
  const firstInningsRR = firstInnings && firstInnings.score.balls > 0
    ? (firstInnings.score.runs / (firstInnings.score.balls / 6)).toFixed(2)
    : '0.00';

  // ─── Scorecard Tab Data ───
  const firstBatTeamKey = match.currentInnings === 2
    ? match.currentState.bowlingTeam
    : match.currentState.battingTeam;
  const firstBowlTeamKey = match.currentInnings === 2
    ? match.currentState.battingTeam
    : match.currentState.bowlingTeam;
  const secondBatTeamKey = firstBowlTeamKey;
  const secondBowlTeamKey = firstBatTeamKey;
  const hasSecondInnings = !!match.innings.second;

  // Batting card
  const activeBatInnings = battingCardInnings || match.currentInnings;
  const batCardData = activeBatInnings === 1 ? match.innings.first : match.innings.second;
  const batCardTeamKey = activeBatInnings === 1 ? firstBatTeamKey : secondBatTeamKey;
  const batCardBowlTeamKey = activeBatInnings === 1 ? firstBowlTeamKey : secondBowlTeamKey;
  const batCardTeam = batCardTeamKey ? match.teams[batCardTeamKey] : null;
  const batCardBowlTeam = batCardBowlTeamKey ? match.teams[batCardBowlTeamKey] : null;
  const batCardScore = batCardData?.score || { runs: 0, wickets: 0, overs: 0, balls: 0 };
  const batCardFOW = batCardData?.fallOfWickets || [];

  const viewBatsmen = batCardTeam?.getAllPlayers()?.filter(p => {
    const isCurrent = activeBatInnings === match.currentInnings && match.status === MATCH_STATUS.LIVE;
    if (isCurrent) {
      return p.battingStats.balls > 0 || p.id === match.currentState.strikerId || p.id === match.currentState.nonStrikerId;
    }
    return p.battingStats.balls > 0 || p.battingStats.isOut;
  }) || [];

  // Bowling card
  const activeBowlInnings = bowlingCardInnings || match.currentInnings;
  const bowlCardTeamKey = activeBowlInnings === 1 ? firstBowlTeamKey : secondBowlTeamKey;
  const bowlCardTeam = bowlCardTeamKey ? match.teams[bowlCardTeamKey] : null;

  const viewBowlers = bowlCardTeam?.getAllPlayers()?.filter(p => {
    const isCurrent = activeBowlInnings === match.currentInnings && match.status === MATCH_STATUS.LIVE;
    if (isCurrent) {
      return p.bowlingStats.balls > 0 || p.id === match.currentState.bowlerId;
    }
    return p.bowlingStats.balls > 0;
  }) || [];

  const getDismissalText = (player, bowlTeam) => {
    if (!player.battingStats.isOut) return 'Not Out';
    const type = player.battingStats.dismissalType;
    const bp = (bowlTeam || bowlingTeam)?.getPlayer(player.battingStats.dismissedBy);
    const bn = bp?.name || '';
    switch (type) {
      case 'bowled': return `b ${bn}`;
      case 'caught': return `c ... b ${bn}`;
      case 'lbw': return `lbw b ${bn}`;
      case 'run-out': return 'run out';
      case 'stumped': return `st ... b ${bn}`;
      case 'hit-wicket': return `hit wkt b ${bn}`;
      case 'retired-hurt': return 'retired hurt';
      case 'retired-out': return 'retired out';
      default: return type || '';
    }
  };

  const getBallClass = (b) => {
    if (b.isWicket) return 'wicket';
    if ((b.runs === 4 || b.runs === 6) && !b.isWide && !b.isNoBall && !b.isBye && !b.isLegBye) return 'boundary';
    if (b.isWide || b.isNoBall) return 'extra';
    if (b.runs === 0) return 'dot';
    return '';
  };

  // ─── Render ───

  return (
    <div className="lm">
      {/* Navbar */}
      <nav className="lm-nav">
        <div className="lm-nav-brand" onClick={() => navigate('/')}>
          <span className="lm-nav-icon">🏏</span>
          <span className="lm-nav-title">stumps2stumps</span>
        </div>
        <div className="lm-nav-actions">
          <span className="lm-nav-link active">Live</span>
          <span className="lm-nav-link" onClick={() => navigate('/history')}>History</span>
        </div>
      </nav>

      {/* Match Hero */}
      <div className="lm-hero">
        <div className="lm-hero-top">
          {isCompleted ? (
            <div className="lm-completed-badge">MATCH COMPLETED</div>
          ) : (
            <div className="lm-live-badge">
              <span className="lm-live-dot"></span>
              LIVE MATCH
            </div>
          )}
          {target && !isCompleted && (
            <div className="lm-hero-target">
              <span className="lm-hero-target-label">TARGET</span>
              <span className="lm-hero-target-value">{target}</span>
            </div>
          )}
        </div>
        <h1 className="lm-match-title">{match.teams.teamA?.name} vs {match.teams.teamB?.name}</h1>
        <p className="lm-match-meta">
          {match.config.totalOvers} Overs Match
        </p>
        {target && !isCompleted && remainingBalls > 0 && target - score.runs > 0 && (
          <div className="lm-chase-info">Need {target - score.runs} from {remainingBalls} balls</div>
        )}
      </div>

      {/* Match Result */}
      {isCompleted && match.result && (
        <>
          {/* Confetti Celebration */}
          <div className="lm-celebration">
            {[...Array(24)].map((_, i) => (
              <div key={i} className={`lm-confetti lm-confetti-${i % 6}`} style={{
                left: `${4 + (i * 4) % 92}%`,
                animationDelay: `${(i * 0.15) % 2}s`,
                animationDuration: `${2.5 + (i % 4) * 0.5}s`
              }} />
            ))}
          </div>

          <div className="lm-result-card lm-result-animate">
            <div className="lm-result-trophy">🏆</div>
            <div className="lm-result-header">
              {match.result.winner === 'tie' ? (
                <div className="lm-result-title">Match Tied!</div>
              ) : (
                <>
                  <div className="lm-result-title lm-shimmer">{winnerTeam?.name} Won</div>
                  <div className="lm-result-margin">by {match.result.margin}</div>
                </>
              )}
            </div>
            {mom && (
              <div className="lm-mom-section">
                <div className="lm-mom-label">Man of the Match</div>
                <div className="lm-mom-name">{mom.player.name}</div>
                <div className="lm-mom-stats">{mom.summary}</div>
              </div>
            )}
            <div className="lm-result-actions">
              <button className={`lm-result-act-btn ${showScorecard ? 'active' : ''}`} onClick={handleViewScorecard}>
                <span className="lm-result-act-icon">{showScorecard ? '✕' : '📊'}</span>
                <span>{showScorecard ? 'Hide' : 'Scorecard'}</span>
              </button>
              <button className="lm-result-act-btn" onClick={handleSaveMatch} disabled={matchSaved}>
                <span className="lm-result-act-icon">{matchSaved ? '✓' : '💾'}</span>
                <span>{matchSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button className="lm-result-act-btn" onClick={handleShare}>
                <span className="lm-result-act-icon">📤</span>
                <span>Share</span>
              </button>
            </div>
          </div>
          <div className="lm-new-match-wrap">
            <button className="lm-new-match-btn" onClick={() => {
              dispatch({ type: ACTIONS.CLEAR_MATCH });
              navigate('/');
            }}>
              New Match
            </button>
          </div>
        </>
      )}

      {/* Innings Break Screen */}
      {showInningsBreak && match.status === MATCH_STATUS.INNINGS_BREAK && firstInnings && (
        <div className="lm-innings-break">
          <div className="lm-ib-badge">INNINGS BREAK</div>
          <div className="lm-ib-row">
            <div className="lm-ib-card">
              <div className="lm-ib-team-name">{battingTeam?.name}</div>
              <div className="lm-ib-score">
                {firstInnings.score.runs}/{firstInnings.score.wickets}
              </div>
              <div className="lm-ib-overs">
                ({formatOvers(firstInnings.score.overs)}/{match.config.totalOvers}.0 ov)
              </div>
              <div className="lm-ib-rr">RR: {firstInningsRR}</div>
            </div>
            <div className="lm-ib-target-card">
              <div className="lm-ib-target-label">TARGET</div>
              <div className="lm-ib-target-value">{firstInnings.score.runs + 1}</div>
              <div className="lm-ib-target-for">
                {match.teams[newBattingTeamKey]?.name} to chase
              </div>
              <div className="lm-ib-target-rr">
                RRR: {((firstInnings.score.runs + 1) / match.config.totalOvers).toFixed(2)}
              </div>
            </div>
          </div>
          <button className="lm-ib-start-btn" onClick={handleStartSecondInnings}>
            Start 2nd Innings
          </button>
        </div>
      )}

      {/* Score Header */}
      {!showInningsBreak && !isCompleted && (
        <div className="lm-score-header">
          <div className="lm-score-left">
            <div className="lm-score-top-row">
              <div className="lm-team-badge">{getAbbr(battingTeam?.name)}</div>
              <div className="lm-team-name-top">{battingTeam?.name?.toUpperCase()}</div>
            </div>
            <div className="lm-score-big">
              <span className="lm-score-runs">{score.runs}/{score.wickets}</span>
              <span className="lm-score-overs">({formatOvers(score.overs)}/{match.config.totalOvers}.0)</span>
            </div>
            <div className="lm-rate-row">
              <span className="lm-rate-chip crr">CRR <strong>{runRate}</strong></span>
              {match.currentInnings === 2 && requiredRate && <span className="lm-rate-chip rrr">RRR <strong>{requiredRate}</strong></span>}
            </div>
          </div>
          {partnership && striker && nonStriker && (
            <div className="lm-pship-card">
              <div className="lm-pship-title">CURRENT PARTNERSHIP</div>
              <div className="lm-pship-content">
                <div className="lm-pship-batter">
                  <div className="lm-pship-name">{striker.name}*</div>
                  <div className="lm-pship-individual">{striker.battingStats.runs}({striker.battingStats.balls})</div>
                </div>
                <div className="lm-pship-center">
                  <div className="lm-pship-value">{partnership.runs}</div>
                  <div className="lm-pship-label">Runs ({partnership.balls}b)</div>
                </div>
                <div className="lm-pship-batter right">
                  <div className="lm-pship-name">{nonStriker.name}</div>
                  <div className="lm-pship-individual">{nonStriker.battingStats.runs}({nonStriker.battingStats.balls})</div>
                </div>
              </div>
              <div className="lm-pship-bar">
                <div
                  className="lm-pship-bar-fill"
                  style={{
                    width: partnership.runs > 0
                      ? `${(striker.battingStats.runs / Math.max(striker.battingStats.runs + nonStriker.battingStats.runs, 1)) * 100}%`
                      : '50%'
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Swap Striker / Non-Striker */}
      {!isCompleted && !showInningsBreak && (
        <div className="lm-swap-row">
          <button className="lm-swap-btn" onClick={handleSwapBatsmen}>
            <span className="lm-swap-icon">⇄</span>
            <span>Swap Striker</span>
          </button>
        </div>
      )}

      {/* Scoring Controls */}
      {!isCompleted && !showInningsBreak && (
        <div className="lm-controls">
          <div className="lm-run-grid">
            {[0, 1, 2, 3, 4, 6].map(run => (
              <button
                key={run}
                className={`lm-run-btn ${run === 4 || run === 6 ? 'boundary' : ''} ${run === 0 ? 'dot' : ''}`}
                onClick={() => handleRunScored(run)}
              >
                {run}
              </button>
            ))}
          </div>
          <div className="lm-action-row">
            <button className="lm-act-btn wicket" onClick={() => setShowWicketModal(true)}>
              <span className="lm-act-icon">W</span>
              <span className="lm-act-text">Wicket</span>
            </button>
            <button className="lm-act-btn wide" onClick={() => handleExtra('wide', 1)}>
              <span className="lm-act-icon">WD</span>
              <span className="lm-act-text">Wide</span>
            </button>
            <button className="lm-act-btn noball" onClick={() => setShowNoBallModal(true)}>
              <span className="lm-act-icon">NB</span>
              <span className="lm-act-text">No Ball</span>
            </button>
            <button className="lm-act-btn extras" onClick={() => setShowExtrasModal(true)}>
              <span className="lm-act-icon">+</span>
              <span className="lm-act-text">Extras</span>
            </button>
            <button className="lm-act-btn undo" onClick={handleUndo}>
              <span className="lm-act-icon">↩</span>
              <span className="lm-act-text">Undo</span>
            </button>
          </div>
        </div>
      )}

      {/* Over Summary */}
      {currentOver && (
        <div className="lm-over-card">
          <div className="lm-over-header">
            <span>Over {currentOver.overNumber}</span>
            <span className="lm-over-total">{currentOver.runs} runs</span>
          </div>
          <div className="lm-balls-row">
            {currentOver.balls.map((b, i) => (
              <div key={i} className={`lm-ball ${getBallClass(b)}`}>
                {b.getDisplayString()}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 6 - currentOver.getValidBallsCount()) }).map((_, i) => (
              <div key={`e-${i}`} className="lm-ball empty"></div>
            ))}
          </div>
        </div>
      )}

      {/* Scorecards — hidden on completed screen until user taps "View Scorecard" */}
      {(!isCompleted || showScorecard) && (
      <>
      {/* Batting Scorecard */}
      <div className="lm-card" ref={scorecardRef}>
        <div className="lm-card-header">
          <div className="lm-card-title">
            <span className="lm-card-emoji">🏏</span> Batting
          </div>
          <div className="lm-sc-tabs">
            <button
              className={`lm-sc-tab ${activeBatInnings === 1 ? 'active' : ''}`}
              onClick={() => setBattingCardInnings(1)}
            >
              {match.teams[firstBatTeamKey]?.name}
            </button>
            {hasSecondInnings && (
              <button
                className={`lm-sc-tab ${activeBatInnings === 2 ? 'active' : ''}`}
                onClick={() => setBattingCardInnings(2)}
              >
                {match.teams[secondBatTeamKey]?.name}
              </button>
            )}
          </div>
        </div>
        <div className="lm-table-wrap">
          <table className="lm-table">
            <thead>
              <tr>
                <th className="col-name">BATTER</th>
                <th className="col-dismissal">DISMISSAL</th>
                <th className="col-stat">R</th>
                <th className="col-stat">B</th>
                <th className="col-stat">4S</th>
                <th className="col-stat">6S</th>
                <th className="col-stat">SR</th>
              </tr>
            </thead>
            <tbody>
              {viewBatsmen.map(player => {
                const isStriker = activeBatInnings === match.currentInnings && player.id === match.currentState.strikerId;
                return (
                  <tr key={player.id} className={isStriker ? 'row-active' : ''}>
                    <td className="col-name">
                      <span
                        className={`name-editable ${isStriker ? 'name-striker' : 'name-normal'}`}
                        onClick={() => openEditName(player.id, batCardTeamKey, player.name)}
                      >
                        {player.name}
                        {isStriker && <span className="star"> ★</span>}
                        <span className="edit-icon">✎</span>
                      </span>
                    </td>
                    <td className="col-dismissal">
                      <span className={player.battingStats.isOut ? 'dismissed' : 'not-out'}>
                        {getDismissalText(player, batCardBowlTeam)}
                      </span>
                    </td>
                    <td className="col-stat bold">{player.battingStats.runs}</td>
                    <td className="col-stat">{player.battingStats.balls}</td>
                    <td className="col-stat">{player.battingStats.fours}</td>
                    <td className="col-stat">{player.battingStats.sixes}</td>
                    <td className="col-stat accent">{player.battingStats.strikeRate.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="lm-summary-row">
          <span className="lm-summary-label">Extras</span>
          <span className="lm-summary-value">
            {batCardData?.extras?.total || 0}
            <span className="lm-summary-detail">
              &nbsp;(w {batCardData?.extras?.wides || 0}, nb {batCardData?.extras?.noBalls || 0}, b {batCardData?.extras?.byes || 0}, lb {batCardData?.extras?.legByes || 0})
            </span>
          </span>
        </div>

        <div className="lm-total-row">
          <div className="lm-total-left">
            <span className="lm-total-label">TOTAL SCORE</span>
            <span className="lm-total-detail">({batCardScore.wickets} wickets, {formatOvers(batCardScore.overs)} overs)</span>
          </div>
          <span className="lm-total-value">{batCardScore.runs}</span>
        </div>

        {batCardFOW.length > 0 && (
          <div className="lm-fow">
            <div className="lm-fow-title">FALL OF WICKETS</div>
            <div className="lm-fow-list">
              {batCardFOW.map((fow, i) => {
                const batter = batCardTeam?.getPlayer(fow.batsmanId);
                return (
                  <span key={i} className="lm-fow-badge">
                    <span className="lm-fow-num">{i + 1}-{fow.runs}</span>
                    &nbsp;({batter?.name || '?'}, {formatOvers(fow.overs)})
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bowling Analysis */}
      {viewBowlers.length > 0 && (
        <div className="lm-card">
          <div className="lm-card-header">
            <div className="lm-card-title">
              <span className="lm-card-emoji">🎯</span> Bowling
            </div>
            <div className="lm-sc-tabs">
              <button
                className={`lm-sc-tab ${activeBowlInnings === 1 ? 'active' : ''}`}
                onClick={() => setBowlingCardInnings(1)}
              >
                {match.teams[firstBowlTeamKey]?.name}
              </button>
              {hasSecondInnings && (
                <button
                  className={`lm-sc-tab ${activeBowlInnings === 2 ? 'active' : ''}`}
                  onClick={() => setBowlingCardInnings(2)}
                >
                  {match.teams[secondBowlTeamKey]?.name}
                </button>
              )}
            </div>
          </div>
          <div className="lm-table-wrap">
            <table className="lm-table">
              <thead>
                <tr>
                  <th className="col-name">BOWLER</th>
                  <th className="col-stat">O</th>
                  <th className="col-stat">M</th>
                  <th className="col-stat">R</th>
                  <th className="col-stat">W</th>
                  <th className="col-stat">ECON</th>
                </tr>
              </thead>
              <tbody>
                {viewBowlers.map(player => {
                  const isCurrentBowler = activeBowlInnings === match.currentInnings && player.id === match.currentState.bowlerId;
                  return (
                    <tr key={player.id} className={isCurrentBowler ? 'row-active' : ''}>
                      <td className="col-name">
                        <span
                          className="name-editable name-normal"
                          onClick={() => openEditName(player.id, bowlCardTeamKey, player.name)}
                        >
                          {player.name}
                          <span className="edit-icon">✎</span>
                        </span>
                      </td>
                      <td className="col-stat">{formatOvers(player.bowlingStats.overs)}</td>
                      <td className="col-stat">{player.bowlingStats.maidens}</td>
                      <td className="col-stat">{player.bowlingStats.runs}</td>
                      <td className="col-stat">
                        <span className={player.bowlingStats.wickets > 0 ? 'wicket-count' : ''}>
                          {player.bowlingStats.wickets}
                        </span>
                      </td>
                      <td className="col-stat">{player.bowlingStats.economyRate.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Key Partnerships */}
      {allPartnerships.length > 0 && (
        <div className="lm-card">
          <div className="lm-card-header">
            <div className="lm-card-title">
              <span className="lm-card-emoji">🤝</span> Key Partnerships
            </div>
          </div>
          <div className="lm-partnerships">
            {allPartnerships.map((p, i) => {
              const bat1 = battingTeam?.getPlayer(p.batsman1Id);
              const bat2 = battingTeam?.getPlayer(p.batsman2Id);
              return (
                <div key={i} className="lm-pship-row">
                  <div className="lm-pship-row-header">
                    <span className="lm-pship-row-label">
                      {getOrdinal(p.wicketNumber || i + 1)} Wicket &bull; {bat1?.name} & {bat2?.name}
                    </span>
                    <span className="lm-pship-row-value">
                      {p.runs}{p.isActive ? '*' : ''} Runs ({p.balls}b)
                    </span>
                  </div>
                  <div className="lm-progress-track">
                    <div
                      className="lm-progress-fill"
                      style={{ width: `${(p.runs / maxPartnershipRuns) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>
      )}

      {/* Footer */}
      <div className="lm-footer">
        <p>stumps2stumps &bull; Street Cricket Scoreboard</p>
      </div>

      {/* Wicket Modal */}
      <Modal isOpen={showWicketModal} onClose={() => setShowWicketModal(false)} title="Wicket!">
        <div className="lm-modal-inner">
          <p className="lm-modal-text">{striker?.name} is out!</p>
          <div className="lm-wkt-grid">
            {Object.entries(WICKET_TYPES).map(([key, value]) => (
              <button
                key={key}
                className={`lm-wkt-btn ${selectedWicketType === value ? 'active' : ''}`}
                onClick={() => setSelectedWicketType(value)}
              >
                {value.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
          <button className="lm-confirm-btn danger" onClick={handleWicket}>
            Confirm Wicket
          </button>
        </div>
      </Modal>

      {/* Extras Modal */}
      <Modal isOpen={showExtrasModal} onClose={() => setShowExtrasModal(false)} title="Extras">
        <div className="lm-extras-modal-grid">
          <button className="lm-extra-modal-btn wide" onClick={() => handleExtra('wide', 1)}>
            <span className="lm-em-icon">W</span>
            <span className="lm-em-label">Wide (+1)</span>
          </button>
          <button className="lm-extra-modal-btn noball" onClick={() => handleExtra('noball', 1)}>
            <span className="lm-em-icon">NB</span>
            <span className="lm-em-label">No Ball (+1)</span>
          </button>
          <button className="lm-extra-modal-btn bye" onClick={() => handleExtra('bye', 1)}>
            <span className="lm-em-icon">B</span>
            <span className="lm-em-label">Bye (1)</span>
          </button>
          <button className="lm-extra-modal-btn legbye" onClick={() => handleExtra('legbye', 1)}>
            <span className="lm-em-icon">LB</span>
            <span className="lm-em-label">Leg Bye (1)</span>
          </button>
        </div>
      </Modal>

      {/* No Ball + Runs Modal */}
      <Modal isOpen={showNoBallModal} onClose={() => setShowNoBallModal(false)} title="No Ball + Runs">
        <div className="lm-modal-inner">
          <p className="lm-modal-text">How many runs scored off the no ball?</p>
          <div className="lm-nb-grid">
            {[0, 1, 2, 3, 4, 6].map(r => (
              <button
                key={r}
                className={`lm-nb-btn ${r === 4 || r === 6 ? 'boundary' : ''}`}
                onClick={() => handleExtra('noball', r)}
              >
                <span className="lm-nb-plus">NB +</span>
                <span className="lm-nb-val">{r}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Edit Player Name Modal */}
      <Modal isOpen={!!editingPlayer} onClose={() => setEditingPlayer(null)} title="Edit Player Name">
        <div className="lm-modal-inner">
          <p className="lm-modal-text">Rename: {editingPlayer?.currentName}</p>
          <input
            className="lm-edit-input"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEditNameSubmit()}
            autoFocus
            placeholder="Enter correct name"
          />
          <button className="lm-confirm-btn primary" onClick={handleEditNameSubmit}>
            Save Name
          </button>
        </div>
      </Modal>

      {/* Player Input */}
      {showPlayerInput && (() => {
        const isSecondSetup = showPlayerInput.count >= 10;
        let playerType;
        if (showPlayerInput.type === 'striker') {
          playerType = (showPlayerInput.count === 1 || showPlayerInput.count === 10) ? 'Opening Batsman 1' : 'New Batsman';
        } else if (showPlayerInput.type === 'non-striker') {
          playerType = 'Opening Batsman 2';
        } else {
          playerType = (showPlayerInput.count === 3 || showPlayerInput.count === 12) ? 'Opening Bowler' : 'New Bowler';
        }
        const teamName = isSecondSetup
          ? (showPlayerInput.type === 'bowler' ? match.teams[newBowlingTeamKey]?.name : match.teams[newBattingTeamKey]?.name)
          : (showPlayerInput.type === 'bowler' ? bowlingTeam?.name : battingTeam?.name);
        return (
          <PlayerNameInput
            isOpen={true}
            onSubmit={handlePlayerNameSubmit}
            playerType={isSecondSetup ? `2nd Inn - ${playerType}` : playerType}
            teamName={teamName}
            validateName={validatePlayerName}
          />
        );
      })()}
    </div>
  );
};

export default LiveMatch;
