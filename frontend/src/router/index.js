import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import FieldsView from '../views/admin/FieldsView.vue'
import AgentDashboard from '../views/agent/AgentDashboard.vue'
import MyFieldsView from '../views/agent/MyFieldsView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView, meta: { guest: true } },
  { path: '/admin/dashboard', component: AdminDashboard, meta: { role: 'ADMIN' } },
  { path: '/admin/fields', component: FieldsView, meta: { role: 'ADMIN' } },
  { path: '/agent/dashboard', component: AgentDashboard, meta: { role: 'AGENT' } },
  { path: '/agent/fields', component: MyFieldsView, meta: { role: 'AGENT' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.guest && auth.isAuthenticated) {
    return auth.isAdmin ? '/admin/dashboard' : '/agent/dashboard'
  }

  if (to.meta.role && !auth.isAuthenticated) {
    return '/login'
  }

  if (to.meta.role && auth.user?.role !== to.meta.role) {
    return auth.isAdmin ? '/admin/dashboard' : '/agent/dashboard'
  }
})

export default router