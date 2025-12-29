const thresholds = require("./thresholds");
const punishments = require("./punishments");
const isWhitelisted = require("./whitelist");

const actions = new Map();

/**
 * @param {string} actionType
 * @param {Guild} guild
 * @param {string} executorId
 */

async function registerAction(actionType, guild, executorId) {
  if (isWhitelisted(executorId)) return;

  const config = thresholds[actionType];
  if (!config) return;

  const key = `${actionType}:${executorId}`;
  const now = Date.now();

  if (!actions.has(key)) actions.set(key, []);
  const timestamps = actions.get(key);

  timestamps.push(now);

  // remove ações antigas
  while (timestamps[0] < now - config.interval) {
    timestamps.shift();
  }

  if (timestamps.length >= config.limit) {
    actions.delete(key);

    const member = await guild.members.fetch(executorId).catch(() => null);
    if (!member) return;

    const reason = `🚨 Anti-Raid: ${actionType} em massa`;

    if (config.punishment === "BAN") {
      await punishments.banMember(member, reason);
    }

    if (config.punishment === "STRIP_ROLES") {
      await punishments.stripRoles(member, reason);
    }
  }
}

module.exports = {
  registerAction,
};
