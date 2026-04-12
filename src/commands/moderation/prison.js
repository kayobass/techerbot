const { EmbedBuilder } = require("discord.js");
const ModLog = require("../../database/model/modLog");
const color = require("../../color.json");

module.exports = {
  name: "prison",
  aliases: ["p"],
  permission: 2,
  description: "Prende um usuário na prisão do servidor",

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
      return message.reply("❌ Você não pode se auto prender.");
    }

    if (user.bot) {
      return message.reply("❌ Você não pode prender bots.");
    }

    const member = message.guild.members.cache.get(user.id);
    const staffPosition = staff.roles.highest.position;
    const userPosition = member.roles.highest.position;
    const username = user.globalName || user.username;

    if (userPosition >= staffPosition) {
      return message.reply(
        "❌ Você não pode prender alguém com cargo igual ou maior que o seu.",
      );
    }

    if (member.roles.cache.has(process.env.ROLE_PRISON)) {
      return message.reply("❌ Este usuário já está preso.");
    }

    const reason = args.slice(1).join(" ") || "Sem motivo";

    member.roles
      .add(process.env.ROLE_PRISON, `${staff.user.username} -> ${reason}`)
      .then(async () => {
        await ModLog.create({
          action: "PRISON",
          userId: user.id,
          staffId: staff.id,
          reason,
          guildId: message.guild.id,
        }).then(() => {
          const embedLog = new EmbedBuilder()
            .setTitle("📝 Registro de Moderação - Prison")
            .setDescription(
              `**🎠 Usuário:** <@${user.id}> | \`${user.id}\` (*${username}*) \n\n**🦺 Staff:** <@${staff.id}> | \`${staff.id}\` (*${staff.user.globalName}*) \n\n**💼 Motivo:** \`${reason}\``,
            )
            .setColor(color.prison)
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
        });

        const embed = new EmbedBuilder()
          .setAuthor({
            name: staff.user.globalName,
            iconURL: staff.user.displayAvatarURL(),
          })
          .setTitle("🔇 Prison")
          .setColor(color.prison)
          .setDescription(
            `-> O usuário <@${user.id}> (\`${user.id}\`) foi preso!\n**💼 Motivo:** \`${reason}\``,
          )
          .setFooter({
            text: `${user.globalName} está preso`,
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
      })
      .catch(() => null);
  },
};
