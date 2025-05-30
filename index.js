import { Telegraf, Markup } from 'telegraf';
import { config } from 'dotenv';
import OpenAI from 'openai';
import express from 'express';
import fetch from 'node-fetch'; // ➕ Installe-le si ce n’est pas déjà fait : npm install node-fetch

config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// ✅ Commande /start avec bouton de démarrage
bot.start((ctx) => {
  ctx.reply("👋 Bienvenue sur UsomiBot !\nClique sur le bouton ci-dessous pour le réveiller :", Markup.inlineKeyboard([
    Markup.button.callback("🚀 Démarrer UsomiBot", "wake_up")
  ]));
});

// ✅ Quand l'utilisateur clique sur le bouton
bot.action("wake_up", async (ctx) => {
  await ctx.answerCbQuery(); // Retire le "chargement" sur le bouton
  await ctx.reply("⏳ Réveil du serveur…");

  // Réveil du backend Render
  try {
    await fetch('https://usomi.onrender.com/');
  } catch (err) {
    return ctx.reply("⚠️ Serveur Render injoignable.");
  }

  // Barre de progression simulée
  const progress = [
    "▁▁▁▁▁ Initialisation...",
    "▂▁▁▁▁ Chargement...",
    "▂▃▁▁▁ Chargement...",
    "▂▃▅▁▁ Préparation...",
    "▂▃▅▆▁ Presque prêt...",
    "▂▃▅▆▇ Finalisation...",
    "✅ UsomiBot est prêt à répondre !"
  ];

  for (const step of progress) {
    await ctx.reply(step);
    await new Promise(resolve => setTimeout(resolve, 500)); // délai de 0.5s
  }
});

// ✅ Réponse à tout message texte
bot.on("text", async (ctx) => {
  const userMessage = ctx.message.text;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un assistant intelligent et amical." },
        { role: "user", content: userMessage }
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

// ✅ Express.js pour Render
const app = express();
const port = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ Serveur UsomiBot en ligne !");
});

app.listen(port, () => {
  console.log(`✅ Serveur lancé sur le port ${port}`);
});

// 🔚 Gestion des signaux système
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
