// server/mapGenerator.js
const Tile = require("./Tile");
const TILE_TYPES = require("./tileTypes");

function randomTileType() {
  const pool = [
    TILE_TYPES.ASSET,
    TILE_TYPES.ITEM,
    TILE_TYPES.DICE,
    TILE_TYPES.SHOP,
    TILE_TYPES.BUILD,
    TILE_TYPES.EVENT,
    TILE_TYPES.WARP_NET,
    TILE_TYPES.EXCHANGE,
    TILE_TYPES.TAX
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function getNeighbors(tile, tiles, width, height) {
  const x = tile.x / 100;
  const y = tile.y / 100;

  const dirs = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ];

  const neighbors = [];

  dirs.forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;

    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const id = ny * width + nx;
      neighbors.push(tiles[id]);
    }
  });

  return neighbors;
}

function generateMap2D() {
  const width = 6;
  const height = 6;
  const tiles = [];
  let id = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push(
        new Tile(id, randomTileType(), x * 100, y * 100, [])
      );
      id++;
    }
  }

  tiles.forEach(tile => {
    const neighbors = getNeighbors(tile, tiles, width, height);
    const next = neighbors
      .sort(() => Math.random() - 0.5)
      .slice(0, 1 + Math.floor(Math.random() * 3))
      .map(n => n.id);
    tile.next = next;
  });

  tiles[0].type = TILE_TYPES.START;
  tiles[tiles.length - 1].type = TILE_TYPES.TREASURE;

  return tiles;
}

module.exports = { generateMap2D };
