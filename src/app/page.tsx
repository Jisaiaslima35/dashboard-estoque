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
    const interval = setInterval(carregar, 5000);
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

  let totalValorEstoque = 0;
  let totalLucroPotencial = 0;

  produtos.forEach((p: any[]) => {
    const sku = p[3];
    const estoqueAtual = estoquesAtuais[sku] || 0;
    const precoCusto = parseFloat((p[6] || '0').replace(',', '.')) || 0;
    const precoVenda = parseFloat((p[7] || '0').replace(',', '.')) || 0;
    totalValorEstoque += estoqueAtual * precoCusto;
    totalLucroPotencial += estoqueAtual * precoVenda;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">📦 Dashboard de Estoque</h1>

        {error && <p className="text-red-500">{error}</p>}

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Total Produtos</p>
            <h2 className="text-2xl font-bold">{totalProdutos}</h2>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Estoque Baixo</p>
            <h2 className="text-2xl font-bold text-red-500">{produtosEmFalta}</h2>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Movimentações</p>
            <h2 className="text-2xl font-bold text-green-500">{movimentacoes.length}</h2>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Valor em Estoque</p>
            <h2 className="text-xl font-bold text-purple-600">R$ {totalValorEstoque.toFixed(2)}</h2>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Valor de Venda</p>
            <h2 className="text-xl font-bold text-green-600">R$ {totalLucroPotencial.toFixed(2)}</h2>
          </div>
        </div>

        {/* TABELA PRODUTOS */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">📋 Produtos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((h: string, i: number) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque Atual</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor em Estoque</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor de Venda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {produtos.map((p: any[], i: number) => {
                  const sku = p[3];
                  const estoqueAtual = estoquesAtuais[sku] || 0;
                  const estoqueMin = parseInt(p[5]) || 0;
                  const precoCusto = parseFloat((p[6] || '0').replace(',', '.')) || 0;
                  const precoVenda = parseFloat((p[7] || '0').replace(',', '.')) || 0;
                  const valorEstoque = estoqueAtual * precoCusto;
                  const valorVenda = estoqueAtual * precoVenda;
                  const baixo = estoqueAtual <= estoqueMin;

                  return (
                    <tr key={i} className={baixo ? 'bg-red-50' : ''}>
                      {p.map((c: any, j: number) => (
                        <td key={j} className="px-4 py-3 text-sm text-gray-900">{c}</td>
                      ))}
                      <td className="px-4 py-3 text-sm font-bold">
                        <span className={baixo ? 'text-red-600' : 'text-green-600'}>
                          {estoqueAtual} {baixo && '⚠️'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-purple-600 font-bold">
                        R$ {valorEstoque.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-bold">
                        R$ {valorVenda.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABELA MOVIMENTAÇÕES */}
        <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              📊 Movimentações em Tempo Real
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Obs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">
                      Nenhuma movimentação encontrada
                    </td>
                  </tr>
                ) : (
                  movimentacoes.slice(-10).reverse().map((mov: any[], i: number) => (
                    <tr key={i}>
                      <td className="px-6 py-4 text-sm text-gray-900">{mov[0]}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{mov[1]}</td>
                      <td className={`px-6 py-4 text-sm font-bold ${mov[2] === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {mov[2] === 'entrada' ? '📥 Entrada' : '📤 Saída'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{mov[3]}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{mov[4]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Atualização automática a cada 5 segundos 🚀
        </p>

      </div>
      </div>
    </div>
  );
}
