'use client'

import { useEffect, useState } from 'react';

function calcularEstoqueProdutos(produtos: any[][], movimentacoes: any[][]) {
  const data = produtos.slice(1);
  const estoques: any = {};

  data.forEach(row => {
    const sku = row[3];
    const qtd = parseInt(row[4]) || 0;
    estoques[sku] = qtd;
  });

  const movData = movimentacoes.slice(1);
  movData.forEach(row => {
    const produtoId = row[1];
    const tipo = row[2];
    const qtd = parseInt(row[3]) || 0;

    if (tipo === 'entrada') {
      estoques[produtoId] = (estoques[produtoId] || 0) + qtd;
    } else if (tipo === 'saida') {
      estoques[produtoId] = (estoques[produtoId] || 0) - qtd;
    }
  });

  return estoques;
}

export default function Dashboard() {
  const [data, setData] = useState<any>({ produtos: [], movimentacoes: [] });
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    try {
      const res = await fetch('/api/estoque');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    carregar();

    const interval = setInterval(() => {
      carregar();
    }, 5000); // atualiza a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const headers = data.produtos[0] || [];
  const produtos = data.produtos.slice(1);
  const movimentacoes = data.movimentacoes.slice(1);
  const estoquesAtuais = calcularEstoqueProdutos(data.produtos, data.movimentacoes);

  const totalProdutos = produtos.length;

  const produtosEmFalta = produtos.filter((p: any[]) => {
    const sku = p[3];
    return (estoquesAtuais[sku] || 0) <= (parseInt(p[5]) || 0);
  }).length;

  // Calcular totais de valor e lucro
  let totalValorEstoque = 0;
  let totalLucroPotencial = 0;
  produtos.forEach((p: any[]) => {
    const sku = p[3];
    const estoqueAtual = estoquesAtuais[sku] || 0;
    const precoCusto = parseFloat(p[6]) || 0;
    const precoVenda = parseFloat(p[7]) || 0;
    totalValorEstoque += estoqueAtual * precoCusto;
    totalLucroPotencial += estoqueAtual * (precoVenda - precoCusto);
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          📦 Dashboard de Estoque
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erro ao conectar API:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-500 text-sm font-medium">Valor Total em Estoque</h2>
            <p className="text-2xl font-bold text-purple-600">R$ {totalValorEstoque.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-500 text-sm font-medium">Lucro Potencial</h2>
            <p className="text-2xl font-bold text-green-600">R$ {totalLucroPotencial.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque Atual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Estoque (R$)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lucro Potencial (R$)</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {produtos.map((produto: any[], i: number) => {
                  const sku = produto[3];
                  const estoqueAtual = estoquesAtuais[sku] || 0;
                  const estoqueMin = parseInt(produto[5]) || 0;
                  const precoCusto = parseFloat(produto[6]) || 0;
                  const precoVenda = parseFloat(produto[7]) || 0;
                  const valorEstoque = estoqueAtual * precoCusto;
                  const lucroUnitario = precoVenda - precoCusto;
                  const lucroTotal = estoqueAtual * lucroUnitario;
                  const isLow = estoqueAtual <= estoqueMin;

                  return (
                    <tr key={i} className={isLow ? 'bg-red-50' : ''}>
                      {produto.map((cell: any, j: number) => (
                        <td key={j} className="px-6 py-4 text-sm text-gray-900">
                          {cell}
                        </td>
                      ))}

                      <td className={`px-6 py-4 text-sm font-bold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
                        {estoqueAtual} {isLow && '⚠️'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                        R$ {valorEstoque.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        R$ {lucroTotal.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Atualização automática a cada 5 segundos 🚀
        </p>
      </div>
    </div>
  );
}
