const {
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ModLog = require("../../database/model/modLog");
const color = require("../../color.json");

module.exports = {
  name: "kick",
  aliases: ["k"],
  permission: 3,
  description: "Expulsa um usuário do servidor",

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
      return message.reply("❌ Você não pode se auto expulsar.");
    }

    if (
      user.bot &&
      !message.member.permissions.has(PermissionFlagsBits.ManageGuild)
    ) {
      return message.reply("❌ Você não pode expulsar bots.");
    }

    const member = message.guild.members.cache.get(user.id);
    const staffPosition = staff.roles.highest.position;
    const userPosition = member.roles.highest.position;

    if (userPosition >= staffPosition) {
      return message.reply(
        "❌ Você não pode expulsar alguém com cargo igual ou maior que o seu.",
      );
    }

    const reason = args.slice(1).join(" ") || "Sem motivo";

    const expiresAt = Math.floor((Date.now() + 32_000) / 1000);

    const confirmEmbed = new EmbedBuilder()
      .setTitle("⚠️ Confirmar Kick")
      .setDescription(
        `Tem certeza que deseja expulsar <@${user.id}> (\`${user.id}\`)?\n` +
          `**💼 Motivo:** \`${reason}\`\n\n` +
          `⏳ Restam <t:${expiresAt}:R> para tomar uma decisão.`,
      )
      .setThumbnail(user.displayAvatarURL())
      .setColor(color.kick)
      .setFooter({
        text: staff.user.globalName,
        iconURL: staff.user.displayAvatarURL(),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("kick_confirm")
        .setLabel("Confirmar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("kick_cancel")
        .setLabel("Cancelar")
        .setStyle(ButtonStyle.Danger),
    );

    const sent = await message.reply({
      embeds: [confirmEmbed],
      components: [row],
    });

    const username = user.globalName || user.username;

    const collector = sent.createMessageComponentCollector({
      filter: (i) => i.user.id === staff.id,
      time: 30_000,
      max: 1,
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();

      if (interaction.customId === "kick_confirm") {
        await member
          .kick(`${staff.user.username} -> ${reason}`)
          .catch(() => null);

        await ModLog.create({
          action: "KICK",
          userId: user.id,
          staffId: staff.id,
          reason,
          guildId: message.guild.id,
        }).then(() => {
          const embedLog = new EmbedBuilder()
            .setTitle("📝 Registro de Moderação - Kick")
            .setDescription(
              `**🎠 Usuário:** <@${user.id}> | \`${user.id}\` (*${username}*) \n\n**🦺 Staff:** <@${staff.id}> | \`${staff.id}\` (*${staff.user.globalName}*) \n\n**💼 Motivo:** \`${reason}\``,
            )
            .setColor(color.kick)
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

        const successEmbed = new EmbedBuilder()
          .setTitle("❌ Kick")
          .setAuthor({
            name: staff.user.globalName,
            iconURL: staff.user.displayAvatarURL(),
          })
          .setColor(color.kick)
          .setDescription(
            `O usuário <@${user.id}> (\`${user.id}\`) foi expulso!\n**💼 Motivo:** \`${reason}\``,
          )
          .setFooter({
            text: `${username} está expulso`,
            iconURL: user.displayAvatarURL(),
          })
          .setTimestamp();

        await sent.edit({ embeds: [successEmbed], components: [] });
      }

      if (interaction.customId === "kick_cancel") {
        const cancelEmbed = new EmbedBuilder()
          .setTitle("❎ Kick cancelado")
          .setColor(color.kick)
          .setDescription("A ação de kick foi cancelada.")
          .setTimestamp();

        await sent.edit({ embeds: [cancelEmbed], components: [] });
      }

      setTimeout(() => {
        sent.delete().catch(() => null);
        message.delete().catch(() => null);
      }, 60_000);
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        sent.edit({ components: [] }).catch(() => null);
      }
    });
  },
};
