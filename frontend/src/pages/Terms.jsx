import {useEffect, useState} from 'react'; import {terms} from '../services/api'
export default function Terms(){
  const [data,setData]=useState(null)
  useEffect(()=>{terms.current().then(r=>setData(r.data))},[])
  if(!data) return <div className="p-8">Chargement...</div>
  return <div className="max-w-3xl mx-auto p-6">
    <h1 className="text-3xl font-extrabold">CGU & Politique de confidentialité</h1>
    <p className="text-sm text-slate-500">Version {data.version} • Commission {data.commissionPercent}% • Tous les acteurs doivent accepter</p>
    <div className="mt-6 bg-white rounded-3xl border p-6 space-y-6">
      <div dangerouslySetInnerHTML={{__html: data.cgu}} className="prose max-w-none"/>
      <hr/>
      <div dangerouslySetInnerHTML={{__html: data.privacy}} className="prose max-w-none"/>
    </div>
    <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm">
      <b>3 acteurs :</b> Client (achète, reçoit bons), Partenaire (vend, 1.5% commission), Propriétaire (admin, encaisse commission, gère bons & CGU).
    </div>
  </div>
}
