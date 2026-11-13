import {useEffect, useState} from 'react'; import {admin} from '../../services/api'
export default function AdminProducts(){
  const [list,setList]=useState([]); const [filter,setFilter]=useState(true); const [msg,setMsg]=useState('')
  const load=()=> admin.products(filter).then(r=> setList(r.data)).catch(e=>setMsg(e.message))
  useEffect(()=>{ load() },[filter])
  const validate=async(p, v)=>{
    await admin.validateProduct(p.id, v); setMsg(v? 'Article "'+p.name+'" approuvé ✅ — visible aux clients' : 'Article retiré'); load()
  }
  const remove=async(p)=>{
    if(!confirm('Supprimer définitivement "'+p.name+'" ?')) return;
    await admin.deleteProduct(p.id); setMsg('Publication supprimée'); load()
  }
  return <div className="max-w-6xl mx-auto space-y-4">
    <div className="flex justify-between items-center"><h1 className="text-2xl font-extrabold">Articles — Validation par l'admin</h1><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filter} onChange={e=>setFilter(e.target.checked)}/> En attente seulement</label></div>
    {msg && <div className="bg-emerald-50 border px-4 py-3 rounded-xl text-sm">{msg}</div>}
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">ℹ️ Tout article ajouté par un partenaire est <b>en attente</b> (isValidated=false) et <b>n'apparaît pas</b> aux clients tant que vous ne l'avez pas <b>approuvé</b>. Dès que vous approuvez, il passe en <b>Approuvé</b> et devient achetable. Le type <b>PC</b> a une commission fixe 500 XAF (autres: 1.5%).</div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map(p=> <div key={p.id} className="bg-white rounded-2xl border overflow-hidden">
        <img src={p.imageUrl||'https://via.placeholder.com/400'} className="w-full h-36 object-cover"/>
        <div className="p-3">
          <div className="font-bold text-sm truncate">{p.name}</div>
          <div className="text-xs text-slate-500">{p.partner?.shopName||'Boutique '+p.partnerId} • {p.categoryName||'Sans catégorie'} {p.categoryName==='PC' && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">PC fixe 500</span>}</div>
          <div className="text-sm font-extrabold mt-1">{Number(p.price).toLocaleString()} {p.currency} • Stock {p.stock}</div>
          <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block font-bold ${p.isValidated?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{p.isValidated?'✅ Approuvé':'⏳ En attente'}</div>
          <div className="flex gap-1 mt-2">
            {!p.isValidated && <button onClick={()=>validate(p,true)} className="flex-1 bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold">Approuver</button>}
            {p.isValidated && <button onClick={()=>validate(p,false)} className="flex-1 bg-amber-100 text-amber-700 py-2 rounded-xl text-xs font-bold">Retirer approbation</button>}
            <button onClick={()=>remove(p)} className="px-4 bg-red-50 text-red-700 py-2 rounded-xl text-xs font-bold">Supprimer</button>
          </div>
        </div>
      </div>)}
      {list.length===0 && <div className="col-span-3 text-center py-12 text-slate-400">Aucun article {filter && 'en attente'} — tous sont approuvés ✅</div>}
    </div>
  </div>
}
