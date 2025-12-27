const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ping",
  aliases: ["p"],
  permission: 0,

  async execute(client, message) {
    const sent = await message.reply("🏓 Calculando latências...");

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

    sent.edit(
      `📡 **Latências do sistema:**\n\n` +
        `🌐 **Latência REST do Discord:** ${restLatency.toFixed(2)}ms\n` +
        `🔌 **Latência do Discord Gateway (WS):** ${wsLatency}ms\n` +
        `🗄️ **Tempo de resposta da Base de Dados:** ${dbLatency}ms`
    );
  },
};
