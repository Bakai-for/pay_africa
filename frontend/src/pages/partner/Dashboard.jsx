import {useEffect, useState} from 'react'; import {partners, orders, products} from '../../services/api'; import {Link} from 'react-router-dom'
export default function PartnerDashboard(){
  const [profile,setProfile]=useState(null); const [myOrders,setMyOrders]=useState([]); const [myProducts,setMyProducts]=useState([]); const [msg,setMsg]=useState('')
  const load=async()=>{
    try{
      const p=await partners.me(); setProfile(p.data)
      const pid=p.data.id
      const o=await orders.partnerMy(); const arr=o.data.content||o.data; setMyOrders(Array.isArray(arr)?arr:[])
      const pr=await products.list({partnerId: pid}); const d=pr.data; setMyProducts(Array.isArray(d)?d:(d.content||[]))
    }catch(e){ 
      try{ const o=await orders.partnerMy(); setMyOrders(o.data.content||o.data||[]) }catch{}
      try{ const pr=await products.list({}); setMyProducts((pr.data.content||pr.data||[]).slice(0,6)) }catch{}
    }
  }
  useEffect(()=>{ load() },[])
  const totalRevenue=myOrders.filter(o=>o.status==='PAYE').reduce((a,b)=>a+(b.netToPartner||0),0)
  const totalCommission=myOrders.filter(o=>o.status==='PAYE').reduce((a,b)=>a+(b.commission||0),0)
  const pending=myOrders.filter(o=>o.status==='PENDING_PAYMENT' || o.status==='ECHEC_PAIEMENT').length
  const incStock=async(id,delta)=>{
    await fetch((import.meta.env.VITE_API_URL||'')+'/api/v1/partner/products/'+id+'/stock',{method:'PATCH',headers:{'Content-Type':'application/json', Authorization:'Bearer '+localStorage.getItem('payafrica_token')},body:JSON.stringify({add:delta})});
    setMsg(`Stock +${delta} ✅`); load()
  }
  return <div className="max-w-6xl mx-auto space-y-6">
    <div className="flex justify-between items-center"><h1 className="text-2xl font-extrabold">Tableau de bord Fournisseur</h1><Link to="/partner/catalog" className="bg-emerald-500 text-white px-5 py-2.5 rounded-full font-bold">Gérer le catalogue →</Link></div>
    {msg && <div className="bg-emerald-50 border px-4 py-2 rounded-xl text-sm">{msg}</div>}
    {profile && <div className={`p-4 rounded-2xl border-2 ${profile.isValidated?'bg-emerald-50 border-emerald-300':'bg-amber-50 border-amber-300'}`}>
      <div className="font-bold">{profile.shopName} — {profile.city} {profile.isValidated?'✅ Validée':'⏳ En attente de validation admin'}</div>
      <div className="text-sm text-slate-600">{profile.address} • {profile.phoneContact} • GPS {profile.gpsLat},{profile.gpsLng}</div>
      {!profile.isValidated && <div className="text-xs mt-2 text-amber-700">Votre boutique n'apparaîtra pas aux clients tant que l'admin ne l'a pas validée. Commission 1.5% prélevée à chaque vente (ex: 10 000 → 9 850 pour vous).</div>}
    </div>}
    <div className="grid sm:grid-cols-4 gap-4">
      <div className="bg-emerald-500 text-white rounded-2xl p-4"><div className="text-xs font-bold opacity-80">REVENUS NETS</div><div className="text-2xl font-extrabold">{totalRevenue.toLocaleString()} XAF</div><div className="text-xs opacity-80">Après commission</div></div>
      <div className="bg-slate-900 text-white rounded-2xl p-4"><div className="text-xs font-bold opacity-60">COMMISSION PAYÉE</div><div className="text-xl font-extrabold">{totalCommission.toLocaleString()} XAF</div><div className="text-xs opacity-60">1.5% à l'admin</div></div>
      <div className="bg-white border rounded-2xl p-4"><div className="text-xs font-bold text-slate-500">COMMANDES PAYÉES</div><div className="text-2xl font-extrabold">{myOrders.filter(o=>o.status==='PAYE').length} / {myOrders.length}</div><div className="text-xs text-amber-600">{pending} en attente/échouées</div></div>
      <div className="bg-white border rounded-2xl p-4"><div className="text-xs font-bold text-slate-500">PRODUITS</div><div className="text-2xl font-extrabold">{myProducts.length}</div><Link to="/partner/catalog" className="text-xs text-emerald-600 font-bold">Gérer stock →</Link></div>
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border p-4">
        <div className="flex justify-between"><h3 className="font-bold">Produits achetés — Dernières commandes</h3><Link to="/partner/orders" className="text-sm text-emerald-600 font-semibold">Tout voir →</Link></div>
        <div className="mt-3 space-y-2 max-h-[420px] overflow-auto">
          {myOrders.slice(0,8).map(o=> <div key={o.id} className="border rounded-xl p-3">
            <div className="flex justify-between"><span className="font-mono text-xs font-bold">{o.reference}</span><span className={`text-xs px-2 py-1 rounded-full font-bold ${o.status==='PAYE'?'bg-emerald-50 text-emerald-700':o.status==='PENDING_PAYMENT'?'bg-amber-50 text-amber-700':'bg-red-50 text-red-700'}`}>{o.status}</span></div>
            <div className="text-sm font-semibold mt-1">{o.clientName} • {Number(o.total).toLocaleString()} {o.currency} {o.voucherCode && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">bon {o.voucherCode}</span>}</div>
            <div className="text-xs text-slate-500 mt-1">{o.items?.map(i=> `${i.productName} x${i.quantity}`).join(', ')}</div>
            <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleString()} • Net {Number(o.netToPartner).toLocaleString()} / Com {Number(o.commission).toLocaleString()}</div>
          </div>)}
          {myOrders.length===0 && <div className="text-sm text-slate-400 py-6 text-center">Aucune commande — vos ventes apparaîtront ici</div>}
        </div>
      </div>
      <div className="bg-white rounded-2xl border p-4">
        <h3 className="font-bold">Mes articles — Stock</h3><p className="text-xs text-slate-500">Augmentez le stock de vos articles déjà intégrés</p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 max-h-[420px] overflow-auto">
          {myProducts.map(p=> <div key={p.id} className="border rounded-xl overflow-hidden">
            <img src={p.imageUrl||'https://via.placeholder.com/300'} className="w-full h-24 object-cover"/>
            <div className="p-2"><div className="font-bold text-sm truncate">{p.name}</div><div className="text-xs text-slate-500">{p.categoryName} • {Number(p.price).toLocaleString()} XAF</div><div className="text-xs font-bold mt-1">Stock {p.stock} {p.isActive?'●':''}</div>
              <div className="flex gap-1 mt-2"><button onClick={()=>incStock(p.id,10)} className="flex-1 bg-slate-100 py-1 rounded-lg text-xs font-bold">+10</button><button onClick={()=>incStock(p.id,50)} className="flex-1 bg-slate-900 text-white py-1 rounded-lg text-xs">+50</button><button onClick={()=>incStock(p.id,100)} className="flex-1 bg-emerald-500 text-white py-1 rounded-lg text-xs">+100</button></div>
            </div>
          </div>)}
          {myProducts.length===0 && <div className="col-span-2 text-center text-sm text-slate-400 py-6">Aucun article — <Link to="/partner/catalog" className="text-emerald-600 font-bold">Créez-en</Link></div>}
        </div>
      </div>
    </div>
  </div>
}
