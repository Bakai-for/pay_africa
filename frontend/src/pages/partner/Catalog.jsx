import {useEffect, useState} from 'react'; import {products, admin} from '../../services/api'
export default function Catalog(){
  const [list,setList]=useState([]); const [cats,setCats]=useState([]); const [catName,setCatName]=useState(''); const [form,setForm]=useState({name:'',description:'',price:'',stock:100,imageUrl:'',categoryId:''}); const [msg,setMsg]=useState(''); const [editStock,setEditStock]=useState({})
  const load=async()=>{
    try{
      const token=localStorage.getItem('payafrica_token')
      const me=await fetch((import.meta.env.VITE_API_URL||'')+'/api/v1/partner/profile',{headers:{Authorization:'Bearer '+token}}).then(r=>r.json())
      if(me.id){
        const pr=await products.list({partnerId: me.id}); const dd=pr.data; const arr=Array.isArray(dd)?dd:(dd.content||[]); setList(arr)
        try{ const cr=await fetch((import.meta.env.VITE_API_URL||'')+'/api/v1/partners/'+me.id+'/categories').then(r=>r.json()); if(Array.isArray(cr)) setCats(cr) }catch{}
        // fallback: si pas de catégories, charge globales
        if(!arr.length){ try{ const c=await products.categories(); setCats(c.data.slice(0,20)) }catch{} }
      }
    }catch(e){ try{ const r=await products.list({}); const d=r.data; setList(Array.isArray(d)?d:(d.content||[])); const c=await products.categories(); setCats(c.data.slice(0,20)) }catch{} }
  }
  useEffect(()=>{ load() },[])
  const createCat=async()=>{
    if(!catName) return
    await products.createCategory({name: catName}); setCatName(''); load(); setMsg('Catégorie créée ✅')
  }
  const createProd=async e=>{
    e.preventDefault()
    try{
      await products.create({name: form.name, description: form.description, price: parseFloat(form.price), stock: parseInt(form.stock), imageUrl: form.imageUrl, categoryId: form.categoryId||null, currency:'XAF'})
      setMsg('Article ajouté ⏳ En attente de validation par l\'admin — il n\'apparaîtra aux clients qu\'une fois approuvé'); setForm({name:'',description:'',price:'',stock:100,imageUrl:'',categoryId:''}); load()
    }catch(e){ setMsg(e.response?.data?.error||e.message)}
  }
  const incStock=async(id,delta)=>{
    try{ await fetch((import.meta.env.VITE_API_URL||'')+'/api/v1/partner/products/'+id+'/stock',{method:'PATCH',headers:{'Content-Type':'application/json', Authorization:'Bearer '+localStorage.getItem('payafrica_token')},body:JSON.stringify({add:delta})}); load(); setMsg(`Stock +${delta} ✅`)}
    catch(e){ setMsg(e.message)}
  }
  const setStock=async(id)=>{
    const v=editStock[id]; if(!v) return;
    try{ await fetch((import.meta.env.VITE_API_URL||'')+'/api/v1/partner/products/'+id+'/stock',{method:'PATCH',headers:{'Content-Type':'application/json', Authorization:'Bearer '+localStorage.getItem('payafrica_token')},body:JSON.stringify({stock:parseInt(v)})}); load(); setMsg('Stock mis à jour ✅')}
    catch(e){ setMsg(e.message)}
  }
  const remove=async(id)=>{ if(!confirm('Désactiver cet article ?')) return; await products.remove(id); load(); setMsg('Article désactivé')}
  return <div className="max-w-5xl mx-auto space-y-6">
    <h1 className="text-2xl font-extrabold">Catalogue — Mes articles</h1>
    <p className="text-sm text-slate-500">Créez vos catégories (types) et articles avec prix/stock/image. Vous verrez aussi vos commandes et statistiques sur le tableau de bord.</p>
    {msg && <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-sm">{msg}</div>}
    <div className="bg-white rounded-3xl border p-6">
      <h3 className="font-bold">Types / Catégories (ex: Alimentation, Téléphonie, Épices...)</h3>
      <div className="flex gap-2 mt-3">
        <input value={catName} onChange={e=>setCatName(e.target.value)} placeholder="Nouveau type: ex: Électroménager" className="flex-1 border rounded-xl px-4 py-3"/>
        <button onClick={createCat} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">Ajouter</button>
      </div>
      <div className="flex gap-2 mt-3 flex-wrap">{cats.map(c=> <span key={c.id} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold">{c.name}</span>)} {cats.length===0 && <span className="text-xs text-slate-400">Aucune catégorie — créez-en une</span>}</div>
    </div>
    <form onSubmit={createProd} className="bg-white rounded-3xl border p-6 space-y-3">
      <h3 className="font-bold">Ajouter un article</h3>
      <input placeholder="Nom de l'article * (ex: Tecno Spark 20)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border rounded-xl px-4 py-3" required/>
      <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="w-full border rounded-xl px-4 py-3"/>
      <div className="flex gap-3 flex-wrap">
        <input placeholder="Prix XAF * " type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="flex-1 min-w-[140px] border rounded-xl px-4 py-3" required/>
        <input placeholder="Stock" type="number" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="w-32 border rounded-xl px-4 py-3"/>
        <select value={form.categoryId} onChange={e=>setForm({...form, categoryId:e.target.value})} className="flex-1 min-w-[160px] border rounded-xl px-4 py-3"><option value="">Catégorie</option>{cats.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      </div>
      <input placeholder="URL image (https://...)" value={form.imageUrl} onChange={e=>setForm({...form, imageUrl:e.target.value})} className="w-full border rounded-xl px-4 py-3"/>
      <button className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl">Ajouter l'article</button>
      <p className="text-xs text-slate-400">Après ajout, l'admin voit votre publication — elle sera visible aux clients si votre boutique est validée.</p>
    </form>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map(p=> <div key={p.id} className="bg-white rounded-2xl border overflow-hidden">
        <img src={p.imageUrl||'https://via.placeholder.com/400'} className="w-full h-36 object-cover"/>
        <div className="p-4">
          <div className="font-bold text-sm truncate">{p.name}</div><div className="text-xs text-slate-500">{p.categoryName||'Sans catégorie'} {p.categoryName==='PC' && <span className="bg-amber-100 text-amber-700 px-1 py-0.5 rounded-full text-xs">PC fixe 500</span>}</div>
          <div className="font-extrabold mt-1">{Number(p.price).toLocaleString()} XAF • Stock {p.stock} <span className="text-xs font-normal">({p.isActive?'Actif':'Désactivé'})</span></div>
          <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block font-bold ${p.isValidated?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{p.isValidated?'✅ Approuvé (visible clients)':'⏳ En attente de validation admin'}</div>
          <div className="flex gap-1 mt-2">
            <button onClick={()=>incStock(p.id,10)} className="flex-1 bg-slate-100 py-1.5 rounded-lg text-xs font-bold">+10</button>
            <button onClick={()=>incStock(p.id,50)} className="flex-1 bg-slate-900 text-white py-1.5 rounded-lg text-xs font-bold">+50</button>
            <button onClick={()=>incStock(p.id,100)} className="flex-1 bg-emerald-500 text-white py-1.5 rounded-lg text-xs font-bold">+100</button>
          </div>
          <div className="flex gap-1 mt-1">
            <input placeholder="Stock exact" type="number" value={editStock[p.id]||''} onChange={e=>setEditStock({...editStock,[p.id]:e.target.value})} className="flex-1 border rounded-lg px-2 py-1 text-xs"/>
            <button onClick={()=>setStock(p.id)} className="px-3 bg-white border py-1 rounded-lg text-xs font-bold">Set</button>
            <button onClick={()=>remove(p.id)} className="px-3 bg-red-50 text-red-700 py-1 rounded-lg text-xs font-bold">Désactiver</button>
          </div>
        </div>
      </div>)}
      {list.length===0 && <div className="col-span-3 text-center py-8 text-slate-400">Aucun article — ajoutez-en un ci-dessus</div>}
    </div>
  </div>
}
