import {useEffect, useState} from 'react'; import {orders} from '../../services/api'
export default function PartnerOrders(){
  const [list,setList]=useState([]); const [msg,setMsg]=useState('')
  const load=async()=>{ const r=await orders.partnerMy(); const d=r.data.content||r.data; setList(Array.isArray(d)?d:[]) }
  useEffect(()=>{ load() },[])
  const setStatus=async(id, s)=>{ await orders.updateStatus(id,s); setMsg(`Statut → ${s}`); load()}
  const stats={paye:list.filter(o=>o.status==='PAYE').length, pending:list.filter(o=>o.status==='PENDING_PAYMENT').length, echec:list.filter(o=>o.status==='ECHEC_PAIEMENT').length, revenue:list.filter(o=>o.status==='PAYE').reduce((a,b)=>a+(b.netToPartner||0),0)}
  return <div className="max-w-5xl mx-auto space-y-4">
    <div className="flex justify-between items-center"><h1 className="text-2xl font-extrabold">Commandes reçues — Produits achetés</h1><span className="text-sm bg-slate-100 px-3 py-1 rounded-full font-bold">{list.length} commandes</span></div>
    <p className="text-sm text-slate-500">Vous ne recevez que les commandes <b>PAYÉES</b>. Les <b>PENDING_PAYMENT</b> restent côté client jusqu'à réussite. Commission 1.5% déjà déduite (net = ce que vous touchez).</p>
    {msg && <div className="bg-emerald-50 border px-4 py-2 rounded-xl text-sm">{msg}</div>}
    <div className="grid sm:grid-cols-4 gap-3">
      <div className="bg-emerald-500 text-white rounded-xl p-3 text-center"><div className="text-xs opacity-80">PAYÉES</div><div className="text-xl font-extrabold">{stats.paye}</div><div className="text-xs">{stats.revenue.toLocaleString()} XAF net</div></div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center"><div className="text-xs font-bold text-amber-700">EN ATTENTE</div><div className="text-xl font-extrabold">{stats.pending}</div><div className="text-xs">Client doit réessayer</div></div>
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center"><div className="text-xs font-bold text-red-700">ÉCHEC</div><div className="text-xl font-extrabold">{stats.echec}</div></div>
      <div className="bg-white border rounded-xl p-3 text-center"><div className="text-xs text-slate-500">TOTAL</div><div className="text-xl font-extrabold">{list.length}</div></div>
    </div>
    <div className="space-y-3">
      {list.map(o=> <div key={o.id} className="bg-white rounded-2xl border p-4">
        <div className="flex justify-between items-start"><span className="font-mono font-bold text-sm">{o.reference}</span><span className={`px-3 py-1 rounded-full text-xs font-bold ${o.status==='PAYE'?'bg-emerald-50 text-emerald-700':o.status==='PENDING_PAYMENT'?'bg-amber-50 text-amber-700':o.status==='EN_PREPARATION'?'bg-blue-50 text-blue-700':o.status==='LIVRE'?'bg-slate-900 text-white':'bg-red-50 text-red-700'}`}>{o.status}</span></div>
        <div className="text-sm font-semibold mt-1">Client: {o.clientName} • {Number(o.total).toLocaleString()} {o.currency} → Net {Number(o.netToPartner).toLocaleString()} (commission {Number(o.commission).toLocaleString()}) {o.voucherCode && <span className="text-xs bg-emerald-50 px-2 py-0.5 rounded-full">bon {o.voucherCode}</span>}</div>
        <div className="text-xs text-slate-600 mt-1 bg-slate-50 rounded-xl p-2">{o.items?.map(i=> `${i.productName} x${i.quantity} (${Number(i.unitPrice).toLocaleString()})`).join(' • ')}</div>
        <div className="text-xs text-slate-500 mt-1">{o.operator} • {o.clientPhone} • {new Date(o.createdAt).toLocaleString()}</div>
        <div className="flex gap-2 mt-3">
          {o.status==='PAYE' && <button onClick={()=>setStatus(o.id,'EN_PREPARATION')} className="px-4 py-2 bg-blue-500 text-white rounded-full text-xs font-bold">Passer en préparation</button>}
          {o.status==='EN_PREPARATION' && <button onClick={()=>setStatus(o.id,'LIVRE')} className="px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-bold">Marquer livré ✅</button>}
          {o.status==='PENDING_PAYMENT' && <span className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-full">⏳ En attente de paiement client — non comptabilisé</span>}
          {o.status==='ECHEC_PAIEMENT' && <span className="text-xs text-red-700 bg-red-50 px-3 py-2 rounded-full">❌ Échec paiement — client doit réessayer</span>}
        </div>
      </div>)}
      {list.length===0 && <div className="bg-white rounded-2xl border p-8 text-center text-slate-400">Aucune commande — vos ventes apparaîtront ici après paiement</div>}
    </div>
  </div>
}
