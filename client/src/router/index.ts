import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../components/HomeView.vue';
import ScheduleView from '../components/ScheduleView.vue';
import ProfileView from '../components/ProfileView.vue';
import EditProfile from '../components/EditProfile.vue';
import RoomsView from '../components/RoomsView.vue';
import DepartmentView from '../components/DepartmentView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/schedule/:id',
    name: 'Schedule',
    component: ScheduleView,
    props: true,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: EditProfile,
  },
  {
    path: '/rooms',
    name: 'RoomsView',
    component: RoomsView,
  },
  {
    path: '/departments',
    name: 'DepartmentView',
    component: DepartmentView,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
