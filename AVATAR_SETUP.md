# Bot Avatar Setup

To set the bot's avatar image, place the file `00000-3035359988.png` in the root directory of the bot (same level as `index.js`).

## Location
```
Yuno-bot-js14/
├── 00000-3035359988.png  <- Place the image here
├── index.js
├── package.json
├── README.md
└── src/
```

## Automatic Setup

When the bot starts, it will automatically:
1. Set the bot's username to **LevelBot**
2. Set the bot's avatar to the image from `00000-3035359988.png` (if the file exists)

## Discord Rate Limits

Please note that Discord has the following rate limits:
- **Username changes**: 2 per hour
- **Avatar changes**: 2 per hour

If you see a rate limit error, wait at least 30 minutes before restarting the bot.

## Manual Setup (Alternative)

If you prefer to set the avatar manually:
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application
3. Go to the "Bot" section
4. Click on the bot's profile picture to upload `00000-3035359988.png`
5. Click "Save Changes"
