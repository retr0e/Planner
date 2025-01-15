/* eslint-disable prettier/prettier */
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Zakładam, że masz plik routera

const app = createApp(App);

// Użycie routera w aplikacji
app.use(router);

app.mount('#app');
