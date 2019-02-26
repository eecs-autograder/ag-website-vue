import Vue from 'vue';
import ManageProjectsDemo from '@/demos/manage_projects_demo.vue';
import '@fortawesome/fontawesome-free/css/all.min.css';
import VueRouter from 'vue-router';

import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const ROUTES = [
    { path: '/', component: ManageProjectsDemo }
];

const ROUTER = new VueRouter ({
    routes: ROUTES,
    mode: 'history'
});

new Vue({
    router: ROUTER,
    render: h => h(App)
}).$mount('#app');
