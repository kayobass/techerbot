const { EmbedBuilder } = require("discord.js");
const color = require("../../color.json");

module.exports = {
  name: "help",
  aliases: ["h", "ajuda"],
  description: "Exibe a lista de comandos disponíveis",

  async execute(client, message) {
    const commandsMap = new Map();

    for (const command of client.commands.values()) {
      if (!commandsMap.has(command.name)) {
        commandsMap.set(command.name, command);
      }
    }

    const description = [...commandsMap.values()]
      .map((cmd) => {
        const aliases =
          cmd.aliases && cmd.aliases.length
            ? `(${cmd.aliases.join(", ")})`
            : "";

        return `**\`${cmd.name}\`** ${aliases}\n> ${
          cmd.description || "Sem descrição"
        }`;
      })
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("📖 Central de Ajuda")
      .setDescription(description)
      .setColor(color.default)
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }))
      .setFooter({
        text: `Total de comandos: ${commandsMap.size}`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    message.reply({ embeds: [embed] }).catch(() => null);
  },
};
