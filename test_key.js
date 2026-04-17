const crypto = require('crypto');
const { google } = require('googleapis');

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCryO9qcdR+9MbD
lCDHpLsKMAgUk4Q35JohHn3ogWANbHBMEs41/n/3lEJbjig2Rq0Ty3LX8V0BKQF3
9wxtOwg8jbzqR66fgZ52g6yf1kcc5m3+UI86OpAV8x4HykPBiNkoReHY49A+VVfw
7QvrTqXP5y9oTF/haNyYwvc5Ju+Ki5vMIjy2rLBLQ8aTehRTtnIDC95eFmdUduDi
57Hu9g6dYWc9uX4AiFjT9wobl6KrwRYyIHHzSqvOJvtmF7MkPeYNkYme3oFKVzNS
s3lMI5IVujzksdMpZpuuQKbxTOtQX//PydVavawrY/6RcwBuKKI4dTUQA04y0vPc
6Um630KRAgMBAAECggEAIs6I7Dl6Q+sW5wP5jFotZ8gJqxmkvap9LF7ARj8Ilk+1
hUR+MeSKS0DoHSL1tOGnKg6cC3MlVBnZ6VPOWcePSK2zbIjvsfQShpLxhEVnjUyH
VvM9wh+hmED1gcCS8ADpd0aJl2e5hxfFxNRTCO+bmz+NlIV9G/AiWnWOoC7qdFi2
Fm4DQipWFwb9INEAGpTbnI1qcY61V+h1L4Jxp3PCNqEXxkqfHEC1W6X30JuVZk4L
dzfpGwG9y3KvZlOTyeaRmDP+x0+rMo3Y+KfIe6ja9bgHiUDQOqhhk9Cavfd40OeG
KSTMBFyQy/OtPVRiLmuZHStXpxJLhRpi+zqU07A2kQKBgQDh17NgDKO+Q8WGoPpV
hfFpSRFLT8tCR6A8uDe75LAMOeBOiXQBtElQZs7DsXXMI8PPvRehRttsrQNv6GG6
2Q2SKaXr53EuzNDwRQpxs5nOkXBaPUa+qOsoooNhcPThQG5MCcdFSs0aTK7Wrri0
pNlXuxCfB8di+wuubL1ESKMq/QKBgQDCuU3ERfyt6T5bjtOM/v0SuWFx5bChBMip
mptFpK/RBzFQZH02TMA+zej+b8Xq7hltJOfN0mqQ1A3NNiFFqyt6ruSZWojIzG5E
7tatut3iKJmY6HUYe8Q4r5WV4cYMBX0VwObqCEFwuFp8K+C6RowpkQdqjRB5CuZT
zuBt0K38JQKBgQDClIa+nYVCu79m1DF7GBE8JjEZUyGL9IxRZGLYpxsrHX5uDC1/
mYgOMOyhaY5gSMHTCMc2CDbjGFmvK/fPX1czjdffiPdL6hhKwrpldVRzasghKT8
Rit98i8B+EF0BYBCUTZ4NA9stl75JsaLFXERDmIuspQOar/Qw216dJ7ovQKBgFeZ
m3Wf8qOeWZJA98TndZx1z3O43DQj/c3nItE63GmR7cp32qiR8K6QXbARQp2EzeV/
A9VhQtWywB7Aqkk4TxAbG/Ytd3m2FilmtSdk+KrkjuzuLrd7/nNt8kKCVmFUGsit
hnRkkGQQW4yfBLNoR2fvucFigrWhhKrRV7+vcIYNAoGAXVXRaHdMBHf7lIElfADs
HpIFD8m4U+axNXNSNb273ay9xRMWFRkPeuewMg7YOe5hZUHcB1teq5/l+SDSLrZk
1ENCy56rMnRTrYaXmMGuq7ycF8F70bnl0JVk3D4sRgLUfCdVlD71+ssrWjq+Y7t1
9DKWgWTGDDZdXk9Kb9a/IHI=
-----END PRIVATE KEY-----`;

// Test with crypto
try {
  const keyObj = crypto.createPrivateKey({ key: privateKey, format: 'PEM', type: 'pkcs8' });
  console.log('PKCS8 crypto OK, type:', keyObj.asymmetricKeyType);
} catch(e) {
  console.log('PKCS8 crypto error:', e.message);
}

// Test with google auth  
const credentials = {
  client_email: 'dashboard-estoque@focus-vertex-454703-t1.iam.gserviceaccount.com',
  private_key: privateKey,
};
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth });
sheets.spreadsheets.values.get({
  spreadsheetId: '1LOWtzmQSuluue7_778MHEg3Ac6iajbLZdH0KAPI4mHk',
  range: 'Página1!A1:H3',
}).then(r => console.log('Sheets OK:', JSON.stringify(r.data.values))).catch(e => console.log('Sheets error:', e.message));
