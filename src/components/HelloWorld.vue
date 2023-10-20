<template>
  <div>
    <van-collapse v-model="activeNames" accordion>
      <van-collapse-item
        v-for="(item) in paginatedData.value"
        :key="item.sw"
        :title="item.sw"
        :name="item.sw"
      > 
        <div>【音标】: {{ item.phonetic }}</div>
        <div>【翻译】:</div><div class="text-with-line-breaks" v-html="formatNewlines(item.translation)"></div>
        <div>【定义】: {{ item.definition }}</div>
      </van-collapse-item>
    </van-collapse>
  </div>
  <div>
    <van-pagination
      v-if="dataLength > pageSize"
      v-model="currentPage"
      :total-items="dataLength"
      :items-per-page="pageSize"
      :current="currentPage"
      @change="handlePageChange"
    >
      <template #prev-text>
        <van-icon name="arrow-left" />
      </template>
      <template #next-text>
        <van-icon name="arrow" />
      </template>
      <template #page="{ text }">{{ text }}</template>
    </van-pagination>
    <van-button @click="loadJSON">test-button</van-button>
    <!-- <pre>{{ jsonData }}</pre> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// import jsonfile from "@/data/word_dict_test.json";
const activeNames = ref(1);
const jsonData = ref([]);
const pageSize = 9; // 每页显示的数据量
const currentPage = ref(1);
const paginatedData = ref("")
const dataLength = ref(0);
async function loadJSON() {
  try {
    // 使用相对路径来引用 JSON 文件
    const response = await fetch('/src/data/word_dict_test.json');
    const data = await response.json();
    jsonData.value = data
    dataLength.value = jsonData.value.length;
    console.log(dataLength.value)
    // 更新 paginatedData 的值
    paginatedData.value = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return jsonData.value.slice(startIndex, endIndex);
    });
  } catch (error) {
    console.error('加载JSON文件时发生错误:', error);
  }
}
function formatNewlines(text) {
  return text.replace(/\n/g, '<br>');
}
function handlePageChange(newPage) {
  currentPage.value = newPage;
}
</script>
<style scoped>
</style>