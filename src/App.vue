<script setup lang="ts">
// import { Button } from 'vant';
import { ref } from 'vue';
import Menu from "./views/Menu.vue";
// 创建画布
const esign:any = ref(null);
const clearCanvas = () => {
  // esignRef.value.reset();
  esign.value?.reset()
};
</script>

<template>
  <van-notice-bar
    scrollable 
    background="#ecf9ff"
    left-icon="volume-o"
    text="基本功能已经实现，欢迎反馈问题至邮箱：pichaguan@gmail.com"
  />
  <router-view></router-view>
  <div v-if="$route.name === 'EveryDay'" class="esign-container">
    <vue-esign
      ref="esign"
      :height="500"
      :lineColor="'#F1C9FF'"
      :lineWidth="6"
    />
    <button @click="clearCanvas">Clear</button>
  </div>
  <Menu/>
</template>
<style scoped>
.esign-container {
  border: 1px solid #b900decc; /* 边框样式，可以根据需要自定义 */
  padding: 10px; /* 可选的内边距，以增加边框与画布之间的间距 */
}
</style>

