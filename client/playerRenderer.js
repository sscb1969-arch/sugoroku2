function drawPlayers(ctx, players, sprites, characterImages) {
  players.forEach(p => {
    const sprite = sprites[p.id];
    if (!sprite) return;

    sprite.x += (sprite.targetX - sprite.x) * 0.1;
    sprite.y += (sprite.targetY - sprite.y) * 0.1;

    const img = new Image();
    img.src = characterImages[p.characterId || "warrior"];
    ctx.drawImage(img, sprite.x - 32, sprite.y - 32, 64, 64);
  });
}
