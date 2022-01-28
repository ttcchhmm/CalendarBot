'use-strict';

// --- Discord.js
const {MessageEmbed} = require("discord.js");

// --- Config file
const {dayStartHour, dayStartMinute, dayEndHour, dayEndMinute} = require("../../config.json");

// --- got module
const got = require("got");

// --- node-ical module
const ical = require("node-ical");

// --- ICS urls
const icsUrls = require("../../ics.json");

// --- Project modules
const sorting = require("../../utils/sorting");

function TimeInterval(start, end) {
    this.start = start;
    this.end = end;
}

exports.exec = async function (interaction) {
    await interaction.deferReply();

    const firstCal  = interaction.options.getString("first");
    const secondCal = interaction.options.getString("second");
    const thirdCal  = interaction.options.getString("third");
    const fourthCal = interaction.options.getString("fourth");

    const firstCalUrl = icsUrls[firstCal];
    const secondCalUrl = icsUrls[secondCal];
    
    if(firstCalUrl == undefined || secondCalUrl == undefined) {
        const embed = new MessageEmbed()
                        .setTitle("An error occured")
                        .setDescription("One of the specified calendar does not exist");
        interaction.editReply({embeds: [embed]});
    } else {
        let error = false;

        let promises = [];
        let icsText = [];

        promises.push(got(firstCalUrl).then((res) => {
            icsText.push(res.body);
        }));

        promises.push(got(secondCalUrl).then((res) => {
            icsText.push(res.body);
        }));

        if(thirdCal != undefined) {
            const thirdCalUrl = icsUrls[thirdCal];

            if(thirdCalUrl == undefined) {
                error = true;
            } else {
                promises.push(got(thirdCalUrl).then((res) => {
                    icsText.push(res.body);
                }));
            }
        }

        if(fourthCal != undefined) {
            const fourthCalUrl = icsUrls[fourthCal];

            if(fourthCalUrl == undefined) {
                error = true;
            } else {
                promises.push(got(fourthCalUrl).then((res) => {
                    icsText.push(res.body);
                }));
            }
        }

        await Promise.all(promises);

        const min = new Date("2021-10-04"); // TODO debug only
        min.setHours(dayStartHour, dayStartMinute, 0);

        const max = new Date("2021-10-04"); // TODO debug only
        max.setHours(dayEndHour, dayEndMinute, 0);

        let events = [];

        for(let i = 0; i < icsText.length; i++) {
            const cal = ical.sync.parseICS(icsText[i]);

            for(let k in cal) {
                if(cal.hasOwnProperty(k)) {
                    const ev = cal[k];

                    if(ev.start >= min && ev.end <= max) {
                        events.push(ev);
                    }
                }
            }
        }

        const embed = new MessageEmbed()
                        .setTitle(min.toLocaleDateString())
                        .setColor("#0099ff");

        if(events.length == 0) {
            embed.setDescription("Everytime is fine.");
        } else {
            events.sort(sorting.eventSort);

            if(events.length > 1) {
                let busy = [];
                let currentStart;

                for(let i = 1; i < events.length; i++) {
                    const prev = events[i-1];
                    const current = events[i];

                    if(currentStart == undefined) {
                        if(prev.start < current.start) {
                            currentStart = prev.start;
                        } else {
                            currentStart = current.start
                        }
                    } else if(prev.end < current.start) {
                        busy.push(new TimeInterval(currentStart, prev.end));
                        currentStart = undefined;
                    }
                }

                console.log(busy);
            }
        }

        interaction.editReply({embeds: [embed]});
    }
}