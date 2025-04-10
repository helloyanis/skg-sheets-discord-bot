# How to set up this bot locally

1. Clone this repository. If you don't know how, I recommend you get GitHub desktop and click on the green "Code" button on the top of this page, then "Open with GitHub Desktop".
2. Install the latest [node.js](https://nodejs.org) version on your computer.
3. Not mandatory but recommended : Install a code editor like [Visual Studio code](https://code.visualstudio.com/download)
4. Open the cloned repository. If you don't know how, in GitHub desktop, click on "Open with Visual Studio Code"
5. Near the side of the window are all files of the bot. Create a new file called .env
6. Go to the [Discord Developers page](https://discord.com/developers/applications) and create a new application. Then, in the `Bot` tab, click "Reset token" and copy the string it gives you.
7. In your .env file, paste your token as follows :

```env
DISCORD_TOKEN=THE_TOKEN_YOU_JUST_COPIED
```
## ⚠️ NEVER EVER share your token! It will allow other people to run their own code through the bot!!

8. In Visual Studio Code, press `ctrl`+`j`, then click on the `Terminal` tab
9. In the terminal, run the following command to install the dependencies :

```ps1
npm i
```
10. Add your bot to a server with the bot scope and create commands permissions
11. Change the `config.json` file as follows :
```json
{
	"clientId": "Your application ID, get it from the Discord developers page",
	"guildId": "The server ID of the one your bot is in"
}
```

You are now ready to run the bot!

# How to start the bot :

Run `node .` in the Visual Studio Code terminal

# How to deploy commands :

When you edit a command, you need to deploy it to tell Discord you just modified the command.
Run `node .\deploy-commands.js` in the Visual Studio Code terminal, and it will deploy all of your commands to the server you specified in the `config.json` file (and ONLY in that server.)

# How to integrate Google Sheets

🔧 Step-by-step Setup

### 1. Create a Google Cloud Project

- Go to Google Cloud Console

- Create a new project

### 2. Enable Sheets API

- In your project, go to "APIs & Services > Library"

- Search and enable Google Sheets API

### 3. Create a Service Account

- Go to "IAM & Admin > Service Accounts"

- Create one and give it a name

- After it's created, go to "Keys" and generate a JSON key

- Save that .json file—it’s your credential. **Make sure to not push it or share it publicly, or it will allow anyone to edit your spreadsheet!**

### 4. Share your Sheet with the Service Account

- Open the target Google Sheet

- Click Share

- Use the email from the service account JSON file (something like my-bot@my-project.iam.gserviceaccount.com)

- Give it Editor access

### 5. Edit the Google Sheets client to your preferences

- In this repo, open `utilities/googleSheetsClient.js`

- Change `'YOUR_SERVICE_ACCOUNT_FILE.json'`, `'YOUR_SPREADSHEET_ID'` and `Sheet1!A:D` to the specified properties.

- Change lines 154 and 157 by commenting/decommenting them.

- Don't forget to deploy the commands!