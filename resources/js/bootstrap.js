import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY, // o tu clave directamente
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER, // o tu cluster
    forceTLS: true,
    encrypted: true,
    authEndpoint: '/broadcasting/auth',
});
