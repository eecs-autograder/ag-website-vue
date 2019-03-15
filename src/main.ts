import CoursePermissionsDemo from '@/demos/course_permissions_demo.vue';
import CourseSettingsDemo from '@/demos/course_settings_demo.vue';
import ManageProjectsDemo from '@/demos/manage_projects_demo.vue';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const ROUTES = [
    { path: '/', component: CoursePermissionsDemo }
];

const ROUTER = new VueRouter ({
    routes: ROUTES,
    mode: 'history'
});

new Vue({
    router: ROUTER,
    render: h => h(App)
}).$mount('#app');
