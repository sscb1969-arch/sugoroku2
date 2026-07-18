// server/server.js
const WebSocket = require("ws");
const GameState = require("./GameState");

const wss = new WebSocket.Server({ port: 8080 });

const rooms = {};

wss.on("connection", ws => {
  let roomName = "default";
  let playerId = Math.random().toString(36).slice(2);

  if (!rooms[roomName]) {
    rooms[roomName] = {
      clients: [],
      gameState: null
    };
  }

  rooms[roomName].clients.push({ ws, id: playerId });

  ws.on("message", data => {
    const msg = JSON.parse(data);
    const room = rooms[roomName];

    if (msg.type === "join") {
      if (!room.gameState) {
        room.gameState = new GameState(roomName, [
          { id: playerId, name: msg.name }
        ]);
      } else {
        room.gameState.players.push({
          id: playerId,
          name: msg.name,
          life: 10,
          position: 0,
          treasures: 0,
          items: [],
          diceInventory: [],
          skipTurn: false,
          boostNextDice: 0,
          legIronTurns: 0,
          characterId: null
        });
      }
      broadcast(roomName, {
        type: "stateUpdate",
        state: room.gameState.toJSON()
      });
    }

    if (msg.type === "selectCharacter") {
      const gs = room.gameState;
      const p = gs.getPlayer(msg.playerId);
      if (p) p.characterId = msg.characterId;
      broadcast(roomName, {
        type: "stateUpdate",
        state: gs.toJSON()
      });
    }

    if (msg.type === "turnStartRequest") {
      const gs = room.gameState;
      if (gs.getCurrentPlayer().id === msg.playerId) {
        gs.phase = "action";
        broadcast(roomName, {
          type: "turnStart",
          playerId: msg.playerId,
          round: gs.round
        });
      }
    }

    if (msg.type === "rollDice") {
      const gs = room.gameState;
      if (!gs.canAct(msg.playerId)) return;

      gs.lock = true;
      gs.phase = "moving";

      const steps = gs.rollDice(msg.playerId);
      const player = gs.getPlayer(msg.playerId);
      const moveResult = gs.movePlayer(player, steps);

      gs.lock = false;
      gs.phase = "end";
      gs.nextTurn();

      broadcast(roomName, {
        type: "stateUpdate",
        state: gs.toJSON(),
        diceResult: { playerId: msg.playerId, steps },
        eventResult: moveResult
      });
    }

    if (msg.type === "chooseBranch") {
      const gs = room.gameState;
      const p = gs.getPlayer(msg.playerId);
      p.position = msg.tileId;
      const eventResult = gs.resolveTileEffect(p);
      gs.phase = "end";
      gs.nextTurn();

      broadcast(roomName, {
        type: "stateUpdate",
        state: gs.toJSON(),
        eventResult
      });
    }

    if (msg.type === "useItem") {
      const gs = room.gameState;
      if (!gs.canAct(msg.playerId)) return;
      gs.useItem(msg.playerId, msg.itemType, msg.targetId);
      broadcast(roomName, {
        type: "stateUpdate",
        state: gs.toJSON()
      });
    }
    if (msg.type === "chat") {
  broadcast(roomName, {
    type: "chat",
    playerId: msg.playerId,
    text: msg.text
    });
  }

  });

  ws.on("close", () => {
    const room = rooms[roomName];
    if (!room) return;
    room.clients = room.clients.filter(c => c.ws !== ws);
  });
});

function broadcast(roomName, msg) {
  const room = rooms[roomName];
  if (!room) return;
  room.clients.forEach(c => {
    c.ws.send(JSON.stringify(msg));
  });
}
