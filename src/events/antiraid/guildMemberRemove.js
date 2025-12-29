const { Events, AuditLogEvent } = require("discord.js");
const { registerAction } = require("../../security/antiRaid");

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member) {
    const logs = await member.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberKick,
      limit: 1,
    });

    const entry = logs.entries.first();
    if (!entry) return;

    if (Date.now() - entry.createdTimestamp > 5000) return;

    registerAction("kick", member.guild, entry.executor.id);
  },
};
