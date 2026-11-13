import {useEffect, useState} from 'react'; import {admin, terms} from '../../services/api'
export default function Settings(){
  const [s,setS]=useState(null); const [msg,setMsg]=useState('')
  useEffect(()=>{ admin.settings().then(r=>setS(r.data)); },[])
  const save=async()=>{
    try{ await admin.updateSettings({commissionPercent: parseFloat(s.commissionPercent), pcFixedCommission: parseInt(s.pcFixedCommission), pcCategoryName: s.pcCategoryName, voucherRulesJson: s.voucherRulesJson, cguContent: s.cgu, privacyContent: s.privacy}); setMsg('✓ Paramètres enregistrés — PC fixe '+s.pcFixedCommission+' XAF pour type "'+s.pcCategoryName+'"')}catch(e){ setMsg(e.response?.data?.error||e.message)}
  }
  if(!s) return <div className="p-8">Chargement...</div>
  return <div className="max-w-4xl mx-auto space-y-6">
    <h1 className="text-2xl font-extrabold">Paramètres — Administration</h1>
    {msg && <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-sm">{msg}</div>}
    <div className="bg-white rounded-3xl border p-6 space-y-4">
      <h3 className="font-bold">Commission générale</h3>
      <div className="flex gap-3 items-center">
        <input type="number" step="0.1" value={s.commissionPercent} onChange={e=>setS({...s, commissionPercent:e.target.value})} className="border rounded-xl px-4 py-3 w-32 font-bold"/> <span className="font-bold">% par article vendu (hors PC)</span>
      </div>
      <p className="text-xs text-slate-500">1.5% par défaut — prélevée automatiquement (ex: 10 000 → 150 pour admin, 9 850 pour partenaire)</p>
      <div className="border-t pt-4">
        <h4 className="font-bold">Commission fixe — Type PC</h4>
        <div className="flex gap-3 items-center mt-2">
          <span className="text-sm">Type</span><input value={s.pcCategoryName} onChange={e=>setS({...s, pcCategoryName:e.target.value})} className="border rounded-xl px-4 py-3 w-24 font-bold"/>
          <input type="number" value={s.pcFixedCommission} onChange={e=>setS({...s, pcFixedCommission:e.target.value})} className="border rounded-xl px-4 py-3 w-28 font-bold"/> <span className="font-bold">XAF fixe / unité</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Quelque soit le prix du PC, commission = {s.pcFixedCommission} XAF (modifiable). Ex: PC à 350 000 → commission 500, net partenaire 349 500.</p>
      </div>
    </div>
    <div className="bg-white rounded-3xl border p-6 space-y-4">
      <h3 className="font-bold">Bons de réduction — Règles fidélité</h3>
      <p className="text-xs text-slate-500">{'JSON : [{"minTransactions":5,"discountPercent":5,"expiresInDays":30}, ...]'}</p>
      <textarea value={s.voucherRulesJson} onChange={e=>setS({...s, voucherRulesJson:e.target.value})} rows={4} className="w-full border rounded-xl px-4 py-3 font-mono text-sm"/>
      <div className="bg-slate-50 rounded-xl p-3 text-xs">5 commandes → -5% (30j), 10 → -10% (60j). Bonus fréquence à venir V2.1</div>
    </div>
    <div className="bg-white rounded-3xl border p-6 space-y-4">
      <h3 className="font-bold">CGU & Confidentialité (à accepter par tous)</h3>
      <label className="text-sm font-semibold">CGU (HTML)</label>
      <textarea value={s.cgu||''} onChange={e=>setS({...s, cgu:e.target.value})} rows={6} className="w-full border rounded-xl px-4 py-3 text-sm"/>
      <label className="text-sm font-semibold">Politique de confidentialité</label>
      <textarea value={s.privacy||''} onChange={e=>setS({...s, privacy:e.target.value})} rows={6} className="w-full border rounded-xl px-4 py-3 text-sm"/>
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">⚠️ Dès que vous modifiez, version bumpée et tous devront re-accepter.</div>
    </div>
    <button onClick={save} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl">Enregistrer les paramètres</button>
    <div className="bg-white rounded-2xl border p-4">
      <h4 className="font-bold text-sm">Aperçu CGU actuelle (version {s.termsVersion})</h4>
      <div className="mt-2 border rounded-xl p-4 max-h-60 overflow-auto prose text-sm" dangerouslySetInnerHTML={{__html: s.cgu}}/>
    </div>
  </div>
}
