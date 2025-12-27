const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  once: false,

  async execute(message, client) {
    if (message.author.bot) return;

    const prefix = process.env.PREFIX;
    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const commandName = client.commands.has(cmdName)
      ? cmdName
      : client.aliases.get(cmdName);

    if (!commandName) return;

    const command = client.commands.get(commandName);

    // sistema de permissões depois

    try {
      await command.execute(client, message, args);
    } catch (err) {
      console.error(err);
      message.reply("❌ Erro ao executar o comando.");
    }
  },
};
