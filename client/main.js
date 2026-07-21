const socket = new WebSocket("ws://localhost:8080");
let currentState = null;
let currentMap = [];
let playerSprites = {};
let characterImages = {
  warrior: "assets/characters/warrior.png",
  mage: "assets/characters/mage.png",
  thief: "assets/characters/thief.png",
  robot: "assets/characters/robot.png"
};
let myId = Math.random().toString(36).slice(2);

socket.addEventListener("open", () => {
  const name = prompt("名前を入力してね", "太郎");
  socket.send(JSON.stringify({ type: "join", name, playerId: myId }));
});

socket.addEventListener("message", event => {
  const msg = JSON.parse(event.data);

  if (msg.type === "stateUpdate") {
    currentState = msg.state;
    currentMap = msg.state.map;
    initSprites(currentState.players);
    renderStatusUI(currentState.players);
  }

  if (msg.type === "turnStart") {
    const myTurn = msg.playerId === myId;
    document.getElementById("rollButton").disabled = !myTurn;
  }
});

document.getElementById("rollButton").onclick = () => {
  socket.send(JSON.stringify({ type: "rollDice", playerId: myId }));
};

function initSprites(players) {
  players.forEach(p => {
    const tile = currentMap.find(t => t.id === p.position);
    if (!playerSprites[p.id]) {
      playerSprites[p.id] = {
        x: tile.x + 40,
        y: tile.y + 40,
        targetX: tile.x + 40,
        targetY: tile.y + 40
      };
    } else {
      playerSprites[p.id].targetX = tile.x + 40;
      playerSprites[p.id].targetY = tile.y + 40;
    }
  });
}

function gameLoop() {
  const canvas = document.getElementById("mapCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentMap.length > 0) {
    drawMap(currentMap);
  }
  if (currentState && currentState.players) {
    drawPlayers(ctx, currentState.players, playerSprites, characterImages);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
function resizeCanvas() {
  const canvas = document.getElementById("mapCanvas");
  canvas.width = window.innerWidth - 260; // 左UI分を引く
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
function bindButton(id, handler) {
  const btn = document.getElementById(id);
  btn.addEventListener("click", handler);
  btn.addEventListener("touchstart", e => {
    e.preventDefault();
    handler();
  });
}

bindButton("rollButton", () => {
  socket.send(JSON.stringify({ type: "rollDice", playerId: myId }));
});
function sendChat() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  socket.send(JSON.stringify({
    type: "chat",
    playerId: myId,
    text
  }));

  input.value = "";
}

document.getElementById("chatSend").addEventListener("click", sendChat);
document.getElementById("chatSend").addEventListener("touchstart", e => {
  e.preventDefault();
  sendChat();
});
socket.addEventListener("message", event => {
  const msg = JSON.parse(event.data);

  if (msg.type === "chat") {
    addChatMessage(msg.playerId, msg.text);
  }

  // 既存の stateUpdate や turnStart はそのまま
});
function addChatMessage(playerId, text) {
  const box = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.textContent = `${playerId}: ${text}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
