const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'YOUR_SERVICE_ACCOUNT_FILE.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function appendGameData({ name, publisher, lifespan, links }) {
    const spreadsheetId = 'YOUR_SPREADSHEET_ID'; // From your sheet's URL
    const range = 'Sheet1!A:D'; // Change to your actual sheet/range

    const values = [[name, publisher, lifespan, links]];

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values
        }
    });
}

module.exports = { appendGameData };
