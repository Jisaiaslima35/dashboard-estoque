const {google} = require('googleapis');
const fs = require('fs');

async function check() {
  const credentials = {
    client_email: 'dashboard-estoque@focus-vertex-454703-t1.iam.gserviceaccount.com',
    private_key: fs.readFileSync('/tmp/vercel_key.txt', 'utf8'),
  };
  const auth = new google.auth.GoogleAuth({credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']});
  const sheets = google.sheets({version: 'v4', auth});
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1LOWtzmQSuluue7_778MHEg3Ac6iajbLZdH0KAPI4mHk',
      range: 'Página1!A1:H8',
    });
    const rows = response.data.values || [];
    console.log('Total rows:', rows.length);
    rows.forEach((row, i) => {
      console.log(`Row ${i}:`, JSON.stringify(row));
    });
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}
check();
