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

    const permissionLevel = command.permission ?? 0;

    if (permissionLevel > 0) {
      const memberRoles = message.member.roles.cache;

      const permissionRoles = {
        1: process.env.ROLE_WARN,
        2: process.env.ROLE_MUTE,
        3: process.env.ROLE_KICK,
        4: process.env.ROLE_BAN,
      };

      const requiredRoleId = permissionRoles[permissionLevel];

      if (!memberRoles.has(requiredRoleId)) return;
    }

    try {
      await command.execute(client, message, args);
    } catch (err) {
      console.error(err);
      message.reply("❌ Erro ao executar o comando.");
    }
  },
};
