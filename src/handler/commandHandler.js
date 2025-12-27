const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.commands = new Map();
  client.aliases = new Map();

  const commandsPath = path.join(__dirname, "..", "commands");
  const folders = fs.readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);

      if (!command.name) continue;

      client.commands.set(command.name.toLowerCase(), command);

      if (command.aliases && Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          client.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
        }
      }
    }
  }

  console.log(`📦 ${client.commands.size} comandos carregados`);
};
