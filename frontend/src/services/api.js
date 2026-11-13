import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL || ''
const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use(c => {
  const t = localStorage.getItem('payafrica_token')
  if(t) c.headers.Authorization = `Bearer ${t}`
  return c
})
api.interceptors.response.use(r=>r, e=>{
  if(e.response?.status===401){ localStorage.removeItem('payafrica_token'); window.location.href='/login' }
  return Promise.reject(e)
})
export default api
export const auth = {
  register: d => api.post('/api/v1/auth/register', d),
  login: d => api.post('/api/v1/auth/login', d),
}
export const terms = {
  current: () => api.get('/api/v1/terms/current'),
  accept: (v) => api.post('/api/v1/terms/accept', {version: v}),
}
export const partners = {
  me: () => api.get('/api/v1/partner/profile'),
  update: d => api.put('/api/v1/partner/profile', d),
  all: () => api.get('/api/v1/partner/public'),
  public: id => api.get('/api/v1/partner/public/'+id),
}
export const products = {
  list: (p) => api.get('/api/v1/products', {params: p}),
  get: id => api.get('/api/v1/products/'+id),
  categories: (pid) => api.get('/api/v1/categories', {params: pid? {partnerId: pid}: {}}),
  createCategory: d => api.post('/api/v1/partner/categories', d),
  create: d => api.post('/api/v1/partner/products', d),
  update: (id,d) => api.put('/api/v1/partner/products/'+id, d),
  remove: id => api.delete('/api/v1/partner/products/'+id),
}
export const orders = {
  place: d => api.post('/api/v1/orders/place', d),
  my: (p) => api.get('/api/v1/orders/my', {params: p}),
  partnerMy: () => api.get('/api/v1/orders/partner/my'),
  get: id => api.get('/api/v1/orders/'+id),
  invoice: id => api.get('/api/v1/orders/'+id+'/invoice'),
  history: () => api.get('/api/v1/orders/history'),
  updateStatus: (id,s) => api.patch('/api/v1/orders/'+id+'/status', {status: s}),
  retry: id => api.post('/api/v1/orders/'+id+'/retry'),
  myVouchers: () => api.get('/api/v1/orders/vouchers/my'),
  applyVoucher: code => api.post('/api/v1/orders/vouchers/apply', {code}),
}
export const partnerProducts = {
  updateStock: (id, add) => api.patch('/api/v1/partner/products/'+id+'/stock', {add}),
  incStock: (id, delta) => api.patch('/api/v1/admin/products/'+id+'/stock', {add: delta}).catch(()=> api.put('/api/v1/partner/products/'+id, {stock: delta})),
}
export const historyApi = {
  my: () => api.get('/api/v1/orders/history'),
  admin: () => api.get('/api/v1/admin/activities'),
}
export const admin = {
  settings: () => api.get('/api/v1/admin/settings'),
  updateSettings: d => api.put('/api/v1/admin/settings', d),
  partners: (pending) => api.get('/api/v1/admin/partners', {params: {onlyPending: pending}}),
  validatePartner: (id, v) => api.patch('/api/v1/admin/partners/'+id+'/validate', {validated: v}),
  deletePartner: id => api.delete('/api/v1/admin/partners/'+id),
  addCategoryToPartner: (id, d) => api.post('/api/v1/admin/partners/'+id+'/categories', d),
  addProductToPartner: (id, d) => api.post('/api/v1/admin/partners/'+id+'/products', d),
  deleteProduct: id => api.delete('/api/v1/admin/products/'+id),
  toggleProduct: id => api.patch('/api/v1/admin/products/'+id+'/toggle'),
  updateStock: (id, add) => api.patch('/api/v1/admin/products/'+id+'/stock', {add}),
  products: (pending) => api.get('/api/v1/admin/products', {params: {onlyPending: pending}}),
  validateProduct: (id, v) => api.patch('/api/v1/admin/products/'+id+'/validate', {validated: v}),
  allOrders: () => api.get('/api/v1/admin/orders'),
  stats: () => api.get('/api/v1/admin/stats'),
  activities: () => api.get('/api/v1/admin/activities'),
}
export const catalogAdmin = {
  list: (partnerId) => api.get('/api/v1/products', {params: partnerId? {partnerId}: {}}),
}
