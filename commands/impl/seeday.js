'use-strict';

// --- Discord.JS
const {MessageEmbed} = require("discord.js");

// --- node-ical
const ical = require("node-ical");

// --- Project modules
const dl = require("../../utils/download");
const prettynb = require("../../utils/pretty-numbers");

// --- URLs for the ICS files
const icsUrls = require("../../ics.json");

function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function buildAndSendForDay(day, calName, interaction) {
    const url = icsUrls[calName];

    if(url != undefined) {
        day.setHours(0, 0, 0, 0);
        const nextDay = addDays(day, 1);

        console.log(day);
        console.log(nextDay);

        dl.download(url, (data) => {
            const cal = ical.sync.parseICS(data);

            let events = [];

            for(let k in cal) {
                if(cal.hasOwnProperty(k)) {
                    const ev = cal[k];
    
                    if(day <= ev.start && ev.end < nextDay) {
                        console.log(ev);
    
                        events.push(ev);
                    }
                }
            }

            const embed = new MessageEmbed()
                .setTitle(day.toLocaleDateString())
                .setColor("#0099ff")
                .setTimestamp();
    
            if(events.length != 0) {
                events.sort((first, second) => {
                    if(first.start < second.start) {
                        return -1;
                    } else if (first.start > second.start) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                for(let i = 0; i < events.length; i++) {
                    const ev = events[i];

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