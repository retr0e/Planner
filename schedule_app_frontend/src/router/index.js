/* eslint-disable prettier/prettier */
import { createRouter, createWebHistory } from 'vue-router';
import ScheduleView from '../views/ScheduleView.vue';
import LoginView from '../views/LoginView.vue';
import DailyScheduleView from '../views/DailyScheduleView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import DepartmentManagementView from '../views/DepartmentManagementView.vue';
import AdminUserManagementView from '../views/AdminUserManagementView.vue';
import AdminEmployeesManagementView from '@/views/AdminEmployeesManagementView.vue';
import AdminUserTypesManagementView from '@/views/AdminUserTypesManagementView.vue';

// Definicje tras
const routes = [
  {
    path: '/',
    name: 'Schedule',
    component: ScheduleView,
    meta: { requiresAuth: false }, 
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView, 
  },
  {
    path: '/edit',
    name: 'EditClasses',
    component: DailyScheduleView, 
    meta: { requiresAuth: true }, 
  },
  {
    path: '/departments',
    name: 'DepartmentManagement',
    component: DepartmentManagementView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/users',
    name: 'AdminUserManagement',
    component: AdminUserManagementView, 
    meta: { requiresAuth: true, requiresAdmin: true }, 
  },
  {
    path: '/admin/employees',
    name: 'AdminEmployeesManagement',
    component: AdminEmployeesManagementView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/user-types',
    name: 'AdminUserTypesManagement',
    component: AdminUserTypesManagementView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView, 
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken'); 
  const isAdmin = localStorage.getItem('userRole') == 1;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next({ name: 'NotFound' }); 
  } else {
    next(); 
  }
});

export default router;
