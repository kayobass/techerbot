const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ModLog = require("../../database/model/modLog");
const color = require("../../color.json");

module.exports = {
  name: "untimeout",
  aliases: ["ut"],
  permission: 2,

  async execute(client, message, args) {
    const user =
      message.mentions.users.first() ||
      (await message.client.users.fetch(args[0]).catch(() => null));
    const staff = message.member;

    if (!user) {
      return message.reply(
        "❌ Você precisa mencionar um usuário ou informar o ID."
      );
    }

    if (user.bot) {
      return message.reply("❌ Você não pode remover timeout de bots.");
    }

    const member = message.guild.members.cache.get(user.id);

    if (!member) {
      return message.reply("❌ O usuário não está no servidor.");
    }

    const isTimedOut =
      member.communicationDisabledUntilTimestamp &&
      member.communicationDisabledUntilTimestamp > Date.now();

    if (!isTimedOut) {
      return message.reply("❌ Este usuário não está em timeout.");
    }

    const reason = args.slice(1).join(" ") || "Sem motivo";

    await member
      .timeout(null, `${staff.user.username} -> ${reason}`)
      .catch(() => null);

    await ModLog.create({
      action: "UNTIMEOUT",
      userId: user.id,
      staffId: staff.id,
      reason,
      guildId: message.guild.id,
    });

    const embedLog = new EmbedBuilder()
      .setTitle("📝 Registro de Moderação - UnTimeout")
      .setDescription(
        `**🦺 Usuário:** <@${user.id}> (\`${user.id}\`)\n` +
          `**⚔ Staff:** <@${staff.id}> (\`${staff.id}\`)\n` +
          `**💼 Motivo:** \`${reason}\``
      )
      .setColor(color.timeout)
      .setThumbnail(user.displayAvatarURL())
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

    const successEmbed = new EmbedBuilder()
      .setTitle("🔊 UnTimeout")
      .setAuthor({
        name: staff.user.globalName,
        iconURL: staff.user.displayAvatarURL(),
      })
      .setColor(color.timeout)
      .setDescription(
        `O timeout do usuário <@${user.id}> (\`${user.id}\`) foi removido!\n` +
          `**💼 Motivo:** \`${reason}\``
      )
      .setFooter({
        text: `${user.globalName} foi liberado`,
        iconURL: user.displayAvatarURL(),
      })
      .setTimestamp();

    await message.reply({ embeds: [successEmbed] });
  },
};
