<script setup lang="ts">
// import { Button } from 'vant';
import Menu from "./views/Menu.vue";
</script>

<template>
  <van-notice-bar
    scrollable 
    background="#ecf9ff"
    left-icon="volume-o"
    text="网站还在开发当中，现在是测试阶段，欢迎反馈问题至邮箱：pichaguan@gmail.com"
  />
  <router-view></router-view>
  <Menu/>
</template>
<style scoped>

</style>

