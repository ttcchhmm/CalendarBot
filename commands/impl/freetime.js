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

        let busy = Array.from(Array(dayEndHour - dayStartHour), () => new Array(60));

        for(let h = 0; h < busy.length; h++) {
            for(let m = 0; busy[h].length; m++) {
                busy[h][m] = false;
            }
        }

        for(let i = 0; i < icsText.length; i++) {
            const cal = ical.sync.parseICS(icsText[i]);

            for(let k in cal) {
                if(cal.hasOwnProperty(k)) {
                    const ev = cal[k];

                    for(let hour = ev.start.getHours() - 1; hour < ev.end.getHours(); hour++) {
                        if(hour == ev.end.getHours() - 1) {
                            for(let minutes = 0; minutes < ev.end.getMinutes(); minutes++) {
                                busy[hour][minutes] = true;
                            }
                        } else if (hour == ev.start.getHours() && hour != ev.end.getHours() - 1) {
                            for(let minutes = ev.start.getMinutes(); minutes < 60; minutes++) {
                                busy[hour][minutes] = true;
                            }
                        } else if (hour == ev.start.getHours() && hour == ev.end.getHours() - 1) {
                            for(let minutes = ev.start.getMinutes(); minutes < ev.end.getMinutes(); minutes++) {
                                busy[hour][minutes] = true;
                            }
                        } else {
                            for(let minutes = 0; minutes < 60; minutes++) {
                                busy[hour][minutes] = true;
                            }
                        }
                    }
                }
            }
        }

        // TODO fix hour indexes (ex: with dayStartHour = 8, 8h00 = [0][0])
    }
}