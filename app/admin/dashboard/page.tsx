'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, RefreshCcw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  qty: number;
}

interface Lead {
  id: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  amount: string;
  status: string;
  products: Product[];
  utm_source: string;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leads');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Failed to fetch leads', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
          <span className="text-xl font-bold text-gray-800">Leads Admin</span>
        </div>
        <button 
          onClick={() => {
            // Logout logic could be just clearing cookie via API, but here we just redirect for simplicity or assume cookie expires
            // Real logout should call an API to clear cookie
            document.cookie = 'admin_auth=; Max-Age=0; path=/;';
            router.push('/admin');
          }}
          className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <LogOut size={18} /> Sair
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendas & Leads</h1>
            <p className="text-gray-500 mt-1">Gerencie e visualize as últimas transações.</p>
          </div>
          <button 
            onClick={fetchLeads}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Atualizar
          </button>
        </div>

        {/* Stats Cards (Mockup) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Vendas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{leads.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Receita (Est.)</h3>
             <p className="text-3xl font-bold text-emerald-600 mt-2">
                € {leads.reduce((acc, lead) => acc + parseFloat(lead.amount || '0'), 0).toFixed(2)}
             </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Status</h3>
            <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                    {leads.filter(l => l.status === 'succeeded').length} Sucesso
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">
                    {leads.filter(l => l.status !== 'succeeded').length} Outros
                </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Valor</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Origem (UTM)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {leads.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Nenhum lead encontrado.
                                </td>
                            </tr>
                        )}
                        {loading && leads.length === 0 && (
                             <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Carregando...
                                </td>
                            </tr>
                        )}
                        {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                    {new Date(lead.created_at).toLocaleDateString('pt-BR')} <span className="text-gray-400 text-xs">{new Date(lead.created_at).toLocaleTimeString('pt-BR')}</span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {lead.customer_name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {lead.customer_email}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    € {parseFloat(lead.amount).toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${lead.status === 'succeeded' ? 'bg-green-100 text-green-800' : 
                                          lead.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {lead.utm_source ? (
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs border border-indigo-100">
                                            {lead.utm_source}
                                        </span>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}
