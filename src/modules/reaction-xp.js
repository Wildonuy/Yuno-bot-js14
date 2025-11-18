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

module.exports.modulename = "reaction-xp";

let DISCORD_EVENTED = false;
const REACTION_XP = 25; // 5 messages worth of XP (5 XP per message * 5 = 25)

let discordConnected = async function(Yuno) {
    if (!DISCORD_EVENTED)
        Yuno.dC.on("messageReactionAdd", async function(reaction, user) {
            try {
                // Fetch partial reactions and messages
                if (reaction.partial) {
                    try {
                        await reaction.fetch();
                    } catch (error) {
                        console.error('Failed to fetch reaction:', error);
                        return;
                    }
                }

                if (reaction.message.partial) {
                    try {
                        await reaction.message.fetch();
                    } catch (error) {
                        console.error('Failed to fetch message:', error);
                        return;
                    }
                }

                const message = reaction.message;
                const messageAuthor = message.author;

                // Don't award XP if the message author is a bot
                if (messageAuthor.bot) return;

                // Don't award XP if user reacts to their own message
                if (user.id === messageAuthor.id) return;

                // Check if XP is enabled for this guild
                const guildsWhereExpIsEnabled = await Yuno.dbCommands.getGuildsWhereExpIsEnabled(Yuno.database);
                if (!guildsWhereExpIsEnabled.includes(message.guild.id)) return;

                // Get current XP data for the message author
                let xpData = await Yuno.dbCommands.getXPData(Yuno.database, message.guild.id, messageAuthor.id);
                const neededXP = 5 * Math.pow(xpData.level, 2) + 50 * xpData.level + 100;

                // Award XP equal to 5 messages
                xpData.xp += REACTION_XP;

                // Check for level up
                let leveledUp = false;
                while (xpData.xp >= neededXP) {
                    xpData.level += 1;
                    xpData.xp -= neededXP;
                    leveledUp = true;
                }

                // Save XP data
                await Yuno.dbCommands.setXPData(Yuno.database, message.guild.id, messageAuthor.id, xpData.xp, xpData.level);

                // If user leveled up, assign role if configured
                if (leveledUp) {
                    const rolemap = await Yuno.dbCommands.getLevelRoleMap(Yuno.database, message.guild.id);

                    if (rolemap && rolemap[xpData.level]) {
                        try {
                            const member = await message.guild.members.fetch(messageAuthor.id);
                            const role = message.guild.roles.cache.get(rolemap[xpData.level]);
                            if (role && member) {
                                await member.roles.add(role);
                                console.log(`Assigned level ${xpData.level} role to ${messageAuthor.tag} from reaction XP`);
                            }
                        } catch(e) {
                            console.error(`Failed to assign role for level ${xpData.level}:`, e.message);
                        }
                    }
                }

                console.log(`Awarded ${REACTION_XP} XP to ${messageAuthor.tag} for reaction (now ${xpData.xp} XP, level ${xpData.level})`);

            } catch(e) {
                // Log error but don't throw - we don't want to crash on reaction errors
                console.error("Failed to award reaction XP:", e.message);
            }
        })

    DISCORD_EVENTED = true;
};

module.exports.init = function(Yuno, hotReloaded) {
    if (hotReloaded)
        discordConnected(Yuno);
    else
        Yuno.on("discord-connected", discordConnected)
}
