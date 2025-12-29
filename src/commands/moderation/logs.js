const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ModLog = require("../../database/model/modLog");
const createPaste = require("../../utils/createPaste");
const color = require("../../color.json");

module.exports = {
  name: "logs",
  aliases: ["lg"],
  permission: 4,
  description: "Exibe os logs de moderação de um staff",

  async execute(client, message, args) {
    const staffUser =
      message.mentions.users.first() ||
      (await message.client.users.fetch(args[0]).catch(() => null)) ||
      message.author;

    const logs = await ModLog.find({
      staffId: staffUser.id,
      guildId: message.guild.id,
    }).sort({ createdAt: -1 });

    if (!logs.length) {
      return message.reply("❌ Este staff não possui registros.");
    }

    const content = logs
      .map((log, index) => {
        return (
          `#${index + 1}\n` +
          `Ação: ${log.action}\n` +
          `Usuário: ${log.userId}\n` +
          `Motivo: ${log.reason}\n` +
          `Data: ${new Date(log.createdAt).toLocaleString("pt-BR")}\n` +
          `---------------------------`
        );
      })
      .join("\n");

    const url = await createPaste({
      title: `Logs do staff ${staffUser.username}`,
      description: `Registros de moderação — ${message.guild.name}`,
      content,
      username: staffUser.username,
    });

    if (!url) {
      return message.reply("❌ Não foi possível gerar o log externo.");
    }

    const embed = new EmbedBuilder()
      .setTitle("📑 Logs de Moderação - Staff")
      .setDescription(
        `**⚔ Staff:** <@${staffUser.id}> (\`${staffUser.id}\`)\n` +
          `**📊 Total de ações:** \`${logs.length}\`\n\n` +
          `Clique no botão abaixo para visualizar o relatório completo.`
      )
      .setColor(color.default)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("🔗 Abrir Logs")
        .setStyle(ButtonStyle.Link)
        .setURL(url)
    );

    message.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
