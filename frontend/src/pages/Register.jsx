import {useState, useEffect} from 'react'; import {Link, useNavigate} from 'react-router-dom'; import {auth, terms} from '../services/api'
export default function Register(){
  const [form,setForm]=useState({fullName:'',phone:'',pin:'',country:'CM',role:'CLIENT',shopName:'',address:'',city:'Yaoundé',termsAccepted:false})
  const [cgu,setCgu]=useState(null); const [err,setErr]=useState(''); const [loading,setLoading]=useState(false); const nav=useNavigate()
  useEffect(()=>{terms.current().then(r=>setCgu(r.data)).catch(()=>{})},[])
  const submit=async e=>{
    e.preventDefault(); setLoading(true); setErr('')
    if(!form.termsAccepted){ setErr('Vous devez accepter les CGU et la politique de confidentialité'); setLoading(false); return}
    try{
      const r=await auth.register(form)
      localStorage.setItem('payafrica_token', r.data.token)
      localStorage.setItem('payafrica_user', JSON.stringify(r.data))
      const role=r.data.role
      if(role==='PARTNER') nav('/partner'); else nav('/')
    }catch(e){ setErr(e.response?.data?.error||e.message)} finally{setLoading(false)}
  }
  return <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
    <form onSubmit={submit} className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl border">
      <h1 className="text-2xl font-extrabold">Créer un compte</h1>
      <p className="text-sm text-slate-500">Choisissez votre rôle : Client ou Entreprise Partenaire</p>
      {err && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{err}</div>}
      <div className="mt-6 space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button type="button" onClick={()=>setForm({...form, role:'CLIENT'})} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${form.role==='CLIENT'?'bg-white shadow':'text-slate-500'}`}>🛒 Client</button>
          <button type="button" onClick={()=>setForm({...form, role:'PARTNER'})} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${form.role==='PARTNER'?'bg-white shadow':'text-slate-500'}`}>🏪 Partenaire</button>
        </div>
        <input placeholder="Nom complet" value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} className="w-full border rounded-xl px-4 py-3" required/>
        <div className="flex gap-2">
          <select value={form.country} onChange={e=>setForm({...form, country:e.target.value})} className="border rounded-xl px-3 py-3 font-bold bg-slate-50"><option value="CM">🇨🇲 CM</option><option value="TD">🇹🇩 TD</option><option value="NG">🇳🇬 NG</option></select>
          <input placeholder="6XXXXXXXX" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="flex-1 border rounded-xl px-4 py-3" required/>
        </div>
        <input placeholder="PIN 4 chiffres" value={form.pin} onChange={e=>setForm({...form, pin:e.target.value})} maxLength={4} type="password" className="w-full border rounded-xl px-4 py-3" required/>
        {form.role==='PARTNER' && <>
          <input placeholder="Nom de la boutique *" value={form.shopName} onChange={e=>setForm({...form, shopName:e.target.value})} className="w-full border rounded-xl px-4 py-3" required/>
          <input placeholder="Adresse (ex: Bastos, Yaoundé)" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} className="w-full border rounded-xl px-4 py-3"/>
          <input placeholder="Ville" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} className="w-full border rounded-xl px-4 py-3"/>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">ℹ️ Votre boutique sera <b>en attente de validation</b> par l'admin avant d'apparaître. Commission 1.5% prélevée automatiquement.</div>
        </>}
        <label className="flex gap-3 items-start bg-slate-50 border rounded-xl p-3">
          <input type="checkbox" checked={form.termsAccepted} onChange={e=>setForm({...form, termsAccepted:e.target.checked})} className="mt-1"/>
          <span className="text-xs leading-relaxed">J'ai lu et j'accepte les <Link to="/terms" target="_blank" className="text-emerald-600 font-bold underline">CGU</Link> et la <Link to="/terms" target="_blank" className="text-emerald-600 font-bold underline">politique de confidentialité</Link> de PayAfrica Marketplace. J'accepte la commission de 1.5% (si partenaire) et le traitement de mes données.</span>
        </label>
        {cgu && <div className="text-xs text-slate-400">Version CGU : {cgu.version} • Commission actuelle : {cgu.commissionPercent}%</div>}
        <button disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl">{loading?'Création...':'Créer mon compte →'}</button>
        <p className="text-center text-sm">Déjà inscrit ? <Link to="/login" className="text-emerald-600 font-semibold">Se connecter</Link></p>
      </div>
    </form>
  </div>
}
