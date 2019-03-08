import CourseAdmin from '@/components/course_admin/course_admin.vue';
import CourseList from '@/components/course_list/course_list.vue';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Vue from 'vue';
import VueRouter from 'vue-router';

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
