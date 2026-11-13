import {useEffect, useState} from 'react'; import {products, partners, orders} from '../../services/api'; import {useNavigate} from 'react-router-dom'
export default function Shop(){
  const [list,setList]=useState([]); const [cats,setCats]=useState([]); const [q,setQ]=useState(''); const [partnerId,setPartnerId]=useState(''); const [shops,setShops]=useState([]); const [msg,setMsg]=useState(''); const [direct,setDirect]=useState(null)
  const nav=useNavigate()
  const load=async()=>{
    const r=await products.list({q: q||undefined, partnerId: partnerId||undefined})
    const data=r.data.content || r.data
    setList(Array.isArray(data)? data: [])
  }
  useEffect(()=>{ load(); partners.all().then(r=>setShops(r.data)).catch(()=>{}); },[])
  useEffect(()=>{ if(partnerId) products.categories(partnerId).then(r=>setCats(r.data)).catch(()=>setCats([])); else setCats([])},[partnerId])
  const addToCart=(p)=>{
    const cart=JSON.parse(localStorage.getItem('cart')||'[]')
    const ex=cart.find(c=>c.id===p.id)
    if(ex) ex.qty+=1; else cart.push({id:p.id, name:p.name, price:p.price, currency:p.currency, imageUrl:p.imageUrl, partnerShopName:p.partnerShopName, categoryName:p.categoryName, qty:1})
    localStorage.setItem('cart', JSON.stringify(cart))
    setMsg(p.name+' ajouté au panier 🛒')
    setTimeout(()=>setMsg(''),2000)
  }
  const payDirect=async(p)=>{
    const phone=prompt('Numéro Mobile Money à débiter (ex: 237699999999) — test 9998=échec, 9997=DB bloquée','237699999999')
    if(!phone) return
    const op=prompt('Opérateur: mtn_cm, orange_cm, airtel_td...','mtn_cm')
    if(!op) return
    try{
      const r=await orders.place({items:[{productId:p.id, quantity:1}], operator:op, clientPhone:phone, deliveryAddress:'Direct pay'})
      const o=r.data
      if(o.status==='PAYE') setMsg('✅ Facture '+o.reference+' PAYÉE — '+o.shopName+' • '+Number(o.total).toLocaleString()+' '+o.currency+' — voir Mes commandes pour l\'historique')
      else setMsg('⏳ Commande '+o.reference+' en attente: '+o.status+' — réessayez dans Mes commandes')
    }catch(e){ setMsg('✗ '+(e.response?.data?.error||e.message))}
  }
  return <div className="max-w-6xl mx-auto">
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <h1 className="text-2xl font-extrabold">Boutique — Tous les articles</h1>
      <button onClick={()=>nav('/cart')} className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold">🛒 Panier ({JSON.parse(localStorage.getItem('cart')||'[]').reduce((a,b)=>a+b.qty,0)}) →</button>
    </div>
    {msg && <div className="mt-4 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl text-sm">{msg}</div>}
    <div className="mt-4 flex flex-wrap gap-3">
      <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter' && load()} placeholder="Rechercher un article..." className="flex-1 min-w-[200px] border rounded-xl px-4 py-3"/>
      <select value={partnerId} onChange={e=>setPartnerId(e.target.value)} className="border rounded-xl px-4 py-3">
        <option value="">Toutes les boutiques</option>
        {shops.map(s=> <option key={s.id} value={s.id}>{s.shopName} — {s.city}</option>)}
      </select>
      <button onClick={load} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold">Filtrer</button>
    </div>
    {partnerId && cats.length>0 && <div className="mt-3 flex gap-2 flex-wrap">{cats.map(c=> <span key={c.id} className="px-3 py-1 bg-white border rounded-full text-xs font-semibold">{c.icon} {c.name} {c.name==='PC' && <span className="text-emerald-600">(commission fixe 500)</span>}</span>)}</div>}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {list.length===0 && <div className="col-span-3 text-center py-12 text-slate-400">Aucun article validé — les nouveaux articles du partenaire doivent être approuvés par l'admin avant d'apparaître ici.</div>}
      {list.map(p=> <div key={p.id} className="bg-white rounded-3xl border overflow-hidden hover:shadow-lg transition">
        <img src={p.imageUrl || 'https://via.placeholder.com/400'} className="w-full h-44 object-cover"/>
        <div className="p-4">
          <div className="text-xs text-emerald-600 font-bold">{p.partnerShopName} • {p.categoryName||'Général'} {p.categoryName==='PC' && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">PC • fixe 500</span>}</div>
          <div className="font-bold mt-1">{p.name}</div>
          <div className="text-xs text-slate-500 line-clamp-2">{p.description}</div>
          <div className="flex justify-between items-center mt-3">
            <div><span className="font-extrabold text-lg">{Number(p.price).toLocaleString()} {p.currency}</span><span className="text-xs text-slate-400"> • Stock {p.stock}</span></div>
            <div className="flex gap-1">
              <button onClick={()=>addToCart(p)} title="Ajouter au panier" className="bg-slate-100 w-10 h-10 rounded-full font-bold"><i className="fa-solid fa-cart-plus"></i></button>
              <button onClick={()=>payDirect(p)} title="Payer directement sans panier" className="bg-emerald-500 text-white px-3 py-2 rounded-full text-xs font-bold">⚡ Payer</button>
            </div>
          </div>
          {!p.isValidated && <div className="text-xs text-amber-600 mt-1">⏳ En attente de validation admin</div>}
        </div>
      </div>)}
    </div>
    <div className="mt-8 bg-slate-900 text-white rounded-3xl p-6">
      <h3 className="font-bold">Comment ça marche ?</h3>
      <ol className="mt-2 text-sm text-white/80 list-decimal list-inside space-y-1">
        <li>Parcourez les boutiques — seuls les articles <b>approuvés</b> par l'admin apparaissent</li>
        <li><b>Ajoutez au panier</b> ou <b>Payez directement ⚡</b> sans panier</li>
        <li>Payez en Mobile Money — vous recevez une <b>facture</b> avec référence (pas de détails commission)</li>
        <li>Consultez <b>Mes commandes / Historique</b> — l'admin voit l'historique groupé par acteur</li>
        <li>PC : commission fixe 500 XAF modifiable par l'admin, autres : 1.5%</li>
      </ol>
    </div>
  </div>
}
