// server/items.js
module.exports = {
  // 戦士
  power_slash(gs, user, target) {
    if (!target) return;
    const dmg = 8;
    target.life -= dmg;
    if (target.life < 0) target.life = 0;
  },

  shield_wall(gs, user) {
    user.boostNextDice += 3;
  },

  // 魔法使い
  fire_blast(gs, user, target) {
    if (!target) return;
    target.life -= 5;
    user.life += 3;
  },

  mana_boost(gs, user) {
    user.boostNextDice += 4;
  },

  // 盗賊
  steal_plus(gs, user, target) {
    if (!target) return;
    const steal = Math.min(7, target.life);
    target.life -= steal;
    user.life += steal;
  },

  shadow_step(gs, user) {
    user.position = Math.floor(Math.random() * gs.map.length);
  },

  // ロボット
  overclock(gs, user) {
    user.boostNextDice += 6;
  },

  system_repair(gs, user) {
    user.life += 15;
  }
};
