const RSSParser = require("rss-parser");
const { Client, GatewayIntentBits } = require("discord.js");

const parser = new RSSParser();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const RSS_FEEDS = [
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml",
  "https://www.wired.com/feed/category/gear/latest/rss",
  "https://feeds.arstechnica.com/arstechnica/technology-lab",
  "https://www.engadget.com/rss.xml",
  "https://www.cnet.com/rss/news/",
  "https://www.zdnet.com/news/rss.xml",
];
const CHANNEL_ID = "1387441710895730718"; // Thay bằng channel id thật

let lastItems = {};
let queue = [];
let sentToday = 0;

// Hàm quét RSS → đưa bài mới vào queue
async function fetchFeeds() {
  console.log("🔎 Fetching feeds...");
  for (let feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      if (feed.items && feed.items.length) {
        const latest = feed.items[0];
        if (lastItems[feedUrl] !== latest.link) {
          lastItems[feedUrl] = latest.link;
          queue.push({
            title: latest.title,
            link: latest.link,
          });
          console.log(`🆕 New article queued: ${latest.title}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error parsing ${feedUrl}:`, err);
    }
  }
}

// Hàm gửi tin từ queue với khoảng cách delay
async function processQueue() {
  if (queue.length === 0) {
    console.log("⏸ Queue empty, waiting...");
    return;
  }
  if (sentToday >= 10) {
    console.log("🚦 Daily limit reached, skipping until tomorrow.");
    return;
  }

  const item = queue.shift();
  const channel = await client.channels.fetch(CHANNEL_ID);
  await channel.send(`**${item.title}**\n🔗 ${item.link}`);
  sentToday++;
  console.log(`✅ Sent: ${item.title}`);
}

// Reset số lượng tin đã gửi mỗi ngày
function scheduleDailyReset() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setUTCHours(0, 0, 0, 0);
  nextMidnight.setUTCDate(now.getUTCDate() + 1);
  const msUntilReset = nextMidnight - now;
  setTimeout(() => {
    sentToday = 0;
    console.log("🔄 Daily counter reset.");
    scheduleDailyReset();
  }, msUntilReset);
}

const min = 5, max = 10;

async function scheduleNextSend() {
  await processQueue();
  const randomDelay =
    (Math.floor(Math.random() * (max - min + 1)) + min) * 60 * 1000;
  console.log(`⏳ Next article will be sent in ${randomDelay/60000} minutes`);
  setTimeout(scheduleNextSend, randomDelay);
}

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  fetchFeeds(); // quét ngay khi khởi động
  scheduleDailyReset();
  setInterval(fetchFeeds, 30 * 60 * 1000); // quét RSS mỗi 30 phút
  scheduleNextSend(); // bắt đầu gửi tin dãn cách
  
});
client.login(process.env.BOT_TOKEN);

const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(3000, () => {
  console.log('🌐 Express server started');
   console.log(`Repl is running at https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});