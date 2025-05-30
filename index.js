import { Telegraf, Markup } from 'telegraf';
import { config } from 'dotenv';
import OpenAI from 'openai';
import express from 'express';
import fetch from 'node-fetch'; // pour ping Render

config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// ✅ Commande /start avec bouton
bot.start((ctx) => {
  ctx.reply(
    "👋 Salut ! Clique sur le bouton ci-dessous pour démarrer le bot :",
    Markup.inlineKeyboard([
      Markup.button.callback("🚀 Démarrer UsomiBot", "wake_up_bot")
    ])
  );
});

// 📦 Gère le bouton
bot.action("wake_up_bot", async (ctx) => {
  await ctx.answerCbQuery(); // pour retirer le "chargement" de Telegram
  await ctx.reply("⏳ Activation du bot en cours...");

  // ➤ Barre de progression simulée
  const progressBars = [
    "🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛ 10%",
    "🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛ 20%",
    "🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛ 30%",
    "🟩🟩🟩🟩⬛⬛⬛⬛⬛⬛ 40%",
    "🟩🟩🟩🟩🟩⬛⬛⬛⬛⬛ 50%",
    "🟩🟩🟩🟩🟩🟩⬛⬛⬛⬛ 60%",
    "🟩🟩🟩🟩🟩🟩🟩⬛⬛⬛ 70%",
    "🟩🟩🟩🟩🟩🟩🟩🟩⬛⬛ 80%",
    "🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛ 90%",
    "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩 100%",
  ];

  for (let bar of progressBars) {
    await ctx.reply(bar);
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s
  }

  // ➤ Ping le serveur pour le réveiller
  try {
    const response = await fetch('https://usomi.onrender.com');
    if (response.ok) {
      await ctx.reply("✅ UsomiBot est prêt !");
    } else {
      await ctx.reply("⚠️ Erreur en réveillant le bot.");
    }
  } catch (err) {
    await ctx.reply("❌ Serveur injoignable : " + err.message);
  }
});

// 🧠 Répond aux messages texte
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
    ctx.reply("⚠️ Une erreur est survenue avec OpenRouter. " + (error.response?.data?.error?.message || error.message));
  }
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

// 🔚 Arrêt propre
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
