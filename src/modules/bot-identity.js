/*
    Level Bot - A Discord.JS bot focused on XP and leveling features.
    Based on Yuno Gasai by Maeeen <maeeennn@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see https://www.gnu.org/licenses/.
*/

module.exports.modulename = "bot-identity";

const fs = require('fs');
const path = require('path');

const BOT_NAME = "LevelBot";
const AVATAR_PATH = path.join(__dirname, '../../00000-3035359988.png');

let DISCORD_EVENTED = false;

let discordConnected = async function(Yuno) {
    if (!DISCORD_EVENTED) {
        try {
            const currentUsername = Yuno.dC.user.username;

            // Set bot username if different
            if (currentUsername !== BOT_NAME) {
                await Yuno.dC.user.setUsername(BOT_NAME);
                console.log(`Bot username changed to: ${BOT_NAME}`);
            } else {
                console.log(`Bot username already set to: ${BOT_NAME}`);
            }

            // Set bot avatar if image file exists
            if (fs.existsSync(AVATAR_PATH)) {
                const avatar = fs.readFileSync(AVATAR_PATH);
                await Yuno.dC.user.setAvatar(avatar);
                console.log(`Bot avatar updated from: ${AVATAR_PATH}`);
            } else {
                console.log(`Avatar image not found at: ${AVATAR_PATH}`);
                console.log('To set the bot avatar, place 00000-3035359988.png in the root directory of the bot.');
            }

        } catch(error) {
            // Rate limit error - Discord only allows 2 username changes per hour and 2 avatar changes per hour
            if (error.code === 50035 || error.message.includes('rate limit')) {
                console.warn('Could not update bot identity due to Discord rate limits. Try again later.');
            } else {
                console.error('Error updating bot identity:', error.message);
            }
        }
    }

    DISCORD_EVENTED = true;
};

module.exports.init = function(Yuno, hotReloaded) {
    if (hotReloaded)
        discordConnected(Yuno);
    else
        Yuno.on("discord-connected", discordConnected)
}
