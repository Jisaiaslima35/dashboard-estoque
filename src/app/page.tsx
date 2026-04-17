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
    const precoCusto = parseFloat(p[6]) || 0;
    const precoVenda = parseFloat(p[7]) || 0;

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
            <p>Total Produtos</p>
            <h2 className="text-2xl font-bold">{totalProdutos}</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Estoque Baixo</p>
            <h2 className="text-2xl text-red-500">{produtosEmFalta}</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Movimentações</p>
            <h2 className="text-2xl text-green-500">{movimentacoes.length}</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Valor Estoque</p>
            <h2 className="text-xl text-purple-600">
              R$ {totalValorEstoque.toFixed(2)}
            </h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Valor de Venda</p>
            <h2 className="text-xl text-green-600">
              R$ {totalLucroPotencial.toFixed(2)}
            </h2>
          </div>

        </div>

        {/* TABELA PRODUTOS */}
        <div className="bg-white rounded shadow mb-8 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                {headers.map((h: string, i: number) => (
                  <th key={i} className="p-2 text-left">{h}</th>
                ))}
                <th>Estoque</th>
                <th>Valor Estoque</th>
                <th>Valor Venda</th>
              </tr>
            </thead>

            <tbody>
              {produtos.map((p: any[], i: number) => {
                const sku = p[3];
                const estoqueAtual = estoquesAtuais[sku] || 0;
                const estoqueMin = parseInt(p[5]) || 0;

                const precoCusto = parseFloat(p[6]) || 0;
                const precoVenda = parseFloat(p[7]) || 0;

                const valorEstoque = estoqueAtual * precoCusto;
                const valorVenda = estoqueAtual * precoVenda;

                const baixo = estoqueAtual <= estoqueMin;

                return (
                  <tr key={i} className={baixo ? 'bg-red-100' : ''}>
                    {p.map((c: any, j: number) => (
                      <td key={j} className="p-2">{c}</td>
                    ))}

                    <td className="p-2 font-bold">
                      {estoqueAtual} {baixo && '⚠️'}
                    </td>

                    <td className="p-2">
                      R$ {valorEstoque.toFixed(2)}
                    </td>

                    <td className="p-2 text-green-600 font-bold">
                      R$ {valorVenda.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TABELA MOVIMENTAÇÕES (VOLTOU) */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th>Obs</th>
              </tr>
            </thead>

            <tbody>
              {movimentacoes.slice(-10).reverse().map((m: any[], i: number) => (
                <tr key={i}>
                  <td className="p-2">{m[0]}</td>
                  <td className="p-2">{m[1]}</td>
                  <td className="p-2 font-bold">
                    {m[2] === 'entrada' ? '📥 Entrada' : '📤 Saída'}
                  </td>
                  <td className="p-2">{m[3]}</td>
                  <td className="p-2">{m[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
