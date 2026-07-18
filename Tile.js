// server/Tile.js
const TILE_TYPES = require("./tileTypes");

class Tile {
  constructor(id, type = TILE_TYPES.ASSET, x = 0, y = 0, next = []) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.next = next;
    this.ownerId = null; // 建築マス用
  }
}

module.exports = Tile;
