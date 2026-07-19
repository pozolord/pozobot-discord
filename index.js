require("dotenv").config();

const { Client, GatewayIntentBits, Events } = require("discord.js");

const tokenNames = ["TOKEN", "DISCORD_TOKEN", "BOT_TOKEN", "DISCORDTOKEN"];
const token = tokenNames.find((name) => {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
});

console.log("🔧 Iniciando PozoBot...");
console.log(
  "🔑 Variables de token encontradas:",
  Object.keys(process.env).filter((key) => /TOKEN|DISCORD|BOT/i.test(key))
);
console.log(`🔑 TOKEN definido: ${Boolean(token)}`);

if (!token) {
  console.error("❌ TOKEN no definido en el entorno. Agrega TOKEN o DISCORD_TOKEN como variable de entorno.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  presence: {
    status: "online",
    activities: [{ name: "con PozoBot", type: 0 }],
  },
});

const commands = {
  ping: async (message) => {
    await message.reply("Pong! 🏓");
  },
  help: async (message) => {
    await message.reply("Comandos disponibles: `!ping`, `!help`");
  },
};

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ ${readyClient.user.tag} está conectado y listo.`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const [rawCommand, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = rawCommand.toLowerCase();

  if (commands[command]) {
    try {
      await commands[command](message, args);
    } catch (error) {
      console.error("Error al ejecutar comando:", error);
      await message.reply("Ocurrió un error al ejecutar el comando.");
    }
  }
});

client.on(Events.Error, (error) => {
  console.error("⚠️ Error del cliente:", error);
});

client.on(Events.ShardReconnecting, () => {
  console.warn("🔄 El bot está intentando reconectarse...");
});

client.on(Events.ShardDisconnect, (event, shardId) => {
  console.warn(`🔌 Desconectado (shard ${shardId}). Código: ${event.code}, razón: ${event.reason}`);
});

async function startBot(retries = 0) {
  try {
    await client.login(token);
  } catch (error) {
    console.error("❌ No se pudo conectar el bot:");
    console.error(error);

    if (error.message.includes("disallowed intents")) {
      console.error(
        "   - Habilita Message Content Intent en el portal de Discord si quieres usar comandos de texto."
      );
    }

    if (retries < 5) {
      const delaySeconds = 5 * (retries + 1);
      console.log(`⏳ Reintentando en ${delaySeconds} segundos... (${retries + 1}/5)`);
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
      return startBot(retries + 1);
    }

    process.exit(1);
  }
}

startBot();
