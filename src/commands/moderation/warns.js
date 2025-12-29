const { EmbedBuilder } = require("discord.js");
const UserWarn = require("../../database/model/userWarn");
const color = require("../../color.json");

module.exports = {
  name: "warns",
  aliases: ["ws"],
  permission: 1,
  description: "Exibe os warns de um usuário",

  async execute(client, message, args) {
    const user =
      message.mentions.users.first() ||
      (await message.client.users.fetch(args[0]).catch(() => null));

    if (!user || user.bot) {
      return message.reply(
        "❌ Você precisa mencionar um usuário ou informar o ID."
      );
    }

    const userData = await UserWarn.findOne({
      userId: user.id,
      guildId: message.guild.id,
    });

    if (!userData || userData.warns.length === 0) {
      return message.reply(
        `O usuário \`${user.globalName}\` não possui warns.`
      );
    }

    const warnsDescription = userData.warns
      .map((w, i) => {
        const timestamp = `<t:${Math.floor(
          new Date(w.createdAt).getTime() / 1000
        )}:F>`;
        return `**#${i + 1}** | Autor: <@${w.staffId}> | Motivo: \`${
          w.reason
        }\` | Data: ${timestamp}\n`;
      })
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`📄 Warns de ${user.globalName.toUpperCase()}`)
      .setDescription(warnsDescription)
      .setThumbnail(user.displayAvatarURL())
      .setColor(color.default)
      .setFooter({
        text: message.author.globalName,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.reply({ embeds: [embed] }).catch(() => null);
  },
};
