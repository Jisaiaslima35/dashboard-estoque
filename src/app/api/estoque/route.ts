import { google } from 'googleapis';

export async function GET() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: '1LOWtzmQSuluue7_778MHEg3Ac6iajbLZdH0KAPI4mHk',
    ranges: ['Página1!A1:H100', 'movimentacoes!A1:E100'],
  });

  return Response.json({
    produtos: response.data.valueRanges?.[0]?.values || [],
    movimentacoes: response.data.valueRanges?.[1]?.values || [],
  });
}
