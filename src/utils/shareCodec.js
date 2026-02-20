import { formatOvers } from './formatters';

// ── Base64url helpers (Unicode-safe) ──

function utf8ToBase64url(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlToUtf8(b64) {
  let base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// ── Dismissal text builder ──

function getDismissalString(player, bowlingTeam) {
  if (!player.battingStats.isOut) return '';
  const type = player.battingStats.dismissalType;
  const bowler = bowlingTeam?.getPlayer(player.battingStats.dismissedBy);
  const bn = bowler?.name || '';
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
}

// ── Extract compact scorecard data from Match object ──

function extractScorecardData(match) {
  // Determine which team batted first (after second innings, teams are swapped)
  const firstBatKey = match.currentState.bowlingTeam;
  const firstBowlKey = match.currentState.battingTeam;
  const secondBatKey = firstBowlKey;
  const secondBowlKey = firstBatKey;

  const buildInningsData = (innings, batTeamKey, bowlTeamKey) => {
    if (!innings) return null;
    const batTeam = match.teams[batTeamKey];
    const bowlTeam = match.teams[bowlTeamKey];

    const batters = batTeam.getAllPlayers()
      .filter(p => p.battingStats.balls > 0 || p.battingStats.isOut)
      .map(p => [
        p.name,
        p.battingStats.runs,
        p.battingStats.balls,
        p.battingStats.fours,
        p.battingStats.sixes,
        p.battingStats.strikeRate,
        p.battingStats.isOut ? 1 : 0,
        getDismissalString(p, bowlTeam)
      ]);

    const bowlers = bowlTeam.getAllPlayers()
      .filter(p => p.bowlingStats.balls > 0)
      .map(p => [
        p.name,
        parseFloat(formatOvers(p.bowlingStats.overs)),
        p.bowlingStats.maidens,
        p.bowlingStats.runs,
        p.bowlingStats.wickets,
        p.bowlingStats.economyRate
      ]);

    const fow = (innings.fallOfWickets || []).map(f => {
      const batter = batTeam.getPlayer(f.batsmanId);
      return [f.runs, f.wickets, f.overs, batter?.name || '?'];
    });

    return {
      bt: batTeamKey === 'teamA' ? 'A' : 'B',
      s: [innings.score.runs, innings.score.wickets, innings.score.overs],
      ex: [innings.extras.total, innings.extras.wides, innings.extras.noBalls,
           innings.extras.byes, innings.extras.legByes],
      b: batters,
      w: bowlers,
      f: fow
    };
  };

  const mom = match.getManOfMatch();

  return {
    v: 1,
    ts: match.timestamp instanceof Date
      ? match.timestamp.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    ov: match.config.totalOvers,
    tA: match.teams.teamA.name,
    tB: match.teams.teamB.name,
    r: {
      w: match.result.winner === 'tie' ? 'T'
        : match.result.winner === 'teamA' ? 'A' : 'B',
      m: match.result.margin
    },
    mom: mom ? { n: mom.player.name, s: mom.summary } : null,
    i1: buildInningsData(match.innings.first, firstBatKey, firstBowlKey),
    i2: buildInningsData(match.innings.second, secondBatKey, secondBowlKey)
  };
}

// ── Public API ──

export function encodeMatchForShare(match) {
  const data = extractScorecardData(match);
  const json = JSON.stringify(data);
  const encoded = utf8ToBase64url(json);
  return `${window.location.origin}/shared#${encoded}`;
}

export function decodeSharedMatch(hash) {
  try {
    if (!hash || hash.length === 0) return null;
    const json = base64urlToUtf8(hash);
    const data = JSON.parse(json);
    if (data.v !== 1) return null;
    return data;
  } catch (e) {
    console.error('Failed to decode shared scorecard:', e);
    return null;
  }
}
