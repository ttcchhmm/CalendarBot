'use-strict';

// --- JSON files
const config = require("./config.json");

// --- Discord.JS
const Discord = require("discord.js");

// --- Commands init
const cmdInit = require("./commands/init");

const client = new Discord.Client({intents: ["GUILD_MESSAGES"]});

// When logged in, setup the commands and the command listener
client.on("ready", async () => {
    console.log(`Logged as ${client.user.tag}`);

    client.user.setAFK(true);

    cmdInit.registerCommands(client, config.token, config.clientId);
    cmdInit.setupExecution(client);

    client.user.setAFK(false);
});

client.login(config.token); // Connect the bot to the Discord API