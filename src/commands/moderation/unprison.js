const { EmbedBuilder } = require("discord.js");
const color = require("../../color.json");

module.exports = {
  name: "unprison",
  aliases: ["up"],
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

    if (user.id === message.author.id) {
      return message.reply("❌ Você não pode se auto soltar da prisão.");
    }

    if (user.bot) {
      return message.reply("❌ Você não pode soltar bots da prisão.");
    }

    const member = message.guild.members.cache.get(user.id);
    const staffPosition = staff.roles.highest.position;
    const userPosition = member.roles.highest.position;

    if (userPosition >= staffPosition) {
      return message.reply(
        "❌ Você não pode soltar alguém com cargo igual ou maior que o seu."
      );
    }

    if (!member.roles.cache.has(process.env.ROLE_PRISON)) {
      return message.reply("❌ Este usuário não está preso.");
    }

    const reason = args.slice(1).join(" ") || "Sem motivo";

    member.roles
      .remove(process.env.ROLE_PRISON, `${staff.user.username} -> ${reason}`)
      .then(() => {
        const embedLog = new EmbedBuilder()
          .setTitle("📝 Registro de Moderação - Unprison")
          .setDescription(
            `**Usuário:** <@${user.id}> (\`${user.id}\`)\n**Staff:** <@${staff.id}> (\`${staff.id}\`)\n**Motivo:** \`${reason}\``
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

        const embed = new EmbedBuilder()
          .setAuthor({
            name: staff.user.globalName || staff.user.username,
            iconURL: staff.user.displayAvatarURL(),
          })
          .setTitle("🔊 Unprison")
          .setColor(color.prison)
          .setDescription(
            `-> O usuário <@${user.id}> (\`${user.id}\`) foi solto da prisão!\n**💼 Motivo:** \`${reason}\``
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
      })
      .catch(() => null);
  },
};
