const {
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  ContainerBuilder,
} = require("discord.js");
const mongoose = require("mongoose");
const color = require("../../color.json");
const { description } = require("./help");

module.exports = {
  name: "ping",
  aliases: ["p"],
  permission: 0,
  description: "Verifica a latência do bot e da base de dados",

  async execute(client, message) {
    const latencyText = new TextDisplayBuilder().setContent(
      "🏓 Pong! Calculando latências..."
    );

    const sent = await message.reply({
      components: [latencyText],
      flags: [MessageFlags.IsComponentsV2],
    });

    const restLatency = sent.createdTimestamp - message.createdTimestamp;
    const wsLatency = Math.round(client.ws.ping);

    let dbLatency = "N/A";

    try {
      const start = process.hrtime.bigint();

      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.command({ ping: 1 });
      } else {
        throw new Error("MongoDB não conectado");
      }

      const end = process.hrtime.bigint();
      dbLatency = Number(end - start) / 1_000_000;
      dbLatency = dbLatency.toFixed(2);
    } catch {
      dbLatency = "Erro";
    }

    const title = new TextDisplayBuilder().setContent(
      "### Latências do Sistema"
    );

    const separator = new SeparatorBuilder().setDivider(true);

    const text = new TextDisplayBuilder().setContent(
      `- Latência REST do Discord: \`${restLatency.toFixed(2)}\`ms
- Latência do Discord Gateway (WS): \`${wsLatency}\`ms
- Tempo de resposta da Base de Dados: \`${dbLatency}\`ms`
    );

    const container = new ContainerBuilder()
      .setAccentColor(parseInt(color.default, 16))
      .addTextDisplayComponents(title)
      .addSeparatorComponents(separator)
      .addTextDisplayComponents(text);

    sent.edit({
      components: [container],
    });
  },
};
