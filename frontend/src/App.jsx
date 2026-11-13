import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ClientShop from './pages/client/Shop.jsx'
import ClientCart from './pages/client/Cart.jsx'
import ClientOrders from './pages/client/Orders.jsx'
import ClientVouchers from './pages/client/Vouchers.jsx'
import PartnerDashboard from './pages/partner/Dashboard.jsx'
import PartnerCatalog from './pages/partner/Catalog.jsx'
import PartnerOrders from './pages/partner/Orders.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminPartners from './pages/admin/Partners.jsx'
import AdminProducts from './pages/admin/Products.jsx'
import AdminOrders from './pages/admin/Orders.jsx'
import AdminActivities from './pages/admin/Activities.jsx'
import AdminSettings from './pages/admin/Settings.jsx'
import Terms from './pages/Terms.jsx'
import Layout from './components/Layout.jsx'

function Private({children, roles}){
  const token=localStorage.getItem('payafrica_token')
  const user=JSON.parse(localStorage.getItem('payafrica_user')||'{}')
  if(!token) return <Navigate to="/login"/>
  if(roles && !roles.includes(user.role)) return <Navigate to={user.role==='PARTNER'?'/partner': user.role==='ADMIN'?'/admin':'/'}/>
  return children
}
export default function App(){
  return <Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/terms" element={<Terms/>}/>
    {/* Client */}
    <Route path="/" element={<Private roles={['CLIENT','ADMIN']}><Layout><ClientShop/></Layout></Private>}/>
    <Route path="/cart" element={<Private roles={['CLIENT']}><Layout><ClientCart/></Layout></Private>}/>
    <Route path="/my-orders" element={<Private roles={['CLIENT']}><Layout><ClientOrders/></Layout></Private>}/>
    <Route path="/vouchers" element={<Private roles={['CLIENT']}><Layout><ClientVouchers/></Layout></Private>}/>
    {/* Partner */}
    <Route path="/partner" element={<Private roles={['PARTNER']}><Layout><PartnerDashboard/></Layout></Private>}/>
    <Route path="/partner/catalog" element={<Private roles={['PARTNER']}><Layout><PartnerCatalog/></Layout></Private>}/>
    <Route path="/partner/orders" element={<Private roles={['PARTNER']}><Layout><PartnerOrders/></Layout></Private>}/>
    {/* Admin */}
    <Route path="/admin" element={<Private roles={['ADMIN']}><Layout><AdminDashboard/></Layout></Private>}/>
    <Route path="/admin/partners" element={<Private roles={['ADMIN']}><Layout><AdminPartners/></Layout></Private>}/>
    <Route path="/admin/products" element={<Private roles={['ADMIN']}><Layout><AdminProducts/></Layout></Private>}/>
    <Route path="/admin/orders" element={<Private roles={['ADMIN']}><Layout><AdminOrders/></Layout></Private>}/>
    <Route path="/admin/activities" element={<Private roles={['ADMIN']}><Layout><AdminActivities/></Layout></Private>}/>
    <Route path="/admin/settings" element={<Private roles={['ADMIN']}><Layout><AdminSettings/></Layout></Private>}/>
    <Route path="*" element={<Navigate to="/"/>}/>
  </Routes>
}
