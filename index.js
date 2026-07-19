require("dotenv").config();

const { Client, GatewayIntentBits, Events } = require("discord.js");

const token = process.env.TOKEN;

if (!token) {
  console.error("❌ TOKEN no definido en .env. Agrega TOKEN=tu_token_aqui");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: {
    status: "online",
    activities: [{ name: "con PozoBot", type: 0 }],
  },
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ ${readyClient.user.tag} está conectado y listo.`);
});

// Si quieres usar comandos de texto como !ping, habilita el intent de Message Content
// en el Discord Developer Portal y agrega GatewayIntentBits.MessageContent aquí.

client.login(token).catch((error) => {
  console.error("❌ No se pudo conectar el bot:");
  console.error(error);
  if (error.message.includes("disallowed intents")) {
    console.error(
      "   - Deshabilita los intents privilegiados o habilítalos en el portal de Discord si los necesitas."
    );
  }
});