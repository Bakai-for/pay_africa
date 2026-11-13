import {useEffect, useState} from 'react'; import {admin} from '../../services/api'; import {Link} from 'react-router-dom'
export default function AdminDashboard(){
  const [stats,setStats]=useState(null)
  useEffect(()=>{ admin.stats().then(r=>setStats(r.data)) },[])
  if(!stats) return <div className="p-8">Chargement...</div>
  return <div className="max-w-5xl mx-auto space-y-6">
    <h1 className="text-2xl font-extrabold">Dashboard Propriétaire (Admin)</h1>
    <div className="grid sm:grid-cols-4 gap-4">
      <div className="bg-emerald-500 text-white rounded-2xl p-4"><div className="text-xs font-bold opacity-80">CA TOTAL</div><div className="text-2xl font-extrabold">{Number(stats.totalRevenue).toLocaleString()} XAF</div></div>
      <div className="bg-slate-900 text-white rounded-2xl p-4"><div className="text-xs font-bold opacity-60">COMMISSION 1.5%</div><div className="text-2xl font-extrabold">{Number(stats.totalCommission).toLocaleString()} XAF</div><div className="text-xs opacity-60">Vos gains</div></div>
      <div className="bg-white border rounded-2xl p-4"><div className="text-xs font-bold text-slate-500">COMMANDES</div><div className="text-2xl font-extrabold">{stats.totalOrders}</div></div>
      <div className="bg-white border rounded-2xl p-4"><div className="text-xs font-bold text-slate-500">PARTENAIRES / CLIENTS</div><div className="text-xl font-extrabold">{stats.totalPartners} / {stats.totalClients}</div><div className="text-xs">{stats.totalProducts} produits</div></div>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      <Link to="/admin/partners" className="bg-white border rounded-2xl p-6 hover:shadow">🏪 Gérer les partenaires →<div className="text-xs text-slate-500 mt-1">Valider / suspendre</div></Link>
      <Link to="/admin/orders" className="bg-white border rounded-2xl p-6 hover:shadow">📦 Toutes les commandes →<div className="text-xs text-slate-500 mt-1">Suivi global</div></Link>
      <Link to="/admin/settings" className="bg-white border rounded-2xl p-6 hover:shadow">⚙️ Paramètres →<div className="text-xs text-slate-500 mt-1">Commission, bons, CGU</div></Link>
    </div>
  </div>
}
