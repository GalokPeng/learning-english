import { createRouter, createWebHistory } from "vue-router";
import Type from '../views/Type.vue'
import EveryDay from '../views/EveryDay.vue'
import EveryWeek from '../views/EveryWeek.vue'
import Home from '../views/Home.vue'
import Personnel from '../views/Personnel.vue'
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path:"/type",
    name:"type",
    component: Type
  },
  {
    path:"/everyday",
    name:"EveryDay",
    component: EveryDay
  },
  {
    path:"/everyweek",
    name:"EveryWeek",
    component: EveryWeek
  },
  {
    path:"/personnel",
    name:"Personnel",
    component: Personnel
  }
  
//   {
//     path: "/demo",
//     name: "demo",
//     component: () =>
//       import(/* webpackChunkName: "demo" */ "@/views/demo/Demo.vue"),
//   },
];

const index = createRouter({
  history: createWebHistory(),
  routes
})

export default index;