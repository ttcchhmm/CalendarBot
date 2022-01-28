'use-strict';

// --- Discord.JS
const {MessageEmbed} = require("discord.js");

// --- node-ical
const ical = require("node-ical");

// --- Project modules
const dl = require("../../utils/download");
const prettynb = require("../../utils/pretty-numbers");
const sorting = require("../../utils/sorting");

// --- URLs for the ICS files
const icsUrls = require("../../ics.json");

// Add a number of days to a date
function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Build a message for a day and send it
function buildAndSendForDay(day, calName, interaction) {
    const url = icsUrls[calName];

    if(url != undefined) { // If the calendar exists
        day.setHours(0, 0, 0, 0);
        const nextDay = addDays(day, 1); // The next day

        dl.download(url, (data) => {
            const cal = ical.sync.parseICS(data);

            let events = [];

            for(let k in cal) {
                if(cal.hasOwnProperty(k)) {
                    const ev = cal[k];
    
                    if(day <= ev.start && ev.end < nextDay) {
                        events.push(ev);
                    }
                }
            }

            const embed = new MessageEmbed()
                .setTitle(day.toLocaleDateString())
                .setColor("#0099ff")
                .setTimestamp();
    
            if(events.length != 0) {
                // Sort the events from the nearest to the furtherest
                events.sort(sorting.eventSort);

                for(let i = 0; i < events.length; i++) {
                    const ev = events[i];

                    // Add a field with : name (within Discord API limits) / start time / end time / location
                    embed.addField(ev.summary.substr(0, 255), `__Start :__ ${ev.start.getHours()}:${prettynb.pretty(ev.start.getMinutes())}\n__End :__ ${ev.end.getHours()}:${prettynb.pretty(ev.end.getMinutes())}\n__Location :__ ${ev.location}`);
                }
            } else {
                embed.setDescription("Nothing is scheduled for this day.");
            }

            interaction.editReply({embeds: [embed]});
        }, (err) => {
            console.error(err);

            const embed = new MessageEmbed()
                .setTitle("An error occured")
                .setColor("#0099ff")
                .setDescription("Failed to download the ICS file. Maybe the calendar server is offline ?");

            interaction.editReply({embeds: [embed]});
        });
    } else {
        const embed = new MessageEmbed()
            .setTitle("Unknown calendar.")
            .setColor("#0099ff")
            .setDescription("Check your command and try again.");

        interaction.editReply({embeds: [embed]});
    }
}

// Function to run when the command is executed
exports.exec = async function(interaction) {
    await interaction.deferReply();

    const calName = interaction.options.getString("calendar");

    switch(interaction.options.getSubcommand()) {
        case "today":
            buildAndSendForDay(new Date(), calName, interaction);
            break;

        case "in":
            const days = interaction.options.getInteger("days");

            const date = addDays(new Date(), days);

            buildAndSendForDay(date, calName, interaction);
            break;

        case "at":
            const day = interaction.options.getInteger("day");
            const month = interaction.options.getInteger("month")-1; // Minus 1 because JavaScript months start at 0
            const year = interaction.options.getInteger("year");

            buildAndSendForDay(new Date(year, month, day), calName, interaction);
            break;
    }
}