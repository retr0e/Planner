import { createApp, reactive } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

export const loginData = reactive({
    user_id: -1,
    login: '',
    session_key: ''
});

app.use(router);

app.mount('#app');
