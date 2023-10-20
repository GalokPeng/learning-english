<template>
  <van-tabbar router v-model="activeTabbar" active-color="MediumPurple" placeholder>
    <van-tabbar-item name="/" to="/" icon="home-o">主页</van-tabbar-item>
    <van-tabbar-item name="/type" to="/type" icon="apps-o">分类</van-tabbar-item>
    <van-tabbar-item name="/everyday" to="/everyday" icon="clock-o">每日记词</van-tabbar-item>
    <van-tabbar-item name="/personnel" to="/personnel" icon="user-o">个人</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, onBeforeMount, watch } from 'vue'
import { useRoute } from 'vue-router'

const activeTabbar = ref() // 初始化为空字符串
const route = useRoute()

onBeforeMount(() => {
  // 在组件挂载前，根据当前路由路径来设置activeTabbar的值
  activeTabbar.value = route.path
})

// 监听路由变化，更新activeTabbar的值
watch(route, (to, from) => {
  activeTabbar.value = to.path
})
</script>
