import {useState} from 'react'; import {Link, useNavigate} from 'react-router-dom'; import {auth} from '../services/api'
export default function Login(){
  const [phone,setPhone]=useState('237690333444'); const [pin,setPin]=useState('1234'); const [err,setErr]=useState(''); const [loading,setLoading]=useState(false); const nav=useNavigate()
  const submit=async e=>{
    e.preventDefault(); setLoading(true); setErr('')
    try{
      const r=await auth.login({phone,pin})
      localStorage.setItem('payafrica_token', r.data.token)
      localStorage.setItem('payafrica_user', JSON.stringify(r.data))
      const role=r.data.role
      if(role==='ADMIN') nav('/admin'); else if(role==='PARTNER') nav('/partner'); else nav('/')
    }catch(e){ setErr(e.response?.data?.error||e.message)} finally{setLoading(false)}
  }
  return <div className="min-h-screen flex">
    <div className="flex-1 flex items-center justify-center p-6 bg-white">
      <form onSubmit={submit} className="w-full max-w-md">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-extrabold text-xl">P</div>
        <h1 className="text-3xl font-extrabold mt-4">Connexion Marketplace</h1>
        <p className="text-slate-500 text-sm mt-1">Client • Partenaire • Admin (propriétaire)</p>
        {err && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{err}</div>}
        <div className="mt-6 space-y-4">
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Téléphone" className="w-full border rounded-xl px-4 py-3" required/>
          <input value={pin} onChange={e=>setPin(e.target.value)} type="password" maxLength={4} placeholder="PIN" className="w-full border rounded-xl px-4 py-3" required/>
          <div className="bg-slate-50 border rounded-xl p-3 text-xs space-y-1">
            <div className="font-bold">Comptes de test (PIN 1234) :</div>
            <div>🛒 Client: <b>237690333444</b> • <b>237698765432</b></div>
            <div>🏪 Partenaire: <b>237699111222</b> (Amina) • <b>235660111222</b> (Moussa)</div>
            <div>👑 Admin: <b>237699999999</b></div>
          </div>
          <button disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl">{loading?'Connexion...':'Se connecter →'}</button>
          <p className="text-center text-sm">Pas de compte ? <Link to="/register" className="text-emerald-600 font-semibold">Créer un compte</Link></p>
        </div>
      </form>
    </div>
    <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-500 to-slate-900 text-white p-12 flex-col justify-center">
      <h2 className="text-4xl font-extrabold leading-tight">Marketplace<br/>multi-boutiques</h2>
      <p className="text-white/80 mt-4">Le client parcourt toutes les boutiques, paie en Mobile Money, l'admin prélève 1.5% et offre des bons fidélité.</p>
      <div className="mt-8 grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/10 rounded-2xl p-4"><div className="font-extrabold text-xl">1.5%</div><div className="text-xs">Commission</div></div>
        <div className="bg-white/10 rounded-2xl p-4"><div className="font-extrabold text-xl">-20%</div><div className="text-xs">Bons fidélité</div></div>
        <div className="bg-white/10 rounded-2xl p-4"><div className="font-extrabold text-xl">3</div><div className="text-xs">Acteurs</div></div>
      </div>
    </div>
  </div>
}
