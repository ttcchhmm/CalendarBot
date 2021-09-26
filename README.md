# CalendarBot
This is a Discord bot capable of displaying ICS files in a Discord text channel.

## Dev setup
Make sure Node.js and NPM are installed. For exemple on Arch Linux :
```bash
sudo pacman -S nodejs npm
```

Clone this repository and then run the following command to setup the dependencies :
```bash
npm install
```

Then, create a `config.json` file and replace `BOT_TOKEN` with your bot token and `CLIENT_ID` with your client id :
```json
{
    "token": "BOT_TOKEN",
    "clientId": "CLIENT_ID"
}
```

After, create a `ics.json` file and do something like this :
```json
{
    "calendar1": "url",
    "calendar2": "url"
}
```

And finally run the bot :
```bash
node ./index.js
```