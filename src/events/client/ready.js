const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log(`✅ ${client.user.tag} está online!`);

    const statuses = [
      { type: 0, text: "🎮 Booleanos" },
      { type: 2, text: "🎧 Meu prefixo 't.'" },
      {
        type: 3,
        text: "👀 Estou de olho nos membros do servidor Booleanos",
      },
      { type: 0, text: "💻 Desenvolvido por Kayobass" },
      { type: 3, text: "🌟 O Booleanos crescendo!" },
      { type: 0, text: "🛡️ Para manter o servidor seguro" },
      { type: 2, text: "👂 Eu não vou dominar o mundo" },
      {
        type: 3,
        text: "🎉 Os usuários se divertirem na Booleanos",
      },
    ];

    setInterval(
      () => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        client.user.setActivity(status.text, { type: status.type });
      },
      3 * 60 * 1000,
    );
  },
};
