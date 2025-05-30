// 📦 Importation des modules nécessaires
import { Telegraf } from 'telegraf';
import { config } from 'dotenv';
import OpenAI from 'openai';

// 🔐 Chargement des variables d'environnement depuis .env
config();

// 📌 Initialisation du bot Telegram avec le token
const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧠 Initialisation du client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎉 Commande de démarrage du bot
bot.start((ctx) => {
  ctx.reply("👋 Salut ! Je suis un bot connecté à l'intelligence OpenAI. Pose-moi une question.");
});

// 📩 Répond à tout message texte
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;

  try {
    // Envoie la demande à l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // ou 'gpt-4' si disponible
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
    ctx.reply("⚠️ Une erreur est survenue en parlant à OpenAI.");
  }
});

// 🚀 Lance le bot (en mode long polling)
bot.launch().then(() => {
  console.log("✅ Le bot est en ligne !");
});

// 🛑 Gestion des interruptions (Render ou local)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
