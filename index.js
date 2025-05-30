// 📦 Importation des modules nécessaires
import express from 'express';
import { Telegraf } from 'telegraf';
import { config } from 'dotenv';
import OpenAI from 'openai';

// 🔐 Chargement des variables d'environnement
config();

// 📌 Initialisation du bot Telegram avec le token
const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧠 Initialisation du client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎉 Commande /start
bot.start((ctx) => {
  ctx.reply("👋 Salut ! Je suis un bot connecté à OpenAI. Pose-moi une question.");
});

// 📩 Répond à tout message texte
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
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
    console.error("❌ Erreur OpenAI :", error);
    ctx.reply("⚠️ Une erreur est survenue avec OpenAI.");
  }
});

// 🚀 Création du serveur Express
const app = express();
app.use(express.json());

// 📬 Définir le chemin du webhook
app.use(bot.webhookCallback('/telegram'));

// 📡 Définir le webhook Telegram (à faire à chaque démarrage)
bot.telegram.setWebhook(`https://usomi.onrender.com/telegram`);

// 🌐 Lancement du serveur HTTP (Render utilise PORT automatiquement)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
