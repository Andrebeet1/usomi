import { Telegraf, Markup } from 'telegraf';
import { config } from 'dotenv';
import OpenAI from 'openai';
import express from 'express';
import fetch from 'node-fetch';

config(); // Charge .env

const bot = new Telegraf(process.env.BOT_TOKEN);

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// === Express pour Render ===
const app = express();
const port = process.env.PORT || 10000;

// Lier le webhook Telegram à Express
app.use(bot.webhookCallback('/webhook'));

// Définir le webhook Telegram
bot.telegram.setWebhook(`https://usomi.onrender.com/webhook`).then(() => {
  console.log("✅ Webhook configuré !");
});

// Route racine
app.get("/", (req, res) => {
  res.send("✅ Serveur en ligne.");
});

// Lancer serveur Express
app.listen(port, () => {
  console.log(`✅ Serveur Express actif sur le port ${port}`);
});

// === Commande /start avec bouton ===
bot.start((ctx) => {
  ctx.reply(
    "👋 Bienvenue ! Clique sur le bouton pour démarrer le bot 🚀",
    Markup.inlineKeyboard([
      [Markup.button.callback("🚀 Démarrer le bot", "ping_backend")]
    ])
  );
});

// === Action sur le bouton ===
bot.action("ping_backend", async (ctx) => {
  await ctx.editMessageText("⏳ Lancement du bot...");
  try {
    // Pinger le backend pour le réveiller
    await fetch("https://usomi.onrender.com/");

    // Simuler une barre de progression
    const steps = ["▁▁▁▁▁", "▃▁▁▁▁", "▃▃▁▁▁", "▃▃▃▁▁", "▃▃▃▃▁", "▃▃▃▃▃"];
    for (let i = 0; i < steps.length; i++) {
      await ctx.reply(`🔄 Progression : ${steps[i]}`);
      await new Promise(res => setTimeout(res, 400));
    }

    await ctx.reply("✅ Bot prêt ! Pose ta question.");
  } catch (err) {
    console.error("❌ Erreur de ping :", err.message);
    await ctx.reply("⚠️ Erreur lors du réveil du bot.");
  }
});

// === Réponse aux messages textes ===
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
    console.error("❌ Erreur OpenRouter :", error);
    ctx.reply("⚠️ Erreur avec OpenRouter : " + (error.response?.data?.error?.message || error.message));
  }
});
