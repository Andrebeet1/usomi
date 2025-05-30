import { Telegraf } from 'telegraf';
import { config } from 'dotenv';
import OpenAI from 'openai';
import express from 'express';

config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,         // clé OpenRouter ici
  baseURL: 'https://openrouter.ai/api/v1',        // URL OpenRouter
});

// ✅ Commande /start
bot.start((ctx) => {
  ctx.reply("👋 Salut ! Je suis un bot connecté à OpenRouter. Pose-moi une question.");
});

// 📩 Répond aux messages
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',    // modèle compatible OpenRouter (exemple)
      messages: [
        { role: 'system', content: "Tu es un assistant intelligent et amical." },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1000,
      temperature: 0.8,
    });

    const reply = completion.choices[0].message.content;
    ctx.reply(reply);
  } catch (error) {
    console.error("❌ Erreur OpenRouter :", error.response?.data || error.message);
    ctx.reply("⚠️ Une erreur est survenue avec OpenRouter. " + (error.response?.data?.error?.message || error.message));
  }
});

// ✅ Lance le bot
bot.launch().then(() => {
  console.log("✅ Le bot Telegram est lancé !");
});

// ✅ Express pour Render
const app = express();
const port = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ Serveur en ligne.");
});

app.listen(port, () => {
  console.log(`✅ Serveur lancé sur le port ${port}`);
});

// 🔚 Interruption
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
