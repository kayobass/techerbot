const { EmbedBuilder } = require("discord.js");
const UserWarn = require("../../database/model/userWarn");
const ModLog = require("../../database/model/modLog");
const color = require("../../color.json");

module.exports = {
  name: "criticalwarn",
  aliases: ["cw"],
  permission: 1,
  description: "Dá um critical warn a um usuário (equivale a 2 warns)",

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

    let userData = await UserWarn.findOne({
      userId: user.id,
      guildId: message.guild.id,
    });
    if (!userData) {
      userData = await UserWarn.create({
        userId: user.id,
        guildId: message.guild.id,
        warns: [],
      });
    }

    const nextWarnId = userData ? userData.warns.length + 1 : 1;

    for (let i = 0; i < 2; i++) {
      const warnData = {
        warnId: nextWarnId + i,
        staffId: staff.id,
        reason,
      };
      userData.warns.push(warnData);
    }

    await userData.save();

    await ModLog.create({
      action: "CRITICAL_WARN",
      userId: user.id,
      staffId: staff.id,
      reason,
      guildId: message.guild.id,
    }).then(() => {
      const embedLog = new EmbedBuilder()
        .setTitle("📝 Registro de Moderação - Critical Warn")
        .setDescription(
          `**🎠 Usuário:** <@${user.id}> | \`${user.id}\` (*${username}*) [\`${userData.warns.length}\` warns] \n\n**🦺 Staff:** <@${staff.id}> | \`${staff.id}\` (*${staff.user.globalName}*) \n\n**💼 Motivo:** \`${reason}\``,
        )
        .setColor(color.criticalwarn)
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
      .setTitle("⚠️ Critical Warn")
      .setColor(color.criticalwarn)
      .setDescription(
        `-> O usuário <@${user.id}> (\`${user.id}\`) recebeu um **critical warn**!\n**💼 Motivo:** \`${reason}\``,
      )
      .setFooter({
        text: `Esse é o warn número: ${userData.warns.length}`,
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
