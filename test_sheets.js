const {google} = require('googleapis');
const fs = require('fs');

async function test() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: fs.readFileSync('/tmp/vercel_key.txt', 'utf8'),
  };
  
  console.log('Client email:', credentials.client_email);
  console.log('Key length:', credentials.private_key.length);
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const sheets = google.sheets({version: 'v4', auth});
  
  try {
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: '1LOWtzmQSuluue7_778MHEg3Ac6iajbLZdH0KAPI4mHk',
      ranges: ['Página1!A1:H10', 'movimentacoes!A1:E10'],
    });
    console.log('PRODUTOS:', JSON.stringify(response.data.valueRanges[0].values));
    console.log('MOVS:', JSON.stringify(response.data.valueRanges[1].values));
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}

test();
