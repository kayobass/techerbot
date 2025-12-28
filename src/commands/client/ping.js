const {
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  ContainerBuilder,
} = require("discord.js");

module.exports = {
  name: "ping",
  aliases: ["p"],
  permission: 2,

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

      if (client.db) {
        await client.db.command({ ping: 1 });
      }

      const end = process.hrtime.bigint();
      dbLatency = Number(end - start) / 1_000_000;
      dbLatency = dbLatency.toFixed(2);
    } catch {
      dbLatency = "Erro";
    }

    const title = new TextDisplayBuilder().setContent(
      "### Latências do sistema"
    );
    const separator = new SeparatorBuilder().setDivider(true);
    const text = new TextDisplayBuilder().setContent(
      `- Latência REST do Discord: \`${restLatency.toFixed(
        2
      )}\`ms\n- Latência do Discord Gateway (WS): \`${wsLatency}\`ms\n- Tempo de resposta da Base de Dados: \`${dbLatency}\`ms`
    );
    const container = new ContainerBuilder()
      .setAccentColor(client.color)
      .addTextDisplayComponents(title)
      .addSeparatorComponents(separator)
      .addTextDisplayComponents(text);

    sent.edit({
      components: [container],
    });
  },
};
