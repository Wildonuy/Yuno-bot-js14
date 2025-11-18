# Level Bot

A Discord bot focused on XP and leveling features. Users gain XP from sending messages and unlock roles as they level up!

## Features

### Core Leveling System
- **Automatic XP Gain**: Users earn XP by sending messages in your server
- **Level Progression**: XP formula: `5 * level² + 50 * level + 100`
- **Role Rewards**: Assign roles automatically when users reach specific levels
- **Persistent Data**: SQLite database stores all XP and level data

### Commands

#### User Commands
- **`.xp [@user|userID]`** - Display XP card showing current level, XP, and progress to next level
  - Aliases: `.rank`, `.level`, `.exp`
  - Examples: `.xp`, `.xp @User`, `.xp 123456789`

#### Admin Commands (Require Administrator Permission)

**Configuration:**
- **`.set-experiencecounter <enable|disable>`** - Enable or disable XP counting for your server
  - Example: `.set-experiencecounter enable`

- **`.set-levelrolemap <level> <@role|roleID>`** - Map a role to a specific level
  - Users will receive this role when they reach that level
  - Example: `.set-levelrolemap 5 @Level5`

**XP Management:**
- **`.set-level <@user|userID> <level>`** - Manually set a user's level
  - XP is reset to 0 at the new level
  - Example: `.set-level @User 10`

- **`.mass-setxp <level> <@role|roleID>`** - Bulk set level for all users with a specific role
  - Sets all users with the role to the specified level (XP reset to 0)
  - Example: `.mass-setxp 5 @NewMembers`

- **`.sync-levelroles <level>`** - Assign all appropriate level roles to users at a specific level
  - Assigns all roles for that level and below based on your level role map
  - Useful for fixing roles after configuration changes
  - Example: `.sync-levelroles 10`

### Automatic Features
- **Auto Role Restore**: When users rejoin your server, they automatically get their level roles back based on their saved XP data

## Setup

### Prerequisites
- Node.js >= 18.0.0
- A Discord bot token

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd level-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a configuration file `config.json`:
```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "prefix": "."
}
```

4. Run the bot:
```bash
npm start
```

For development with hot-reload:
```bash
npm run dev
```

## Configuration

### Required Bot Permissions
- **Read Messages/View Channels**: To see messages and commands
- **Send Messages**: To respond to commands
- **Embed Links**: To display XP cards
- **Manage Roles**: To assign level roles

### Required Bot Intents
The bot requires the following Discord Gateway Intents:
- `GUILDS`
- `GUILD_MESSAGES`
- `GUILD_MEMBERS`
- `MESSAGE_CONTENT`

### Setting Up Level Roles

1. Enable XP tracking for your server:
   ```
   .set-experiencecounter enable
   ```

2. Create roles for different levels (e.g., "Level 5", "Level 10", etc.)

3. Map roles to levels:
   ```
   .set-levelrolemap 5 @Level5
   .set-levelrolemap 10 @Level10
   .set-levelrolemap 25 @Level25
   ```

4. Users will now automatically receive roles as they level up!

## How XP Works

### XP Formula
To level up, users need: `5 * level² + 50 * level + 100` XP

Example progression:
- Level 0 → 1: 100 XP
- Level 1 → 2: 155 XP
- Level 2 → 3: 220 XP
- Level 5 → 6: 475 XP
- Level 10 → 11: 1,100 XP

### Gaining XP
- Users gain XP by sending messages in channels where the bot can see them
- XP is awarded per message (with cooldown to prevent spam)
- Only applies in servers where XP counting is enabled

### Level Roles
- When a user reaches a level, they receive ALL roles for that level and below
- Example: A level 10 user gets roles for levels 5 and 10 if both are configured
- Roles persist even if the user leaves and rejoins the server

## Database

The bot uses SQLite for data storage with two main tables:

### `experiences`
- `userID`: Discord user ID
- `guildID`: Discord server ID
- `level`: Current level
- `exp`: Current XP

### `guilds`
- `id`: Discord server ID
- `prefix`: Command prefix (default: `.`)
- `measureXP`: Whether XP tracking is enabled
- `levelRoleMap`: JSON mapping of levels to role IDs

## Architecture

```
src/
├── commands/          # Command handlers
│   ├── xp.js         # Display XP card
│   ├── set-level.js  # Set user level
│   ├── set-experiencecounter.js  # Enable/disable XP
│   ├── set-levelrolemap.js       # Map roles to levels
│   ├── mass-setxp.js             # Bulk set XP
│   └── sync-levelroles.js        # Sync roles for a level
├── modules/
│   ├── auto-role-restore.js  # Restore roles on rejoin
│   ├── command-executor.js   # Command routing
│   └── message-processors.js # Message handling
├── message-processors/
│   └── experience.js         # XP gain logic
├── lib/
│   └── commandManager.js     # Command management
├── database.js        # SQLite wrapper
└── DatabaseCommands.js  # Database operations
```

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Based on Yuno Gasai by Maeeen <maeeennn@gmail.com>

## Support

For issues or questions, please open an issue on the GitHub repository.
