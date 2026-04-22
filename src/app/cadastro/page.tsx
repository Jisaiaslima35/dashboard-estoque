'use client'

import { useState } from 'react';
import Header from '../components/Header';

const WEBHOOK = 'https://n8n.automacaojs.club/webhook/cadastro-produto';

export default function Cadastro() {
  const [form, setForm] = useState({
    produto: '', categoria: '', sku: '',
    quantidade: '', estoque_minimo: '',
    preco_custo: '', preco_venda: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'sucesso' | 'erro'>('idle');
  const [mensagem, setMensagem] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    if (!form.produto || !form.sku) {
      setStatus('erro');
      setMensagem('Produto e SKU são obrigatórios.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.sucesso) {
        setStatus('sucesso');
        setMensagem(json.mensagem);
        setForm({ produto: '', categoria: '', sku: '', quantidade: '', estoque_minimo: '', preco_custo: '', preco_venda: '' });
      } else {
        setStatus('erro');
        setMensagem(json.mensagem || 'Erro ao cadastrar.');
      }
    } catch {
      setStatus('erro');
      setMensagem('Erro de conexão com o servidor.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-xl mx-auto p-8">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">➕ Cadastro de Produto</h1>
        <p className="text-gray-500 text-sm mb-8">Preencha os dados. O produto aparecerá no dashboard automaticamente.</p>

        {status === 'sucesso' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">✅ {mensagem}</div>
        )}
        {status === 'erro' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">❌ {mensagem}</div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do produto *</label>
            <input type="text" name="produto" value={form.produto} onChange={handleChange}
              placeholder="Ex: Teclado Mecânico RGB"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Código *</label>
            <input type="text" name="sku" value={form.sku} onChange={handleChange}
              placeholder="Ex: TEC-RGB-001"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input type="text" name="categoria" value={form.categoria} onChange={handleChange}
              placeholder="Ex: Informática, Roupas"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade inicial</label>
              <input type="number" name="quantidade" value={form.quantidade} onChange={handleChange}
                placeholder="0" min="0"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque mínimo</label>
              <input type="number" name="estoque_minimo" value={form.estoque_minimo} onChange={handleChange}
                placeholder="5" min="0"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço de custo (R$)</label>
              <input type="number" name="preco_custo" value={form.preco_custo} onChange={handleChange}
                placeholder="0.00" min="0" step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço de venda (R$)</label>
              <input type="number" name="preco_venda" value={form.preco_venda} onChange={handleChange}
                placeholder="0.00" min="0" step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <button onClick={handleSubmit} disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded text-sm transition disabled:opacity-50">
            {status === 'loading' ? 'Salvando...' : '💾 Cadastrar Produto'}
          </button>
          <p className="text-center text-xs text-gray-400">
            Após salvar, o produto aparece no{' '}
            <a href="/" className="text-blue-500 hover:underline">dashboard</a> automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
