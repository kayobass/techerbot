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
  name: "ban",
  aliases: ["b"],
  permission: 4,

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
      return message.reply("❌ Você não pode se auto banir.");
    }

    if (
      user.bot &&
      !message.member.permissions.has(PermissionFlagsBits.ManageGuild)
    ) {
      return message.reply("❌ Você não pode banir bots.");
    }

    const member = message.guild.members.cache.get(user.id);

    if (member) {
      const staffPosition = staff.roles.highest.position;
      const userPosition = member.roles.highest.position;

      if (userPosition >= staffPosition) {
        return message.reply(
          "❌ Você não pode banir alguém com cargo igual ou maior que o seu."
        );
      }
    }

    const reason = args.slice(1).join(" ") || "Sem motivo";
    const expiresAt = Math.floor((Date.now() + 32_000) / 1000);

    const confirmEmbed = new EmbedBuilder()
      .setTitle("⚠️ Confirmar Ban")
      .setDescription(
        `Tem certeza que deseja banir <@${user.id}> (\`${user.id}\`)?\n` +
          `**Motivo:** \`${reason}\`\n\n` +
          `⏳ Restam <t:${expiresAt}:R> para tomar uma decisão.`
      )
      .setThumbnail(user.displayAvatarURL())
      .setColor(color.ban)
      .setFooter({
        text: staff.user.globalName,
        iconURL: staff.user.displayAvatarURL(),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ban_confirm")
        .setLabel("Confirmar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("ban_cancel")
        .setLabel("Cancelar")
        .setStyle(ButtonStyle.Danger)
    );

    const sent = await message.reply({
      embeds: [confirmEmbed],
      components: [row],
    });

    const collector = sent.createMessageComponentCollector({
      filter: (i) => i.user.id === staff.id,
      time: 30_000,
      max: 1,
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();

      if (interaction.customId === "ban_confirm") {
        await message.guild.members
          .ban(user.id, { reason: `${staff.user.username} -> ${reason}` })
          .catch(() => null);

        await ModLog.create({
          action: "BAN",
          userId: user.id,
          staffId: staff.id,
          reason,
          guildId: message.guild.id,
        }).then(() => {
          const embedLog = new EmbedBuilder()
            .setTitle("📝 Registro de Moderação - Ban")
            .setDescription(
              `**🦺 Usuário:** <@${user.id}> (\`${user.id}\`)\n**⚔ Staff:** <@${staff.id}> (\`${staff.id}\`)\n**💼 Motivo:** \`${reason}\``
            )
            .setColor(color.ban)
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
          .setTitle("🔨 Ban")
          .setAuthor({
            name: staff.user.globalName,
            iconURL: staff.user.displayAvatarURL(),
          })
          .setColor(color.ban)
          .setDescription(
            `O usuário <@${user.id}> (\`${user.id}\`) foi banido!\n**💼 Motivo:** \`${reason}\``
          )
          .setFooter({
            text: `${user.globalName} está banido`,
            iconURL: user.displayAvatarURL(),
          })
          .setTimestamp();

        await sent.edit({ embeds: [successEmbed], components: [] });
      }

      if (interaction.customId === "ban_cancel") {
        const cancelEmbed = new EmbedBuilder()
          .setTitle("❎ Ban cancelado")
          .setColor(color.ban)
          .setDescription("A ação de ban foi cancelada.")
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
