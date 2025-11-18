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

const Database = require("./database");

let self;

module.exports = self = {
    /**
     * Inits the tables of a new database.
     * @param {Database} database
     * @param {Yuno} Yuno Yuno's instance.
     * @param {boolean} newDb Representing if the DB was just created.
     * @async
     */
    "initDB": async function(database, Yuno, newDb) {
        let version = await database.allPromise("PRAGMA user_version;"),
            dbVer = version[0]["user_version"];

        if (dbVer < Yuno.intVersion && !newDb) {
            Yuno.prompt.info("The database isn't at the good version for the bot. (Bot's version: " + Yuno.intVersion + "; dbvers: " + dbVer + "). Expect errors, and report them.")
        }

        await database.runPromise("PRAGMA user_version = " + Yuno.intVersion);

        await database.runPromise(`CREATE TABLE IF NOT EXISTS experiences (
            level INTEGER,
            userID STRING,
            guildID STRING,
            exp INTEGER
        )`)
        /*
            id = the guild id
            prefix = the prefix triggering commands
            measureXP = whether XP is enabled
            levelRoleMap = JSON mapping levels to role IDs
        */
        await database.runPromise(`CREATE TABLE IF NOT EXISTS guilds (
            id TEXT,
            prefix VARCHAR(5),
            measureXP BOOL,
            levelRoleMap TEXT
        )`)
    },

    /**
     * Inits a guild in the database. (if it's not recorded in the db.)
     * @param {Database} database
     * @param {String} guildid
     * @async
     */
    "initGuild": async function(database, guildid) {
        let exists = await database.allPromise(`SELECT * FROM guilds WHERE id='${guildid}'`);
        if (exists.length === 0)
            await database.runPromise(`INSERT INTO guilds(id) VALUES(${guildid})`);
    },

    /**
     * Returns the prefixes of all guilds in an object
     * @param {Database} database
     * @async
     * @return {Object}
     */
    "getPrefixes": async function(database) {
        let guilds = await database.allPromise("SELECT id, prefix FROM guilds"),
            finalObj = {};

        guilds.forEach(el => finalObj[el.id] = el.prefix);

        return finalObj;
    },

    /**
     * Sets the prefix for a guild (from its guild id)
     * @param {Database} database
     * @param {String} guildid
     * @param {String} prefix
     * @async
     */
    "setPrefix": async function(database, guildid, prefix) {
        await self.initGuild(database, guildid);
        await database.runPromise("UPDATE guilds SET prefix='" + prefix + "' WHERE id='" + guildid + "'");
    },

    /**
     * Returns an array, with all guilds with exp counting is enabled.
     * @param {Database} database
     * @async
     * @return {Object}
     */
    "getGuildsWhereExpIsEnabled": async function(database) {
        let sql = await database.allPromise("SELECT id, measureXP FROM guilds"),
            arr = [];

        sql.forEach(el => {
            if (el.measureXP === "true" || el.measureXP === true)
                arr.push(el.id);
        })

        return arr;
    },

    /**
     * Enable/Disable xp for a guild (from its guildid)
     * @param {Database} database
     * @param {String} guildid
     * @param {String} xpen
     * @async
     */
    "setXPEnabled": async function(database, guildid, xpen) {
        await self.initGuild(database, guildid);
        await database.runPromise("UPDATE guilds SET measureXP='" + xpen + "' WHERE id='" + guildid + "'");
    },

    /**
     * Returns the level role map of a guild from its guildid
     * @param {Database} database
     * @param {String} guildid
     * @async
     * @return {Object}
     */
    "getLevelRoleMap": async function(database, guildid) {
        let sql = await database.allPromise("SELECT levelRoleMap FROM guilds WHERE id = ?;", [guildid]);

        if (sql[0]["levelRoleMap"] === null)
            return null;

        return JSON.parse(sql[0]["levelRoleMap"]);
    },

    /**
     * Sets the level role map for a guild (from its guildid)
     * @param {Database} database
     * @param {String} guildid
     * @param {String|Object} rolemap
     * @async
     */
    "setLevelRoleMap": async function(database, guildid, rolemap) {
        if (typeof rolemap === "object")
            rolemap = JSON.stringify(rolemap);

        await self.initGuild(database, guildid);
        await database.runPromise("UPDATE guilds SET levelRoleMap='" + rolemap + "' WHERE id='" + guildid + "'");
    },

    /**
     * Returns XP data of a user by its id and guilds's id.
     * Creates the entry if inexistant.
     * @param {Database} database
     * @param {String} guildid
     * @param {String} userid
     * @async
     * @return {Object}
     */
    "getXPData": async function(database, guildid, userid) {
        let sql = await database.allPromise("SELECT level, exp FROM experiences WHERE userID = ? AND guildID = ?", [userid, guildid]);

        if (!sql || sql.length === 0) {
            await database.runPromise("INSERT INTO experiences (level, userID, guildID, exp) VALUES(?,?,?,?)",
                [0, userid, guildid, 0])
            return {
                "xp": 0,
                "level": 0
            }
        }

        let ret = sql[0];

        return {
            "xp": parseInt(ret.exp),
            "level": parseInt(ret.level)
        }
    },

    /**
     * Sets XP data.
     * @param {Database} database
     * @param {String} guildid
     * @param {String} userid
     * @param {number} xp
     * @param {number} level
     * @async
     */
    "setXPData": async function(database, guildid, userid, xp, level) {
        return await database.runPromise("UPDATE experiences SET level = ?, exp = ? WHERE guildid = ? AND userid = ?",
            [level, xp, guildid, userid])
    }
}
