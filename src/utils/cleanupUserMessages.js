const { ChannelType } = require("discord.js");

module.exports = async function cleanupUserMessages(guild, userId) {
  const channels = guild.channels.cache.filter(
    (c) => c.type === ChannelType.GuildText
  );

  for (const channel of channels.values()) {
    try {
      const messages = await channel.messages.fetch({ limit: 100 });
      const userMessages = messages.filter((msg) => msg.author.id === userId);

      if (userMessages.size > 0) {
        await channel.bulkDelete(userMessages, true);
      }
    } catch {
      continue;
    }
  }
};
