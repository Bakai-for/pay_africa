import {useEffect, useState} from 'react'; import {orders} from '../../services/api'
export default function Vouchers(){
  const [list,setList]=useState([])
  useEffect(()=>{ orders.myVouchers().then(r=> setList(r.data)) },[])
  return <div className="max-w-3xl mx-auto">
    <h1 className="text-2xl font-extrabold">Mes bons de réduction</h1>
    <p className="text-sm text-slate-500">Gagnés selon votre fidélité (nombre de commandes) — règles gérées par l'admin</p>
    <div className="mt-6 grid gap-3">
      {list.length===0 && <div className="bg-white rounded-2xl border p-8 text-center text-slate-400">Aucun bon pour l'instant. Commandez 5 fois pour gagner -5% !</div>}
      {list.map(v=> <div key={v.code} className={`rounded-2xl border-2 p-4 flex justify-between items-center ${v.isUsed?'bg-slate-50 border-slate-200 opacity-60':'bg-emerald-50 border-emerald-300'}`}>
        <div><div className="font-mono font-extrabold text-lg">{v.code}</div><div className="text-sm font-semibold">-{v.discountPercent}% • {v.reason}</div><div className="text-xs text-slate-500">Expire {new Date(v.expiresAt).toLocaleDateString()}</div></div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${v.isUsed?'bg-slate-200':'bg-emerald-500 text-white'}`}>{v.isUsed?'Utilisé':'Disponible'}</span>
      </div>)}
    </div>
    <div className="mt-6 bg-slate-900 text-white rounded-2xl p-4 text-sm">
      <b>Comment ça marche ?</b> L'admin a configuré : 5 cmd → -5%, 10 cmd → -10%, 20 cmd → -15%. Le bon s'applique au panier au moment de payer.
    </div>
  </div>
}
