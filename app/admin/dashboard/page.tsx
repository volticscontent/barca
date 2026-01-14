'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, RefreshCcw, ChevronDown, ChevronUp, Shirt, Tag } from 'lucide-react';

interface Customization {
  name?: string;
  number?: string;
  badges?: { sku?: string; id?: string }[];
}

interface OrderItem {
  sku: string;
  product_name: string;
  quantity: number;
  size: string | null;
  customization: Customization;
  price: string;
}

interface Order {
  id: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  amount_total: string;
  status: string;
  items: OrderItem[];
  utm_source: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leads');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="text-xl font-bold text-gray-800">Admin Panel</span>
        </div>
        <button 
          onClick={() => {
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
            <h1 className="text-3xl font-bold text-gray-900">Pedidos Recentes</h1>
            <p className="text-gray-500 mt-1">Gerencie pedidos, SKUs e personalizações.</p>
          </div>
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Atualizar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Pedidos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Receita Total</h3>
             <p className="text-3xl font-bold text-emerald-600 mt-2">
                € {orders.reduce((acc, order) => acc + parseFloat(order.amount_total || '0'), 0).toFixed(2)}
             </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Status</h3>
            <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                    {orders.filter(l => l.status === 'paid' || l.status === 'succeeded').length} Pagos
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">
                    {orders.filter(l => l.status === 'pending').length} Pendentes
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
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Valor</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Itens</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.length === 0 && !loading && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    Nenhum pedido encontrado.
                                </td>
                            </tr>
                        )}
                        {loading && orders.length === 0 && (
                             <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    Carregando...
                                </td>
                            </tr>
                        )}
                        {orders.map((order) => (
                            <Fragment key={order.id}>
                                <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleRow(order.id)}>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                        #{order.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        {new Date(order.created_at).toLocaleDateString('pt-BR')} <span className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleTimeString('pt-BR')}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{order.customer_name || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{order.customer_email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        € {parseFloat(order.amount_total || '0').toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${(order.status === 'paid' || order.status === 'succeeded') ? 'bg-green-100 text-green-800' : 
                                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                                        <div className="flex items-center justify-center gap-1">
                                            <Tag size={14} />
                                            {order.items?.length || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {expandedRows[order.id] ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                    </td>
                                </tr>
                                {expandedRows[order.id] && (
                                    <tr className="bg-gray-50">
                                        <td colSpan={7} className="px-6 py-4 border-t border-gray-100">
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Detalhes do Pedido</h4>
                                                <div className="grid gap-3">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
                                                                    <Shirt size={20} />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-gray-900">{item.sku}</span>
                                                                        {item.size && (
                                                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-mono">Size: {item.size}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">{item.product_name}</div>
                                                                </div>
                                                            </div>
                                                            
                                                            {item.customization && Object.keys(item.customization).length > 0 && (
                                                                <div className="flex-1 border-l border-gray-100 pl-4 ml-2 text-sm text-gray-600">
                                                                    <div className="font-medium text-xs text-gray-400 uppercase mb-1">Personalização</div>
                                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                                        {item.customization.name && <div>Nome: <span className="font-medium text-gray-800">{item.customization.name}</span></div>}
                                                                        {item.customization.number && <div>Número: <span className="font-medium text-gray-800">{item.customization.number}</span></div>}
                                                                        {item.customization.badges && item.customization.badges.length > 0 && (
                                                                            <div className="col-span-2">
                                                                                Badges: <span className="font-medium text-gray-800">{item.customization.badges.map((b) => b.sku || b.id).join(', ')}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="text-right font-medium text-gray-900 whitespace-nowrap">
                                                                {item.quantity} x €{parseFloat(item.price).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-2">
                                                    UTM Source: {order.utm_source || '-'}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}
