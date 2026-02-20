import { generateId } from '../utils/helpers';
import { Player } from './Player';

/**
 * Team model representing a cricket team
 */
export class Team {
  constructor(name) {
    this.id = generateId();
    this.name = name;
    this.players = [];
  }

  /**
   * Add a player to the team
   * @param {string} playerName - Name of the player
   * @returns {Player} The created player
   */
  addPlayer(playerName) {
    const player = new Player(playerName);
    this.players.push(player);
    return player;
  }

  /**
   * Remove a player from the team
   * @param {string} playerId - ID of the player to remove
   */
  removePlayer(playerId) {
    this.players = this.players.filter(player => player.id !== playerId);
  }

  /**
   * Get a player by ID
   * @param {string} playerId - ID of the player
   * @returns {Player|undefined}
   */
  getPlayer(playerId) {
    return this.players.find(player => player.id === playerId);
  }

  /**
   * Get a player by name
   * @param {string} playerName - Name of the player
   * @returns {Player|undefined}
   */
  getPlayerByName(playerName) {
    return this.players.find(
      player => player.name.toLowerCase() === playerName.toLowerCase()
    );
  }

  /**
   * Get all players
   * @returns {Array<Player>}
   */
  getAllPlayers() {
    return this.players;
  }

  /**
   * Get available batsmen (not out)
   * @returns {Array<Player>}
   */
  getAvailableBatsmen() {
    return this.players.filter(player => !player.battingStats.isOut);
  }

  /**
   * Get available bowlers
   * @returns {Array<Player>}
   */
  getAvailableBowlers() {
    return this.players;
  }

  /**
   * Convert team to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      players: this.players.map(player => player.toJSON())
    };
  }

  /**
   * Create Team instance from plain object
   * @param {Object} data - Team data
   * @returns {Team}
   */
  static fromJSON(data) {
    const team = new Team(data.name);
    team.id = data.id;
    team.players = data.players.map(playerData => Player.fromJSON(playerData));
    return team;
  }
}
