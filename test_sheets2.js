const {google} = require('googleapis');
const fs = require('fs');

async function test() {
  const credentials = {
    client_email: 'dashboard-estoque@focus-vertex-454703-t1.iam.gserviceaccount.com',
    private_key: fs.readFileSync('/tmp/vercel_key.txt', 'utf8'),
  };
  
  console.log('Client email:', credentials.client_email);
  console.log('Key first 50:', credentials.private_key.substring(0, 50));
  console.log('Key has real newline:', credentials.private_key.includes('\n'));
  
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
    console.log('PRODUTOS count:', (response.data.valueRanges[0].values || []).length);
    console.log('MOVS count:', (response.data.valueRanges[1].values || []).length);
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}

test();
