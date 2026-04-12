const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ms = require("ms");
const ModLog = require("../../database/model/modLog");
const color = require("../../color.json");

module.exports = {
  name: "timeout",
  aliases: ["t"],
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
      return message.reply("❌ Você não pode se auto castigar.");
    }

    if (user.bot) {
      return message.reply("❌ Você não pode castigar bots.");
    }

    const member = message.guild.members.cache.get(user.id);

    if (member) {
      const staffPosition = staff.roles.highest.position;
      const userPosition = member.roles.highest.position;

      if (userPosition >= staffPosition) {
        return message.reply(
          "❌ Você não pode castigar alguém com cargo igual ou maior que o seu.",
        );
      }
    }

    const reason = args.slice(1).join(" ") || "Sem motivo";
    const expiresAt = Math.floor((Date.now() + 32_000) / 1000);

    const confirmEmbed = new EmbedBuilder()
      .setTitle("⚠️ Confirmar Timeout")
      .setDescription(
        `Escolha o tempo para o timeout de <@${user.id}> (\`${user.id}\`).\n` +
          `**Motivo:** \`${reason}\`\n\n` +
          `⏳ Restam <t:${expiresAt}:R> para tomar uma decisão.`,
      )
      .setThumbnail(user.displayAvatarURL())
      .setColor(color.timeout)
      .setFooter({
        text: staff.user.globalName,
        iconURL: staff.user.displayAvatarURL(),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("1d")
        .setLabel("1 Dia")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("3d")
        .setLabel("3 Dias")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("5d")
        .setLabel("5 Dias")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("7d")
        .setLabel("7 Dias")
        .setStyle(ButtonStyle.Primary),
    );

    const sent = await message.reply({
      embeds: [confirmEmbed],
      components: [row],
    });

    const timeoutMap = {
      "1d": "1d",
      "3d": "3d",
      "5d": "5d",
      "7d": "7d",
    };

    const collector = sent.createMessageComponentCollector({
      filter: (i) => i.user.id === staff.id,
      time: 30_000,
      max: 1,
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();

      const duration = timeoutMap[interaction.customId];
      if (!duration) return;

      const isTimedOut =
        member.communicationDisabledUntilTimestamp &&
        member.communicationDisabledUntilTimestamp > Date.now();

      if (!isTimedOut) {
        await applyTimeout({
          member,
          user,
          staff,
          reason,
          duration,
          guild: message.guild,
        });

        const successEmbed = new EmbedBuilder()
          .setTitle("🔇 Timeout aplicado")
          .setColor(color.timeout)
          .setDescription(
            `O usuário <@${user.id}> (\`${user.id}\`) recebeu timeout de **${duration}**.\n` +
              `**💼 Motivo:** \`${reason}\``,
          )
          .setTimestamp();

        await sent.edit({ embeds: [successEmbed], components: [] });
        return;
      }

      const overwriteExpiresAt = Math.floor((Date.now() + 30_000) / 1000);

      const overwriteEmbed = new EmbedBuilder()
        .setTitle("⚠️ Usuário já está em Timeout")
        .setDescription(
          `O usuário <@${user.id}> (\`${user.id}\`) já possui um timeout ativo.\n\n` +
            `Deseja realmente **alterar o tempo do timeout**?\n\n` +
            `⏳ Esta ação expira <t:${overwriteExpiresAt}:R>.`,
        )
        .setColor(color.timeout)
        .setFooter({
          text: staff.user.globalName,
          iconURL: staff.user.displayAvatarURL(),
        });

      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("timeout_overwrite_confirm")
          .setLabel("CONFIRMAR")
          .setStyle(ButtonStyle.Success),
      );

      await sent.edit({
        embeds: [overwriteEmbed],
        components: [confirmRow],
      });

      const overwriteCollector = sent.createMessageComponentCollector({
        filter: (i) => i.user.id === staff.id,
        time: 30_000,
        max: 1,
      });

      overwriteCollector.on("collect", async (i) => {
        await i.deferUpdate();

        await applyTimeout({
          member,
          user,
          staff,
          reason,
          duration,
          guild: message.guild,
        });

        const successEmbed = new EmbedBuilder()
          .setTitle("🔁 Timeout atualizado")
          .setColor(color.timeout)
          .setDescription(
            `O timeout do usuário <@${user.id}> (\`${user.id}\`) foi atualizado para **${duration}**.\n` +
              `**💼 Motivo:** \`${reason}\``,
          )
          .setTimestamp();

        await sent.edit({ embeds: [successEmbed], components: [] });
      });
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        sent.edit({ components: [] }).catch(() => null);
      }
    });
  },
};

async function applyTimeout({ member, user, staff, reason, duration, guild }) {
  await member
    .timeout(ms(duration), `${staff.user.username} -> ${reason}`)
    .catch(() => null);

  await ModLog.create({
    action: "TIMEOUT",
    userId: user.id,
    staffId: staff.id,
    reason: `${reason} (${duration})`,
    guildId: guild.id,
  });

  const embedLog = new EmbedBuilder()
    .setTitle("📝 Registro de Moderação - Timeout")
    .setDescription(
      `**🎠 Usuário:** <@${user.id}> | \`${user.id}\` (*${user.globalName || user.username}*)\n\n` +
        `**⚔ Staff:** <@${staff.id}> | \`${staff.id}\` (*${staff.user.globalName}*)\n\n` +
        `**⏱ Tempo:** \`${duration}\`\n\n` +
        `**💼 Motivo:** \`${reason}\``,
    )
    .setColor(color.timeout)
    .setThumbnail(user.displayAvatarURL())
    .setFooter({
      text: staff.user.globalName,
      iconURL: staff.user.displayAvatarURL(),
    })
    .setTimestamp();

  guild.channels
    .fetch(process.env.LOG_CHANNEL)
    .then((channel) => {
      channel.send({ embeds: [embedLog] }).catch(() => null);
    })
    .catch(() => null);
}
