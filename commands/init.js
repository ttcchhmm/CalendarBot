'use-strict';

// --- Discord.js
const {SlashCommandBuilder} = require("@discordjs/builders");
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");

// --- Slash commands implementation
const cmdNextEvent = require("./impl/nextevent");
const cmdSeeDay = require("./impl/seeday");

// --- Commands definition
const nextEvent = new SlashCommandBuilder().setName("nextevent")
                                        .setDescription("Display the next event in a calendar")
                                        .addStringOption(option => option.setName("calendar").setDescription("Calendar to check").setRequired(true));

const seeDay = new SlashCommandBuilder().setName("seeday")
                                        .setDescription("Display the calendar")
                                        .addSubcommand(subcommand =>
                                            subcommand.setName("today")
                                            .setDescription("Check for today")
                                            .addStringOption(option => option.setName("calendar").setDescription("Calendar to check").setRequired(true)))
                                        .addSubcommand(subcommand =>
                                            subcommand.setName("in")
                                            .setDescription("Check the calendar for in X days")
                                            .addStringOption(option => option.setName("calendar").setDescription("Calendar to check").setRequired(true))
                                            .addIntegerOption(option => option.setName("days").setDescription("The number of days to add from today").setRequired(true)))
                                        .addSubcommand(subcommand =>
                                            subcommand.setName("at")
                                            .setDescription("Check to calendar at a specified date")
                                            .addStringOption(option => option.setName("calendar").setDescription("Calendar to check").setRequired(true))
                                            .addIntegerOption(option => option.setName("day").setDescription("The day of the month").setRequired(true))
                                            .addIntegerOption(option => option.setName("month").setDescription("The month of the year").setRequired(true))
                                            .addIntegerOption(option => option.setName("year").setDescription("The year").setRequired(true)));

const commands = [nextEvent, seeDay];

// Register commands to the Discord API
exports.registerCommands = async function(client, token, clientId) {
    const rest = new REST({version: "9"}).setToken(token);

    try {
        let response = [];
        const guilds = client.guilds.cache.map(guild => guild.id);
        for(let i = 0; i < guilds.length; i++) {
            console.log(`Registering commands for guild ${guilds[i]}`);
            response.push(rest.put(Routes.applicationGuildCommands(clientId, guilds[i]), {body: commands.map(command => command.toJSON())}));
        }

        await Promise.all(response);

        console.log("Commands ready");
    } catch (error) {
        console.error(error);
    }
}

// Setup Discord.js in order to execute the commands when needed
exports.setupExecution = function (client) {
    client.on("interactionCreate", async interaction => {
        if(interaction.isCommand()) {
            switch(interaction.commandName) {
                case "nextevent":
                    cmdNextEvent.exec(interaction);
                    break;
                case "seeday":
                    cmdSeeDay.exec(interaction);
                    break;
            }
        }
    });
}