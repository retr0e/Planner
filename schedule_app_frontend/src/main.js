/* eslint-disable prettier/prettier */
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Zakładam, że masz plik routera
import Toast, { useToast } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const app = createApp(App);

const toast = useToast();
app.config.globalProperties.$toast = toast;

const Toastoptions = {
    timeout: 5000, // Czas wyświetlania powiadomienia
    closeOnClick: true,
};

// Użycie routera w aplikacji
app.use(router);
app.use(Toast, Toastoptions);

app.mount('#app');
