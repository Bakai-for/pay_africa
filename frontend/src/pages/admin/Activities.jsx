import {useEffect, useState} from 'react'; import {admin} from '../../services/api'
export default function Activities(){
  const [data,setData]=useState(null)
  useEffect(()=>{ admin.activities().then(r=>setData(r.data)) },[])
  if(!data) return <div className="p-8">Chargement historique...</div>
  return <div className="max-w-6xl mx-auto space-y-6">
    <h1 className="text-2xl font-extrabold">Historique — Toutes les activités groupées par acteur</h1>
    <p className="text-sm text-slate-500">Vue admin : commandes, produits, partenaires regroupés par client / boutique / statut</p>
    <div className="grid sm:grid-cols-4 gap-4">
      <div className="bg-slate-900 text-white rounded-2xl p-4 text-center"><div className="text-2xl font-extrabold">{data.totalOrders}</div><div className="text-xs opacity-60">COMMANDES</div></div>
      <div className="bg-emerald-500 text-white rounded-2xl p-4 text-center"><div className="text-2xl font-extrabold">{data.totalProducts}</div><div className="text-xs">PRODUITS ({data.pendingProducts} en attente)</div></div>
      <div className="bg-white border rounded-2xl p-4 text-center"><div className="text-2xl font-extrabold">{data.totalPartners}</div><div className="text-xs text-slate-500">PARTENAIRES ({data.pendingPartners} en attente)</div></div>
      <div className="bg-white border rounded-2xl p-4 text-center"><div className="text-2xl font-extrabold">{data.totalUsers}</div><div className="text-xs">UTILISATEURS</div></div>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl border p-4">
        <h3 className="font-bold text-sm">Par Client</h3>
        <div className="mt-2 space-y-1 max-h-[300px] overflow-auto">
          {Object.entries(data.ordersByClient||{}).map(([k,v])=> <div key={k} className="flex justify-between text-sm border-b py-2"><span className="truncate">{k}</span><span className="font-bold">{v}</span></div>)}
          {Object.keys(data.ordersByClient||{}).length===0 && <div className="text-xs text-slate-400">Aucune</div>}
        </div>
      </div>
      <div className="bg-white rounded-2xl border p-4">
        <h3 className="font-bold text-sm">Par Boutique Partenaire</h3>
        <div className="mt-2 space-y-1 max-h-[300px] overflow-auto">
          {Object.entries(data.ordersByPartner||{}).map(([k,v])=> <div key={k} className="flex justify-between text-sm border-b py-2"><span>{k}</span><span className="font-bold">{v}</span></div>)}
        </div>
      </div>
      <div className="bg-white rounded-2xl border p-4">
        <h3 className="font-bold text-sm">Par Statut</h3>
        <div className="mt-2 space-y-1">
          {Object.entries(data.ordersByStatus||{}).map(([k,v])=> <div key={k} className="flex justify-between text-sm border-b py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${k==='PAYE'?'bg-emerald-100 text-emerald-700':k==='PENDING_PAYMENT'?'bg-amber-100 text-amber-700':'bg-slate-100'}`}>{k}</span><span className="font-bold">{v}</span></div>)}
        </div>
      </div>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border p-4">
        <h3 className="font-bold text-sm">Dernières commandes (10)</h3>
        <div className="mt-3 space-y-2">
          {(data.recentOrders||[]).map(o=> <div key={o.ref} className="flex justify-between items-center border rounded-xl p-3 text-sm"><div><div className="font-mono font-bold text-xs">{o.ref}</div><div className="text-xs text-slate-500">{o.shop} → {o.client}</div></div><div className="text-right"><div className="font-bold">{Number(o.total).toLocaleString()}</div><div className={`text-xs px-2 py-0.5 rounded-full ${o.status==='PAYE'?'bg-emerald-50 text-emerald-700':'bg-amber-50'}`}>{o.status}</div></div></div>)}
        </div>
      </div>
      <div className="bg-white rounded-2xl border p-4">
        <h3 className="font-bold text-sm">Derniers produits (10)</h3>
        <div className="mt-3 space-y-2">
          {(data.recentProducts||[]).map(p=> <div key={p.name} className="flex justify-between items-center border rounded-xl p-3 text-sm"><span className="font-bold truncate">{p.name}</span><span className="text-xs text-slate-500">{p.shop}</span><span className={`text-xs px-2 py-1 rounded-full font-bold ${p.validated?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{p.validated?'Approuvé':'En attente'}</span></div>)}
        </div>
      </div>
    </div>
  </div>
}
