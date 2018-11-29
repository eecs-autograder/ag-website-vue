import Vue from 'vue';

import '@fortawesome/fontawesome-free/css/all.min.css';

import VueRouter from 'vue-router';
import CourseAdmin from '@/components/course_admin.vue';
import CourseList from '@/components/course_list.vue';

import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const ROUTES = [
    { path: '/', component: CourseList },
    { path: '/web/course_admin/:courseId', component: CourseAdmin }
];

const ROUTER = new VueRouter ({
    routes: ROUTES,
    mode: 'history'
});

new Vue({
    router: ROUTER,
    render: h => h(App)
}).$mount('#app');
