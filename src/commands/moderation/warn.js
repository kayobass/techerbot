const { EmbedBuilder } = require("discord.js");
const UserWarn = require("../../database/model/userWarn");
const ModLog = require("../../database/model/modLog");
const color = require("../../color.json");

module.exports = {
  name: "warn",
  aliases: ["w"],
  permission: 1,
  description: "Dá um warn a um usuário",

  async execute(client, message, args) {
    const user =
      message.mentions.users.first() ||
      (await message.client.users.fetch(args[0]).catch(() => null));
    const staff = message.member;

    if (!user) {
      return message.reply(
        "❌ Você precisa mencionar um usuário ou informar o ID.",
      );
    }

    if (user.id === message.author.id) {
      return message.reply("❌ Você não pode se auto advertir.");
    }

    if (user.bot) {
      return message.reply("❌ Você não pode advertir bots.");
    }

    const member = message.guild.members.cache.get(user.id);
    const staffPosition = staff.roles.highest.position;
    const userPosition = member.roles.highest.position;
    const username = user.globalName || user.username;

    if (userPosition >= staffPosition) {
      return message.reply(
        "❌ Você não pode dar warn em alguém com cargo igual ou maior que o seu.",
      );
    }

    const reason = args.slice(1).join(" ") || "Sem motivo";

    const userData = await UserWarn.findOne({
      userId: user.id,
      guildId: message.guild.id,
    });
    const nextWarnId = userData ? userData.warns.length + 1 : 1;

    const warnData = {
      warnId: nextWarnId,
      staffId: staff.id,
      reason,
    };

    await UserWarn.findOneAndUpdate(
      { userId: user.id, guildId: message.guild.id },
      { $push: { warns: warnData } },
      { upsert: true },
    );

    await ModLog.create({
      action: "WARN",
      userId: user.id,
      staffId: staff.id,
      reason,
      guildId: message.guild.id,
    }).then(() => {
      const embedLog = new EmbedBuilder()
        .setTitle("📝 Registro de Moderação - Warn")
        .setDescription(
          `**🎠 Usuário:** <@${user.id}> | \`${user.id}\` (*${username}*) [\`${nextWarnId}\` warns]\n\n**🦺 Staff:** <@${staff.id}> | \`${staff.id}\` (*${staff.user.globalName}*)\n\n**💼 Motivo:** \`${reason}\``,
        )
        .setColor(color.default)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({
          text: staff.user.globalName,
          iconURL: staff.user.displayAvatarURL(),
        })
        .setTimestamp();

      message.guild.channels
        .fetch(process.env.LOG_CHANNEL)
        .then((channel) => {
          if (userData.warns.length >= 4) {
            channel
              .send({
                content: `<@&${process.env.ROLE_BAN}>`,
                embeds: [embedLog],
              })
              .catch(() => null);
          } else {
            channel.send({ embeds: [embedLog] }).catch(() => null);
          }
        })
        .catch(() => null);
    });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: staff.user.globalName,
        iconURL: staff.user.displayAvatarURL(),
      })
      .setTitle("⚠️ Warn")
      .setAuthor({
        name: staff.user.globalName,
        iconURL: staff.user.displayAvatarURL(),
      })
      .setColor(color.default)
      .setDescription(
        `-> O usuário ${user} (\`${user.id}\`) foi advertido!\n\n**💼 Motivo:** \`${reason}\``,
      )
      .setFooter({
        text: `Esse é o warn número: ${nextWarnId}`,
        iconURL: user.displayAvatarURL(),
      })
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
