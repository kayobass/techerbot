const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ModLog = require("../../database/model/modLog");
const color = require("../../color.json");

module.exports = {
  name: "unban",
  aliases: ["ub"],
  permission: 4,
  description: "Desbane um usuário do servidor",

  async execute(client, message, args) {
    const staff = message.member;
    const userId = args[0];

    if (!userId) {
      return message.reply("❌ Você precisa informar o ID do usuário.");
    }

    const reason = args.slice(1).join(" ") || "Sem motivo";

    const banList = await message.guild.bans.fetch().catch(() => null);
    const bannedUser = banList?.get(userId);

    if (!bannedUser) {
      return message.reply("❌ Esse usuário não está banido neste servidor.");
    }

    await message.guild.members
      .unban(userId, `${staff.user.username} -> ${reason}`)
      .catch(() => null);

    await ModLog.create({
      action: "UNBAN",
      userId,
      staffId: staff.id,
      reason,
      guildId: message.guild.id,
    }).then(() => {
      const embedLog = new EmbedBuilder()
        .setTitle("📝 Registro de Moderação - Unban")
        .setDescription(
          `**🦺 Usuário:** <@${userId}> (\`${userId}\`)\n**⚔ Staff:** <@${staff.id}> (\`${staff.id}\`)\n**💼 Motivo:** \`${reason}\``
        )
        .setColor(color.ban)
        .setFooter({
          text: staff.user.globalName,
          iconURL: staff.user.displayAvatarURL(),
        })
        .setTimestamp();

      message.guild.channels
        .fetch(process.env.LOG_CHANNEL)
        .then((channel) => {
          channel.send({ embeds: [embedLog] }).catch(() => null);
        })
        .catch(() => null);
    });

    const embed = new EmbedBuilder()
      .setTitle("🔓 Unban")
      .setAuthor({
        name: staff.user.globalName,
        iconURL: staff.user.displayAvatarURL(),
      })
      .setColor(color.ban)
      .setDescription(
        `O usuário <@${userId}> (\`${userId}\`) foi desbanido!\n**💼 Motivo:** \`${reason}\``
      )
      .setTimestamp();

    message
      .reply({ embeds: [embed] })
      .then((sentMessage) => {
        setTimeout(() => {
          sentMessage.delete().catch(() => null);
          message.delete().catch(() => null);
        }, 60_000);
      })
      .catch(() => null);
  },
};
