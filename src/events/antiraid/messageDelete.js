const { Events, AuditLogEvent } = require("discord.js");
const { registerAction } = require("../../security/antiRaid");

module.exports = {
  name: Events.MessageDelete,
  once: false,
  async execute(message) {
    if (!message.guild) return;

    const logs = await message.guild.fetchAuditLogs({
      type: AuditLogEvent.MessageDelete,
      limit: 1,
    });

    const entry = logs.entries.first();
    if (!entry) return;

    if (entry.executor.id === message.author?.id) return;
    if (entry.executor?.bot) return;

    registerAction("messageDelete", message.guild, entry.executor.id);
  },
};
