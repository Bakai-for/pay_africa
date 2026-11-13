import { Link, useLocation, useNavigate } from 'react-router-dom'
export default function Layout({children}){
  const loc=useLocation(); const nav=useNavigate()
  const user=JSON.parse(localStorage.getItem('payafrica_user')||'{}')
  const logout=()=>{localStorage.clear(); nav('/login')}
  const role=user.role||'CLIENT'
  const menus={
    CLIENT: [{path:'/',label:'Boutique',icon:'fa-store'},{path:'/cart',label:'Panier',icon:'fa-cart-shopping'},{path:'/my-orders',label:'Mes commandes',icon:'fa-box'},{path:'/vouchers',label:'Mes bons',icon:'fa-ticket'}],
    PARTNER: [{path:'/partner',label:'Tableau de bord',icon:'fa-chart-line'},{path:'/partner/catalog',label:'Catalogue',icon:'fa-boxes-stacked'},{path:'/partner/orders',label:'Commandes',icon:'fa-clipboard-list'},{path:'/',label:'Voir boutique',icon:'fa-store'}],
    ADMIN: [{path:'/admin',label:'Dashboard',icon:'fa-gauge'},{path:'/admin/partners',label:'Partenaires',icon:'fa-store'},{path:'/admin/products',label:'Articles à valider',icon:'fa-boxes-stacked'},{path:'/admin/orders',label:'Commandes',icon:'fa-list'},{path:'/admin/activities',label:'Historique',icon:'fa-clock-rotate-left'},{path:'/admin/settings',label:'Paramètres',icon:'fa-gear'}]
  }
  const menu=menus[role]||menus.CLIENT
  return <div className="min-h-screen flex">
    <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
      <div className="p-6 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-extrabold">P</div><span className="font-extrabold">PayAfrica</span><span className="ml-2 text-xs px-2 py-1 bg-white/20 rounded-full">{role}</span></div>
      <nav className="flex-1 px-3 space-y-1">
        {menu.map(m=> <Link key={m.path} to={m.path} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${loc.pathname===m.path?'bg-white text-slate-900':'text-white/70 hover:bg-white/10'}`}><i className={`fa-solid ${m.icon} w-5`}></i>{m.label}</Link>)}
        <Link to="/terms" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/50"><i className="fa-solid fa-file-lines w-5"></i>CGU & Confidentialité</Link>
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3"><img src={`https://i.pravatar.cc/100?u=${user.phone}`} className="w-9 h-9 rounded-full"/><div><div className="text-sm font-semibold">{user.fullName}</div><div className="text-xs text-white/60">{user.phone} • {user.role}</div></div></div>
        <button onClick={logout} className="mt-3 w-full bg-white/10 py-2 rounded-full text-sm font-semibold">Déconnexion</button>
      </div>
    </aside>
    <div className="flex-1 flex flex-col min-w-0">
      <div className="md:hidden bg-slate-900 text-white p-3 flex gap-2 overflow-x-auto">
        {menu.map(m=> <Link key={m.path} to={m.path} className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap ${loc.pathname===m.path?'bg-white text-slate-900':'bg-white/10'}`}>{m.label}</Link>)}
      </div>
      <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
    </div>
  </div>
}
