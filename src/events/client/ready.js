const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log(`✅ ${client.user.tag} está online!`);

    const statuses = [
      { type: 0, text: "🎮 No Sky Tech" },
      { type: 2, text: "🎧 Ao prefixo 't.'" },
      {
        type: 3,
        text: "👀 Os membros do servidor Sky Tech",
      },
      { type: 0, text: "💻 Desenvolvido por Kayobass" },
      { type: 2, text: "🛠️ Comandos do Sky Tech Bot" },
      { type: 3, text: "🌟 O Sky Tech crescer!" },
      { type: 0, text: "🛡️ Para manter o servidor seguro" },
      { type: 2, text: "👂 Sua moderação com atenção" },
      {
        type: 3,
        text: "🎉 Os usuários se divertirem no Sky Tech",
      },
    ];

    setInterval(() => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      client.user.setActivity(status.text, { type: status.type });
    }, 3 * 60 * 1000);
  },
};
