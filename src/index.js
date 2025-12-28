require("dotenv").config();

const { Client, Events, GatewayIntentBits } = require("discord.js");
const loadCommands = require("./handler/commandHandler");
const loadEvents = require("./handler/eventHandler");
const connectDB = require("./database/mongodb");

const client = new Client({
  intents: Object.values(GatewayIntentBits),
});

process.on("uncaughtException", async (error, origin) => {
  console.log(`❗ ${error}\n\n[${origin}]`);
});

process.on("unhandledRejection", async (reason, promise) => {
  console.log(`❗ ${reason}\n\n[${promise}]`);
});

(async () => {
  client.db = await connectDB();
  client.color = parseInt(process.env.COLOR, 16);

  loadCommands(client);
  loadEvents(client);

  client.login(process.env.DISCORD_TOKEN);
})();
