/**
 * NextGen Launcher - Automated Telegram Promotion & Download Bot
 * -------------------------------------------------------------
 * This bot runs with ZERO external npm dependencies (uses native Node.js fetch).
 *
 * How to run:
 * 1. Get a free bot token from @BotFather on Telegram in 30 seconds.
 * 2. Put your token in the variable below or pass via environment: TELEGRAM_BOT_TOKEN="your_token" node promo-kit/telegram_bot.cjs
 * 3. Run: node promo-kit/telegram_bot.cjs
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
const ITCH_URL = 'https://m-amin-alobidan.itch.io/nextgen-launcher';

if (BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.log('\n======================================================');
  console.log('🤖 NextGen Launcher Telegram Bot');
  console.log('======================================================');
  console.log('⚠️ Please insert your Telegram Bot Token in BOT_TOKEN or run with:');
  console.log('   set TELEGRAM_BOT_TOKEN=your_token_from_botfather');
  console.log('   node promo-kit/telegram_bot.cjs\n');
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId, text, replyMarkup = null) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error('Error sending message:', err.message);
  }
}

let lastUpdateId = 0;

async function pollUpdates() {
  try {
    const res = await fetch(`${API_BASE}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        if (update.message && update.message.text) {
          handleIncomingMessage(update.message);
        }
      }
    }
  } catch (err) {
    // network timeout or temporary error
  }
  setTimeout(pollUpdates, 1500);
}

function handleIncomingMessage(msg) {
  const chatId = msg.chat.id;
  const userText = msg.text.trim();
  const userName = msg.from ? msg.from.first_name : 'Gamer';

  console.log(`📩 Received message from ${userName}: ${userText}`);

  const welcomeText = `
🎮 <b>مرحباً بك ${userName} في بوت NextGen Launcher الرسمي!</b>

حوّل جهاز الكمبيوتر الخاص بك إلى كونسول فخم (PS5 / Xbox) مجاناً بالكامل!

✨ <b>أهم المميزات:</b>
• واجهات كونسول احترافية (PS5, Xbox, Nexus)
• كشف تلقائي لألعاب Steam و Epic Games مع جلب الأغلفة بدقة عالية
• مساعد ذكاء اصطناعي مدمج لمساعدتك في الألعاب
• ترجمة فورية حية لنصوص وحوارات الألعاب
• متابعة حية لأقوى عروض وتخفيضات متجر Steam
• دعم كامل لأيادي التحكم (DualSense, Xbox Gamepad)

🚀 <b>التطبيق مجاني 100% لنظام Windows (128 MB فقط).</b>
`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📥 تحميل التطبيق مجاناً (itch.io)', url: ITCH_URL }
      ],
      [
        { text: '🌐 صفحة المطور (MNova)', url: 'https://m-amin-alobidan.itch.io' }
      ]
    ]
  };

  sendMessage(chatId, welcomeText, keyboard);
}

if (BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.log('🤖 NextGen Launcher Bot is active and listening for messages...');
  pollUpdates();
}
