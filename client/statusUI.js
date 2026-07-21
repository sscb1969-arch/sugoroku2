function renderStatusUI(players) {
  const container = document.getElementById("statusContainer");
  container.innerHTML = "";

  players.forEach(p => {
    const div = document.createElement("div");
    div.className = "playerStatus";

    const icon = document.createElement("div");
    icon.className = "playerIcon";
    icon.innerText = p.characterId || "?";

    const name = document.createElement("div");
    name.innerText = p.name;

    const hpBar = document.createElement("div");
    hpBar.className = "hpBar";

    const hpFill = document.createElement("div");
    hpFill.className = "hpFill";
    hpFill.style.width = `${p.life * 10}%`;

    hpBar.appendChild(hpFill);

    const treasure = document.createElement("div");
    treasure.innerText = `宝: ${p.treasures}`;

    const items = document.createElement("div");
    items.innerText = `アイテム: ${p.items.join(", ")}`;

    div.appendChild(icon);
    div.appendChild(name);
    div.appendChild(hpBar);
    div.appendChild(treasure);
    div.appendChild(items);

    container.appendChild(div);
  });
}
