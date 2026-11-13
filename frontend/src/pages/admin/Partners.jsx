import {useEffect, useState} from 'react'; import {admin, products} from '../../services/api'
export default function AdminPartners(){
  const [list,setList]=useState([]); const [filter,setFilter]=useState(false); const [msg,setMsg]=useState(''); const [expanded,setExpanded]=useState(null)
  const [catForms,setCatForms]=useState({}); const [prodForms,setProdForms]=useState({}); const [partnerProducts,setPartnerProducts]=useState({})
  const load=()=> admin.partners(filter).then(r=>setList(r.data)).catch(e=>setMsg(e.response?.data?.error||e.message))
  useEffect(()=>{ load() },[filter])
  const toggle=async(p)=>{ await admin.validatePartner(p.id, !p.isValidated); load(); setMsg(p.isValidated? 'Partenaire suspendu — retour en En attente':'Partenaire approuvé ✅ — retiré de la liste d\'attente')}
  const remove=async(p)=>{ if(!confirm('Retirer '+p.shopName+' ? Ses produits seront supprimés.')) return; await admin.deletePartner(p.id); setMsg('Fournisseur retiré'); load()}
  const loadProducts=async(pid)=>{
    try{ const r=await products.list({partnerId: pid}); const d=r.data; const arr=Array.isArray(d)?d:(d.content||[]); setPartnerProducts(prev=>({...prev,[pid]:arr})) }catch{}
  }
  const toggleExpand=async(pid)=>{
    if(expanded===pid) setExpanded(null)
    else { setExpanded(pid); loadProducts(pid); }
  }
  const addCat=async(pid)=>{
    const name=catForms[pid]; if(!name) return; await admin.addCategoryToPartner(pid,{name}); setCatForms({...catForms,[pid]:''}); setMsg('Catégorie ajoutée'); loadProducts(pid)
  }
  const addProd=async(pid)=>{
    const f=prodForms[pid]; if(!f?.name || !f?.price) {setMsg('Nom et prix requis'); return}
    await admin.addProductToPartner(pid,{name:f.name,description:f.description,price:parseFloat(f.price),stock:parseInt(f.stock||100),imageUrl:f.imageUrl,categoryId:f.categoryId||null,currency:'XAF'});
    setProdForms({...prodForms,[pid]:{name:'',price:'',stock:100,imageUrl:'',description:'',categoryId:''}}); setMsg('Article ajouté à la boutique'); loadProducts(pid)
  }
  const delProd=async(pid,prodId)=>{ if(!confirm('Retirer cette publication ?')) return; await admin.deleteProduct(prodId); setMsg('Publication retirée'); loadProducts(pid)}
  const incStock=async(pid,prodId,delta)=>{ await admin.updateStock(prodId,delta); loadProducts(pid)}
  return <div className="max-w-6xl mx-auto space-y-4">
    <div className="flex justify-between items-center"><h1 className="text-2xl font-extrabold">Partenaires — Administration</h1><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filter} onChange={e=>setFilter(e.target.checked)}/> En attente seulement</label></div>
    {msg && <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-sm">{msg}</div>}
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">ℹ️ Vous pouvez <b>valider/suspendre</b>, <b>retirer un fournisseur</b>, <b>retirer une publication</b>, et <b>ajouter des catégories / articles</b> directement dans sa boutique (même si le fournisseur n'a pas encore créé de catégorie).</div>
    <div className="space-y-3">
      {list.map(p=> <div key={p.id} className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 flex justify-between items-start">
          <div><div className="font-bold">{p.shopName} — {p.city} <span className="text-xs font-mono text-slate-400">#{p.id}</span></div><div className="text-sm text-slate-500">{p.address} • {p.phoneContact} • User {p.user?.phone}</div><div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block font-bold ${p.isValidated?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{p.isValidated?'✅ Approuvé':'⏳ En attente'}</div></div>
          <div className="flex gap-2">
            <button onClick={()=>toggle(p)} className={`px-4 py-2 rounded-full font-bold text-sm ${p.isValidated?'bg-red-50 text-red-700':'bg-emerald-500 text-white'}`}>{p.isValidated?'Suspendre':'Approuver'}</button>
            <button onClick={()=>remove(p)} className="px-4 py-2 rounded-full font-bold text-sm bg-slate-900 text-white">Retirer</button>
            <button onClick={()=>toggleExpand(p.id)} className="px-4 py-2 rounded-full font-bold text-sm bg-slate-100">{expanded===p.id?'Fermer':'Gérer catalogue →'}</button>
          </div>
        </div>
        {expanded===p.id && <div className="border-t bg-slate-50 p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <h4 className="font-bold text-sm">Ajouter une catégorie / type d'article</h4>
              <div className="flex gap-2 mt-2"><input value={catForms[p.id]||''} onChange={e=>setCatForms({...catForms,[p.id]:e.target.value})} placeholder="Ex: Téléphonie, Épices..." className="flex-1 border rounded-xl px-3 py-2 text-sm"/><button onClick={()=>addCat(p.id)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold">Ajouter</button></div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <h4 className="font-bold text-sm">Ajouter un article à sa boutique</h4>
              <div className="space-y-2 mt-2">
                <input placeholder="Nom * " value={prodForms[p.id]?.name||''} onChange={e=>setProdForms({...prodForms,[p.id]:{...prodForms[p.id],name:e.target.value}})} className="w-full border rounded-xl px-3 py-2 text-sm"/>
                <div className="flex gap-2"><input placeholder="Prix XAF *" type="number" value={prodForms[p.id]?.price||''} onChange={e=>setProdForms({...prodForms,[p.id]:{...prodForms[p.id],price:e.target.value}})} className="flex-1 border rounded-xl px-3 py-2 text-sm"/><input placeholder="Stock" type="number" value={prodForms[p.id]?.stock||''} onChange={e=>setProdForms({...prodForms,[p.id]:{...prodForms[p.id],stock:e.target.value}})} className="w-24 border rounded-xl px-3 py-2 text-sm"/></div>
                <input placeholder="URL image" value={prodForms[p.id]?.imageUrl||''} onChange={e=>setProdForms({...prodForms,[p.id]:{...prodForms[p.id],imageUrl:e.target.value}})} className="w-full border rounded-xl px-3 py-2 text-sm"/>
                <button onClick={()=>addProd(p.id)} className="w-full bg-emerald-500 text-white py-2 rounded-xl text-sm font-bold">Ajouter à {p.shopName}</button>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(partnerProducts[p.id]||[]).map(pr=> <div key={pr.id} className="bg-white rounded-xl border overflow-hidden text-sm">
              <img src={pr.imageUrl||'https://via.placeholder.com/300'} className="w-full h-28 object-cover"/>
              <div className="p-3"><div className="font-bold truncate">{pr.name}</div><div className="text-xs text-slate-500">{pr.categoryName||'Sans catégorie'} • {Number(pr.price).toLocaleString()} XAF</div><div className="text-xs mt-1">Stock {pr.stock} • {pr.isActive?'Actif':'Off'}</div>
                <div className="flex gap-1 mt-2"><button onClick={()=>incStock(p.id,pr.id,10)} className="flex-1 bg-slate-100 py-1 rounded-lg text-xs font-bold">+10</button><button onClick={()=>incStock(p.id,pr.id,50)} className="flex-1 bg-slate-900 text-white py-1 rounded-lg text-xs">+50</button><button onClick={()=>delProd(p.id,pr.id)} className="px-3 bg-red-50 text-red-700 py-1 rounded-lg text-xs font-bold">Retirer</button></div>
              </div>
            </div>)}
            {(partnerProducts[p.id]||[]).length===0 && <div className="col-span-3 text-center py-6 text-slate-400 text-sm">Aucun article — ajoutez-en ci-dessus</div>}
          </div>
        </div>}
      </div>)}
      {list.length===0 && <div className="text-center py-8 text-slate-400">Aucun partenaire</div>}
    </div>
  </div>
}
