import { google } from 'googleapis';

const SPREADSHEET_ID = '1LOWtzmQSuluue7_778MHEg3Ac6iajbLZdH0KAPI4mHk';

async function getGoogleSheetsData() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: ['Página1!A1:H100', 'movimentacoes!A1:E100'],
  });

  return {
    produtos: response.valueRanges?.[0]?.values || [],
    movimentacoes: response.valueRanges?.[1]?.values || [],
  };
}

function calcularEstoqueProdutos(produtos: any[], movimentacoes: any[]) {
  const headers = produtos[0] || [];
  const data = produtos.slice(1);
  
  const estoques: any = {};
  data.forEach(row => {
    const sku = row[3]; // SKU column
    const qtd = parseInt(row[4]) || 0; // quantidade
    estoques[sku] = qtd;
  });

  // Apply movements
  const movHeaders = movimentacoes[0] || [];
  const movData = movimentacoes.slice(1);
  
  movData.forEach(row => {
    const produtoId = row[1]; // produto_id
    const tipo = row[2]; // tipo
    const qtd = parseInt(row[3]) || 0;
    
    if (tipo === 'entrada') {
      estoques[produtoId] = (estoques[produtoId] || 0) + qtd;
    } else if (tipo === 'saida') {
      estoques[produtoId] = (estoques[produtoId] || 0) - qtd;
    }
  });

  return estoques;
}

export default async function Dashboard() {
  let data = { produtos: [], movimentacoes: [] };
  let error = null;

  try {
    data = await getGoogleSheetsData();
  } catch (e: any) {
    error = e.message;
  }

  const headers = data.produtos[0] || [];
  const produtos = data.produtos.slice(1);
  const movimentacoes = data.movimentacoes.slice(1);
  const estoquesAtuais = calcularEstoqueProdutos(data.produtos, data.movimentacoes);

  const totalProdutos = produtos.length;
  const produtosEmFalta = produtos.filter((p: any) => {
    const sku = p[3];
    return (estoquesAtuais[sku] || 0) <= (parseInt(p[5]) || 0);
  }).length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          📦 Dashboard de Estoque
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erro ao conectar planilha:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-500 text-sm font-medium">Total de Produtos</h2>
            <p className="text-3xl font-bold text-blue-600">{totalProdutos}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-500 text-sm font-medium">Em Falta / Estoque Baixo</h2>
            <p className="text-3xl font-bold text-red-500">{produtosEmFalta}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-500 text-sm font-medium">Últimas Movimentações</h2>
            <p className="text-3xl font-bold text-green-500">{movimentacoes.length}</p>
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">📋 Produtos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header: string, i: number) => (
                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {header}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estoque Atual
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtos.map((produto: any, i: number) => {
                  const sku = produto[3];
                  const estoqueAtual = estoquesAtuais[sku] || 0;
                  const estoqueMin = parseInt(produto[5]) || 0;
                  const isLow = estoqueAtual <= estoqueMin;
                  
                  return (
                    <tr key={i} className={isLow ? 'bg-red-50' : ''}>
                      {produto.map((cell: any, j: number) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cell}
                        </td>
                      ))}
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                        isLow ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {estoqueAtual}
                        {isLow && ' ⚠️'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Últimas Movimentações */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">📊 Últimas Movimentações</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observação</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentacoes.slice(-10).reverse().map((mov: any, i: number) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mov[0]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mov[1]}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                      mov[2] === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {mov[2] === 'entrada' ? '📥 ENTRADA' : '📤 SAÍDA'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{mov[3]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mov[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Dashboard atualizado em tempo real via Google Sheets API
        </p>
      </div>
    </div>
  );
}
