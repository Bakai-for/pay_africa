import {useEffect, useState} from 'react'; import {admin} from '../../services/api'
export default function AdminOrders(){
  const [list,setList]=useState([])
  useEffect(()=>{ admin.allOrders().then(r=>{ const d=r.data.content||r.data; setList(Array.isArray(d)? d: []) }) },[])
  return <div className="max-w-6xl mx-auto">
    <h1 className="text-2xl font-extrabold">Toutes les commandes (Admin)</h1>
    <div className="mt-6 bg-white rounded-2xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs font-bold"><tr><th className="px-3 py-2 text-left">Réf</th><th className="px-3 py-2">Boutique</th><th className="px-3 py-2">Client</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2 text-right">Commission</th><th className="px-3 py-2">Statut</th><th className="px-3 py-2">Date</th></tr></thead>
          <tbody className="divide-y">
            {list.map(o=> <tr key={o.id} className="hover:bg-slate-50"><td className="px-3 py-2 font-mono text-xs">{o.reference}</td><td className="px-3 py-2">{o.partner?.shopName||o.shopName}</td><td className="px-3 py-2">{o.client?.fullName||o.clientName}</td><td className="px-3 py-2 text-right font-bold">{Number(o.total).toLocaleString()}</td><td className="px-3 py-2 text-right text-emerald-600">{Number(o.commission).toLocaleString()}</td><td className="px-3 py-2"><span className="px-2 py-1 bg-slate-100 rounded-full text-xs">{o.status}</span></td><td className="px-3 py-2 text-xs">{new Date(o.createdAt).toLocaleString()}</td></tr>)}
          </tbody>
        </table>
      </div>
      {list.length===0 && <div className="p-8 text-center text-slate-400">Aucune commande</div>}
    </div>
  </div>
}
