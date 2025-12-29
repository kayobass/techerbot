const { Events, AuditLogEvent } = require("discord.js");
const { registerAction } = require("../../security/antiRaid");

module.exports = {
  name: Events.GuildBanAdd,
  once: false,
  async execute(ban) {
    const logs = await ban.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberBanAdd,
      limit: 1,
    });

    const entry = logs.entries.first();
    if (!entry) return;

    registerAction("ban", ban.guild, entry.executor.id);
  },
};
