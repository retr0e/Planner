import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../components/HomeView.vue';
import ScheduleView from '../components/ScheduleView.vue';
import ProfileView from '../components/ProfileView.vue';
import EditProfile from '../components/EditProfile.vue';

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
