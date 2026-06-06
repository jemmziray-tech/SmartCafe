import React from 'react';
import { useStore } from '../store';
import { Navigate } from 'react-router-dom';
import { TrendingUp, Users, Package, ShoppingBag } from 'lucide-react';

export default function Admin() {
  const { user, orders, products } = useStore();

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const revenue = orders.reduce((acc, sum) => acc + sum.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-natural-dark dark:text-natural-light font-serif">SmartCafe Admin</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Total Revenue</p>
          <p className="text-xl font-bold dark:text-natural-light whitespace-nowrap">TZS {revenue.toLocaleString()}</p>
        </div>
        <div className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Total Orders</p>
          <p className="text-xl font-bold dark:text-natural-light">{orders.length}</p>
        </div>
        <div className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-natural-accent mb-3">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Products</p>
          <p className="text-xl font-bold dark:text-natural-light">{products.length}</p>
        </div>
        <div className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl shadow-sm border border-natural-cream dark:border-white/10">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Customers</p>
          <p className="text-xl font-bold dark:text-natural-light">14</p>
        </div>
      </div>

      <div>
        <h2 className="font-bold text-natural-dark dark:text-natural-light mb-3">Recent Orders</h2>
        <div className="space-y-3">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="bg-natural-light dark:bg-natural-dark p-4 rounded-3xl flex items-center justify-between border border-natural-cream dark:border-white/10">
              <div>
                <p className="font-bold text-sm text-natural-dark dark:text-natural-light">{order.id}</p>
                <p className="text-xs text-gray-500">{order.items.length} items</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm font-bold text-natural-accent">TZS {order.total.toLocaleString()}</span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  order.status === 'pending' ? 'bg-natural-cream text-natural-accent dark:bg-natural-accent/20' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4 bg-natural-light dark:bg-natural-dark rounded-xl">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}