const axios = require("axios");

module.exports = async function createPaste({
  title,
  description,
  content,
  username,
  expires,
}) {
  if (!content || content.length < 1) {
    console.error("Content inválido para o paste");
    return null;
  }

  try {
    const response = await axios.post(
      "https://sourceb.in/api/bins",
      {
        title: title || "Logs",
        description: description || "Logs de moderação",
        files: [
          {
            name: `log_${username}.txt`,
            content,
            languageId: 1,
          },
        ],
        //expires: expires || "24h"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "DiscordBot (axios)",
        },
      }
    );

    if (response.data?.key) {
      return `https://sourceb.in/${response.data.key}`;
    }

    console.error("Não retornou key:", response.data);
    return null;
  } catch (err) {
    console.error("Erro ao criar paste:", err.response?.data || err.message);
    return null;
  }
};
