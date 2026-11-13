import {useState, useEffect} from 'react'; import {useNavigate} from 'react-router-dom'; import {orders} from '../../services/api'
export default function Cart(){
  const [cart,setCart]=useState([]); const [voucher,setVoucher]=useState(''); const [discount,setDiscount]=useState(null); const [operator,setOperator]=useState('mtn_cm'); const [phone,setPhone]=useState('237699999999'); const [address,setAddress]=useState('Bastos, Yaoundé'); const [msg,setMsg]=useState(''); const [loading,setLoading]=useState(false); const nav=useNavigate()
  useEffect(()=>{ setCart(JSON.parse(localStorage.getItem('cart')||'[]')) },[])
  const updateQty=(idx, d)=>{ const c=[...cart]; c[idx].qty=Math.max(1, c[idx].qty+d); setCart(c); localStorage.setItem('cart', JSON.stringify(c)) }
  const remove=(idx)=>{ const c=cart.filter((_,i)=>i!==idx); setCart(c); localStorage.setItem('cart', JSON.stringify(c))}
  const subtotal=cart.reduce((a,b)=>a+b.price*b.qty,0)
  const checkVoucher=async()=>{
    if(!voucher) return
    try{ const r=await orders.applyVoucher(voucher); setDiscount(r.data); setMsg('✓ Bon '+r.data.code+' : -'+r.data.discountPercent+'%')}catch(e){ setMsg('✗ '+(e.response?.data?.error||e.message)); setDiscount(null)}
  }
  const discountAmount=discount? Math.round(subtotal*discount.discountPercent/100):0
  const total=subtotal-discountAmount
  const place=async()=>{
    if(cart.length===0) return
    if(new Set(cart.map(c=>c.partnerShopName)).size>1){ setMsg('✗ Panier multi-boutique non autorisé en V2 : commandez par boutique'); return}
    setLoading(true); setMsg('Traitement paiement Mobile Money...')
    try{
      const payload={items: cart.map(c=>({productId:c.id, quantity:c.qty})), operator, clientPhone:phone, voucherCode: voucher||null, deliveryAddress:address}
      const r=await orders.place(payload)
      const o=r.data
      if(o.status==='PAYE'){
        setMsg('✅ Commande '+o.reference+' PAYÉE ! Commission 1.5% = '+o.commission+' '+o.currency+' • Net boutique '+o.netToPartner+' • Bon généré si palier atteint')
        localStorage.removeItem('cart'); setTimeout(()=>nav('/my-orders'),1200)
      } else if(o.status==='PENDING_PAYMENT'){
        setMsg('⏳ Commande '+o.reference+' en attente (PAYMENT PENDING) — base conservée. Si opérateur inconnu ou DB bloquée, réessayez dans Mes commandes → Réessayer. (test 9997 = DB bloquée)')
        localStorage.removeItem('cart'); setTimeout(()=>nav('/my-orders'),1500)
      } else {
        setMsg('Statut: '+o.status+' — '+ (o.reference||''))
      }
    }catch(e){ 
      const err=e.response?.data
      if(err?.error?.includes('H2')|| err?.error?.includes('DB')|| err?.error?.includes('503')){
        setMsg('⚠️ Base de données temporairement bloquée — commande NON perdue, elle est en PENDING_PAYMENT. Réessayez : Mes commandes → Réessayer le paiement (test: fin 9997 simule ceci)')
      } else {
        setMsg('✗ '+(err?.error||err?.message||e.message)+(e.response?.status===402?' — Vérifiez solde Mobile Money':'')) 
      }
    }finally{ setLoading(false)}
  }
  if(cart.length===0) return <div className="max-w-2xl mx-auto text-center py-12"><div className="text-4xl">🛒</div><p className="mt-2 text-slate-500">Votre panier est vide</p><button onClick={()=>nav('/')} className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-full font-bold">Parcourir la boutique</button></div>
  return <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-3">
      <h1 className="text-2xl font-extrabold">Panier ({cart.length}) — {cart[0]?.partnerShopName}</h1>
      <div className="text-xs bg-amber-50 border border-amber-200 rounded-xl p-3">ℹ️ Paiement non payé ? La commande reste en <b>PENDING_PAYMENT</b> en base (Docker Postgres persistant). Elle n'est pas perdue, réessayez via <b>Mes commandes → Réessayer</b>. Si DB bloquée, l'ordre est conservé et rejouable. Test: téléphone finissant <b>9998</b> = échec, <b>9997</b> = DB bloquée simulée.</div>
      {cart.map((c,idx)=> <div key={c.id} className="bg-white rounded-2xl border p-4 flex gap-4">
        <img src={c.imageUrl} className="w-20 h-20 rounded-xl object-cover"/>
        <div className="flex-1">
          <div className="font-bold text-sm">{c.name}</div><div className="text-xs text-slate-500">{c.partnerShopName} • {c.categoryName||''}</div>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={()=>updateQty(idx,-1)} className="w-8 h-8 rounded-full border font-bold">-</button><span className="font-bold">{c.qty}</span><button onClick={()=>updateQty(idx,1)} className="w-8 h-8 rounded-full border font-bold">+</button>
            <span className="ml-auto font-extrabold">{Number(c.price*c.qty).toLocaleString()} {c.currency}</span>
          </div>
        </div>
        <button onClick={()=>remove(idx)} className="text-slate-400"><i className="fa-solid fa-trash"></i></button>
      </div>)}
    </div>
    <div className="bg-white rounded-3xl border p-6 h-fit sticky top-6">
      <h3 className="font-bold">Résumé — Gestion paiement</h3>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span>Sous-total</span><span className="font-bold">{subtotal.toLocaleString()} XAF</span></div>
        {discount && <div className="flex justify-between text-emerald-600"><span>Bon {discount.code} (-{discount.discountPercent}%)</span><span>-{discountAmount.toLocaleString()}</span></div>}
        <div className="flex justify-between text-lg font-extrabold pt-2 border-t"><span>Total à payer</span><span>{total.toLocaleString()} XAF</span></div>
        <div className="text-xs bg-slate-50 rounded-lg p-2">Vous recevez une facture après paiement. Avec Docker Postgres, la commande reste même si DB bloquée (réessayable).</div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex gap-2"><input value={voucher} onChange={e=>setVoucher(e.target.value.toUpperCase())} placeholder="Code bon (ex: FIDELITE5-AB12)" className="flex-1 border rounded-xl px-3 py-2.5 text-sm"/><button onClick={checkVoucher} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold">Appliquer</button></div>
        <select value={operator} onChange={e=>setOperator(e.target.value)} className="w-full border rounded-xl px-4 py-3"><option value="mtn_cm">MTN MoMo CM</option><option value="orange_cm">Orange Money CM</option><option value="airtel_td">Airtel TD</option><option value="moov_td">Moov TD</option><option value="mtn_ng">MTN NG</option><option value="unknown">Opérateur inconnu (test PENDING)</option></select>
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Numéro Mobile Money à débiter" className="w-full border rounded-xl px-4 py-3"/>
        <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Adresse de livraison" className="w-full border rounded-xl px-4 py-3"/>
        <p className="text-xs text-slate-400">Tests: 9998 = échec paiement • 9997 = DB bloquée (PENDING conservé) • inconnu = PENDING</p>
        <button onClick={place} disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl">{loading?'Paiement...':'Payer '+total.toLocaleString()+' XAF →'}</button>
        {msg && <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-sm whitespace-pre-wrap">{msg}</div>}
      </div>
    </div>
  </div>
}
