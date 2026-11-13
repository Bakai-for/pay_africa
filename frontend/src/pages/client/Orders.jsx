import {useEffect, useState} from 'react'; import {orders, historyApi} from '../../services/api'
export default function Orders(){
  const [list,setList]=useState([]); const [msg,setMsg]=useState(''); const [tab,setTab]=useState('orders'); const [history,setHistory]=useState(null)
  const load=()=> orders.my().then(r=> setList(r.data.content||r.data)).catch(()=>{})
  useEffect(()=>{ load(); historyApi.my().then(r=>setHistory(r.data)).catch(()=>{}) },[])
  const retry=async(id)=>{
    try{ await orders.retry(id); setMsg('Paiement rejoué ✅ — facture mise à jour'); load() }catch(e){ setMsg(e.response?.data?.message||e.response?.data?.error||e.message)}
  }
  const invoice=async(id)=>{
    const r=await orders.invoice(id); alert('FACTURE '+r.data.reference+'\nBoutique: '+r.data.shopName+'\nTotal: '+Number(r.data.total).toLocaleString()+' '+r.data.currency+'\nStatut: '+r.data.status+'\n\nArticles:\n'+r.data.items.map(i=>`- ${i.productName} x${i.quantity} = ${Number(i.subtotal).toLocaleString()}`).join('\n')+'\n\nRéférence paiement: '+ (r.data.reference))
  }
  return <div className="max-w-5xl mx-auto">
    <div className="flex justify-between items-center"><h1 className="text-2xl font-extrabold">Mes achats & Historique</h1><div className="flex gap-2"><button onClick={()=>setTab('orders')} className={`px-4 py-2 rounded-full text-sm font-bold ${tab==='orders'?'bg-slate-900 text-white':'bg-slate-100'}`}>Commandes</button><button onClick={()=>setTab('history')} className={`px-4 py-2 rounded-full text-sm font-bold ${tab==='history'?'bg-slate-900 text-white':'bg-slate-100'}`}>Historique</button></div></div>
    {msg && <div className="mt-4 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl text-sm">{msg}</div>}
    {tab==='orders' && <div className="mt-6 space-y-3">
      <p className="text-sm text-slate-500">Vous recevez une <b>facture</b> par commande (référence, boutique, montant). Les détails commission/part partenaire sont masqués — visibles uniquement côté admin/fournisseur.</p>
      {list.length===0 && <div className="bg-white rounded-2xl border p-8 text-center text-slate-400">Aucune commande — vos achats apparaîtront ici</div>}
      {list.map(o=> <div key={o.id} className="bg-white rounded-2xl border p-4">
        <div className="flex justify-between items-center"><span className="font-mono font-bold text-sm">{o.reference}</span><span className={`px-2 py-1 rounded-full text-xs font-bold ${o.status==='PAYE'?'bg-emerald-50 text-emerald-700': o.status==='PENDING_PAYMENT'?'bg-amber-50 text-amber-700': o.status==='ECHEC_PAIEMENT'?'bg-red-50 text-red-700':'bg-slate-100'}`}>{o.status}</span></div>
        <div className="text-sm font-semibold mt-1">{o.shopName} • {o.currency}</div>
        <div className="text-xs text-slate-500">Total facturé: <b>{Number(o.total).toLocaleString()} {o.currency}</b> {o.discount>0 && <span className="text-emerald-600">(-{Number(o.discount).toLocaleString()} bon {o.voucherCode})</span>} • {new Date(o.createdAt).toLocaleString()}</div>
        <div className="mt-2 text-xs bg-slate-50 rounded-xl p-2">{o.items?.map(i=> `${i.productName} x${i.quantity} (${Number(i.unitPrice).toLocaleString()})`).join(' • ')}</div>
        <div className="flex gap-2 mt-3">
          <button onClick={()=>invoice(o.id)} className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-sm font-bold">📄 Voir facture</button>
          {(o.status==='PENDING_PAYMENT' || o.status==='ECHEC_PAIEMENT') && <button onClick={()=>retry(o.id)} className="flex-1 bg-amber-500 text-white py-2 rounded-xl text-sm font-bold">🔄 Réessayer</button>}
        </div>
        {o.status==='PAYE' && <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">✅ Payée — facture disponible • Bon fidélité généré si palier atteint (5/10 commandes)</div>}
      </div>)}
    </div>}
    {tab==='history' && <div className="mt-6 bg-white rounded-2xl border p-6">
      <h3 className="font-bold">Historique d'activité — Client</h3>
      <p className="text-sm text-slate-500">Toutes vos commandes, bons et références</p>
      {history ? <div className="mt-4 space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-xl p-4 text-center"><div className="text-2xl font-extrabold">{history.orders?.length||list.length}</div><div className="text-xs font-bold text-slate-500">COMMANDES</div></div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center"><div className="text-2xl font-extrabold">{history.vouchers?.length||0}</div><div className="text-xs font-bold text-emerald-700">BONS REÇUS</div></div>
          <div className="bg-white border rounded-xl p-4 text-center"><div className="text-2xl font-extrabold">{history.activities||0}</div><div className="text-xs">ACTIVITÉS</div></div>
        </div>
        <div className="mt-4">
          <h4 className="font-bold text-sm">Dernières factures</h4>
          <div className="mt-2 space-y-2 max-h-[400px] overflow-auto">
            {(history.orders||list).slice(0,10).map(o=> <div key={o.id} className="flex justify-between items-center border rounded-xl p-3 text-sm"><span className="font-mono font-bold">{o.reference}</span><span>{Number(o.total).toLocaleString()} {o.currency}</span><span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{o.status}</span></div>)}
          </div>
        </div>
        {history.vouchers?.length>0 && <div className="mt-4"><h4 className="font-bold text-sm">Bons</h4><div className="mt-2 flex flex-wrap gap-2">{history.vouchers.map(v=> <span key={v.code} className={`px-3 py-1 rounded-full text-xs font-bold ${v.isUsed?'bg-slate-100 text-slate-500':'bg-emerald-500 text-white'}`}>{v.code} -{v.discountPercent}% {v.isUsed?'(utilisé)':''}</span>)}</div></div>}
      </div> : <div className="mt-4 text-sm text-slate-400">Chargement...</div>}
    </div>}
  </div>
}
