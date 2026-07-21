function getTileColor(type) {
  switch (type) {
    case "start": return "#4caf50";
    case "treasure": return "#ffd700";
    case "asset": return "#2196f3";
    case "item": return "#9c27b0";
    case "dice": return "#ff9800";
    case "shop": return "#795548";
    case "build": return "#607d8b";
    case "event": return "#e91e63";
    case "warp_net": return "#00bcd4";
    case "exchange": return "#ff5722";
    case "tax": return "#f44336";
    default: return "#555";
  }
}

function drawLine(x1, y1, x2, y2) {
  const ctx = document.getElementById("mapCanvas").getContext("2d");
  ctx.strokeStyle = "#aaa";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawMap(map) {
  const ctx = document.getElementById("mapCanvas").getContext("2d");

  map.forEach(tile => {
    ctx.fillStyle = getTileColor(tile.type);
    ctx.fillRect(tile.x, tile.y, 80, 80);

    ctx.fillStyle = "#fff";
    ctx.fillText(tile.id, tile.x + 30, tile.y + 45);

    tile.next.forEach(nextId => {
      const nextTile = map.find(t => t.id === nextId);
      drawLine(tile.x + 40, tile.y + 40, nextTile.x + 40, nextTile.y + 40);
    });
  });
}
