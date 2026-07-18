// server/GameState.js
const { generateMap2D } = require("./mapGenerator");
const TILE_TYPES = require("./tileTypes");
const CHARACTER_ITEMS = require("./characters");
const ITEM_EFFECTS = require("./items");

class GameState {
  constructor(roomName, players) {
    this.roomName = roomName;
    this.players = players.map(p => ({
      id: p.id,
      name: p.name,
      life: 10,
      position: 0,
      treasures: 0,
      items: [],
      diceInventory: [],
      skipTurn: false,
      boostNextDice: 0,
      legIronTurns: 0,
      characterId: null
    }));

    this.map = generateMap2D();
    this.currentPlayerIndex = 0;
    this.phase = "start";
    this.round = 1;
    this.lock = false;
    this.pendingBranch = {};
  }

  getPlayer(id) {
    return this.players.find(p => p.id === id);
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  isPlayerTurn(playerId) {
    return this.getCurrentPlayer().id === playerId;
  }

  canAct(playerId) {
    return (
      this.isPlayerTurn(playerId) &&
      this.phase === "action" &&
      !this.lock
    );
  }

  rollDice(playerId) {
    const p = this.getPlayer(playerId);
    let base = 1 + Math.floor(Math.random() * 6);
    base += p.boostNextDice;
    if (p.legIronTurns > 0) {
      base = Math.max(1, base - 2);
      p.legIronTurns--;
    }
    p.boostNextDice = 0;
    return base;
  }

  movePlayer(player, steps) {
    while (steps > 0) {
      const tile = this.map[player.position];

      if (tile.next.length > 1) {
        this.pendingBranch[player.id] = tile.next;
        return { branchChoice: tile.next };
      }

      if (tile.next.length === 0) break;

      player.position = tile.next[0];
      steps--;
    }

    return this.resolveTileEffect(player);
  }

  resolveTileEffect(player) {
    const tile = this.map[player.position];

    switch (tile.type) {
      case TILE_TYPES.WARP_NET: {
        const same = this.map.filter(t => t.type === TILE_TYPES.WARP_NET);
        const dest = same[Math.floor(Math.random() * same.length)];
        const old = player.position;
        player.position = dest.id;
        return { event: "warp_net", oldPosition: old, newPosition: dest.id, playerId: player.id };
      }

      case TILE_TYPES.EXCHANGE: {
        const others = this.players.filter(p => p.id !== player.id);
        if (others.length === 0 || player.items.length === 0) {
          return { event: "exchange_fail", playerId: player.id };
        }
        const target = others[Math.floor(Math.random() * others.length)];
        const myItem = player.items.pop();
        const targetItem = target.items.length > 0 ? target.items.pop() : null;
        player.items.push(targetItem);
        target.items.push(myItem);
        return {
          event: "exchange",
          playerId: player.id,
          targetId: target.id
        };
      }

      case TILE_TYPES.TAX: {
        const tax = Math.min(15, player.life);
        player.life -= tax;
        if (player.life <= 0) {
          player.life = 10;
          player.position = 0;
        }
        return { event: "tax", playerId: player.id, value: -tax };
      }

      default:
        return null;
    }
  }

  useItem(playerId, itemType, targetId = null) {
    const user = this.getPlayer(playerId);
    if (!user) return;
    const idx = user.items.indexOf(itemType);
    if (idx === -1) return;
    user.items.splice(idx, 1);

    const target = targetId ? this.getPlayer(targetId) : null;
    const fn = ITEM_EFFECTS[itemType];
    if (fn) fn(this, user, target);
  }

  generateShopItems(playerId) {
    const player = this.getPlayer(playerId);
    const charId = player.characterId;
    const charItems = CHARACTER_ITEMS[charId] || [];

    const allItems = [
      ...charItems
    ];

    const items = [];
    for (let i = 0; i < 3; i++) {
      const type = allItems[Math.floor(Math.random() * allItems.length)];
      items.push({
        category: "item",
        type,
        price: 10 + Math.floor(Math.random() * 11)
      });
    }
    return items;
  }

  nextTurn() {
    do {
      this.currentPlayerIndex++;
      if (this.currentPlayerIndex >= this.players.length) {
        this.currentPlayerIndex = 0;
        this.round++;
      }
      const p = this.getCurrentPlayer();
      if (p.skipTurn) {
        p.skipTurn = false;
        continue;
      }
    } while (false);
    this.phase = "start";
  }

  toJSON() {
    return {
      players: this.players,
      map: this.map,
      currentPlayerId: this.getCurrentPlayer().id,
      round: this.round,
      phase: this.phase
    };
  }
}

module.exports = GameState;
