'use-strict';

// --- Discord.JS
const {MessageEmbed} = require("discord.js");

// --- node-ical
const ical = require("node-ical");

// --- URLs for the ICS files
const icsUrls = require("../../ics.json");

function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function sendDay(ev, followUp, interaction) {
    const embed = new MessageEmbed()
        .setTitle(ev.summary)
        .addField("Start hour", `${ev.start.getHours()}:${ev.start.getMinutes()}`, true)
        .addField("End hour", `${ev.end.getHours()}:${ev.end.getMinutes()}`, true)
        .addField("Location", ev.location, true);

    if(followUp) {
        interaction.editReply({embeds: [embed]});
    } else {
        interaction.channel.send({embeds: [embed]});
    }
}

function buildAndSendForDay(day, calName, interaction) {
    const url = icsUrls[calName];

    if(url != undefined) {
        day.setHours(0, 0, 0, 0);
        const nextDay = addDays(day, 1);

        console.log(day);
        console.log(nextDay);

        ical.fromURL(url, {}, function(err, cal) {
            let found = false;

            for(let k in cal) {
                if(cal.hasOwnProperty(k)) {
                    const ev = cal[k];

                    if(day <= ev.start && ev.end < nextDay) {
                        found = true;

                        console.log(ev);

                        sendDay(ev, !found, interaction);
                    }
                }
            }

            if(!found) {
                const embed = new MessageEmbed()
                    .setTitle(day.toLocaleDateString())
                    .setColor("#0099ff")
                    .setTimestamp()
                    .setDescription("Nothing is scheduled for this day.");

                interaction.editReply({embeds: [embed]});
            }
        });
    } else {
        embed.setTitle("Unknown calendar.")
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