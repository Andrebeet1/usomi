import { Telegraf, Markup } from 'telegraf';
import { config } from 'dotenv';
import OpenAI from 'openai';
import express from 'express';
import fetch from 'node-fetch';

config();

// Initialise le bot Telegram
const bot = new Telegraf(process.env.BOT_TOKEN);

// Initialise OpenAI via OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// ✅ Commande /start avec bouton
bot.start((ctx) => {
  ctx.reply(
    "👋 Salut ! Je suis UsomiBot, ton assistant connecté à OpenRouter.\n\nClique sur le bouton ci-dessous pour me démarrer 🚀",
    Markup.inlineKeyboard([
      [Markup.button.callback("🚀 Démarrer le bot", "ping_backend")]
    ])
  );
});

// ✅ Quand l'utilisateur clique sur "Démarrer le bot"
bot.action("ping_backend", async (ctx) => {
  await ctx.editMessageText("⏳ Lancement en cours...");
  try {
    await fetch("https://usomi.onrender.com/");

    // Affiche une progression simulée
    const steps = ["▁▁▁▁▁", "▃▁▁▁▁", "▃▃▁▁▁", "▃▃▃▁▁", "▃▃▃▃▁", "▃▃▃▃▃"];
    for (let i = 0; i < steps.length; i++) {
      await ctx.reply(`🔄 Progression : ${steps[i]}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await ctx.reply("✅ Bot prêt ! Envoie-moi une question.");
  } catch (err) {
    console.error("Erreur de réveil du backend :", err.message);
    await ctx.reply("⚠️ Impossible de contacter le serveur. Réessaie plus tard.");
  }
});

// 📩 Répond aux messages utilisateurs
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
    ctx.reply("⚠️ Erreur avec OpenRouter : " + (error.response?.data?.error?.message || error.message));
  }
});

// ✅ Express pour que Render maintienne le serveur actif
const app = express();
const port = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ Serveur en ligne.");
});

app.listen(port, () => {
  console.log(`✅ Serveur lancé sur le port ${port}`);
});

// 🔚 Pour bien arrêter le bot
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// ✅ Lance le bot
bot.launch().then(() => {
  console.log("🤖 mwalimu andruze est prêt !");
});
