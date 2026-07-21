// animations.js

let warpAnim = null;

export function startWarpAnimation(fromTile, toTile) {
  warpAnim = {
    x: fromTile.x + 40,
    y: fromTile.y + 40,
    tx: toTile.x + 40,
    ty: toTile.y + 40,
    progress: 0
  };
}

export function drawWarpAnimation(ctx) {
  if (!warpAnim) return;

  warpAnim.progress += 0.05;
  if (warpAnim.progress >= 1) {
    warpAnim = null;
    return;
  }

  const x = warpAnim.x + (warpAnim.tx - warpAnim.x) * warpAnim.progress;
  const y = warpAnim.y + (warpAnim.ty - warpAnim.y) * warpAnim.progress;

  ctx.fillStyle = "cyan";
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
}
export function animateItemTransfer(fromTile, toTile) {
  let progress = 0;

  function step() {
    progress += 0.05;
    if (progress >= 1) return;

    const x = fromTile.x + 40 + (toTile.x + 40 - (fromTile.x + 40)) * progress;
    const y = fromTile.y + 40 + (toTile.y + 40 - (fromTile.y + 40)) * progress;

    const ctx = document.getElementById("mapCanvas").getContext("2d");
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(step);
  }

  step();
}
let flashTileId = null;
let flashTimer = 0;

export function flashTile(tileId) {
  flashTileId = tileId;
  flashTimer = 20;
}

export function drawFlashTile(ctx, tile) {
  if (tile.id === flashTileId && flashTimer > 0) {
    if (flashTimer % 4 < 2) {
      ctx.fillStyle = "white";
    }
    flashTimer--;
  }
}
