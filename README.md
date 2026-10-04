# 💌 going_on_date

A cute website to ask Gulasal out — and let her plan the whole date. Every plan she submits is sent straight to your Telegram.

## How it works
1. **Main page** — "Gulasal, will you go on a date with me?"
   - Each **No** click changes the button text and makes **Yes** bigger.
   - After 5 clicks the No button starts running away 🏃‍♂️
2. **Date planner** (after she clicks Yes):
   - 📅 Pick a day (calendar + quick buttons: Tomorrow / This Saturday / This Sunday) and a time
   - 🎯 Choose up to 3 activities (coffee, dinner, movie, park, bowling…)
   - 😋 Choose food (plov, shashlik, pizza, sushi…)
   - ✨ Dress vibe, pick-up or meet there, and a personal note
   - 💌 Review and **Send** → the plan arrives in your Telegram
3. She can tap **Plan another date** any time — every new plan is sent to you too.

## ⚙️ Setup: receive her plans in Telegram (5 minutes)
1. In Telegram, open **@BotFather** → send `/newbot` → choose any name → copy the **token** it gives you.
2. Open your new bot and press **Start** (send it any message, e.g. "hi").
3. In a browser, open: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   Find `"chat":{"id":123456789` — that number is your **chat id**.
4. Open `config.js` and fill in:
   ```js
   TELEGRAM_BOT_TOKEN: "7123456789:AAH...xyz",
   TELEGRAM_CHAT_ID: "123456789",
   MY_TELEGRAM_USERNAME: "your_username",   // without @
   ```
5. Upload the files to GitHub and turn on **GitHub Pages** (Settings → Pages → Branch: `main` → Save). Send her the link 💌

> **Note:** the bot token will be visible in the public code. The worst anyone could do with it is send messages through this bot, so create a bot just for this site and don't reuse it for anything important.

**If Telegram isn't set up (or sending fails)**, she'll see a "Send on Telegram" button and a "Copy the plan" button, so the plan still reaches you.

## Files
| File | What's inside |
|---|---|
| `index.html` | Main page with the question |
| `script.js` | Yes/No button logic and hearts |
| `styles.css` | Shared styles |
| `yes_page.html` | The date planner |
| `planner.js` | Planner steps, summary, sending to Telegram |
| `yes_style.css` | Planner styles |
| `config.js` | **Your settings** — her name and Telegram bot |

## How to customize
- Her name — `HER_NAME` in `config.js`
- Activities / food options — the buttons in `yes_page.html` (copy a `<button class="chip">` line and change it)
- No-button texts — `messages` in `script.js`
- Colors — variables at the top of `styles.css`
