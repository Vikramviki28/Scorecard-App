/**
 * Application constants
 */

export const WICKET_TYPES = {
  BOWLED: 'bowled',
  CAUGHT: 'caught',
  LBW: 'lbw',
  RUN_OUT: 'run-out',
  STUMPED: 'stumped',
  HIT_WICKET: 'hit-wicket',
  RETIRED_HURT: 'retired-hurt',
  RETIRED_OUT: 'retired-out'
};

export const EXTRA_TYPES = {
  WIDE: 'wide',
  NO_BALL: 'no-ball',
  BYE: 'bye',
  LEG_BYE: 'leg-bye'
};

export const MATCH_STATUS = {
  SETUP: 'setup',
  LIVE: 'live',
  INNINGS_BREAK: 'innings-break',
  COMPLETED: 'completed'
};

export const MATCH_TYPES = {
  LIMITED: 'limited',
  UNLIMITED: 'unlimited'
};

export const DEFAULT_CONFIG = {
  TOTAL_OVERS: 10,
  PLAYERS_PER_TEAM: 11,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 15,
  MATCH_TYPE: MATCH_TYPES.LIMITED
};

export const STORAGE_KEYS = {
  CURRENT_MATCH: 'stumps2stumps_current_match',
  MATCH_HISTORY: 'stumps2stumps_match_history',
  SETTINGS: 'stumps2stumps_settings',
  PLAYERS: 'stumps2stumps_players'
};

export const TOSS_DECISIONS = {
  BAT: 'bat',
  BOWL: 'bowl'
};
