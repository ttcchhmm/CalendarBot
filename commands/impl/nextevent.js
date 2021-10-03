'use-strict';

// --- Discord.JS
const {MessageEmbed} = require("discord.js");

// --- node-ical
const ical = require("node-ical");

// --- Project modules
const prettynb = require("../../utils/pretty-numbers");

// --- URLs for the ICS files
const icsUrls = require("../../ics.json");

// Function to run when the command is executed
exports.exec = async function(interaction) {
    await interaction.deferReply();

    const embed = new MessageEmbed().setColor("#0099ff").setTimestamp();

    const calName = interaction.options.getString("calendar");

    ical.fromURL(icsUrls[calName], {}, function(err, cal) {
        let closestEvent;
        let now = new Date();

        // Search for the closest event
        for(let k in cal) {
            if(cal.hasOwnProperty(k)) {
                const ev = cal[k];
                if(closestEvent == undefined && ev.start >= now) {
                    closestEvent = ev;
                } else if(ev.start >= now && ev.start < closestEvent.start) {
                    closestEvent = ev;
                }
            }
        }

        try {
            embed.setTitle(closestEvent.summary)
                .addField("Day", closestEvent.start.toLocaleDateString(), true)
                .addField("Start hour", `${closestEvent.start.getHours()}:${prettynb.pretty(closestEvent.start.getMinutes())}`, true)
                .addField("End hour", `${closestEvent.end.getHours()}:${prettynb.pretty(closestEvent.end.getMinutes())}`, true)
                .addField("Location", closestEvent.location, true);
        } catch (err) {
            console.error(err);

            embed.setTitle("Oops")
                .setDescription("Something went wrong");
        }

        interaction.editReply({embeds: [embed]});
    });
}