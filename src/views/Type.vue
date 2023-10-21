<template>
  <van-search v-model="searchValue" placeholder="请输入搜索关键字母" />
  <van-tabs v-model:active="active" sticky type="card">
    <van-sticky :offset-top="30">
      <van-pagination
        v-if="dataLength > pageSize"
        v-model="currentPage"
        :total-items="dataLength"
        :items-per-page="pageSize"
        :current="currentPage"
        @change="handlePageChange"
        mode="simple" 
      >
        <template #prev-text>
          <van-icon name="arrow-left" />
        </template>
        <template #next-text>
          <van-icon name="arrow" />
        </template>
        <template #page="{ text }">{{ text }}</template>
      </van-pagination>
    </van-sticky>
    <van-tab v-for="tab in tabs" :key="tab.title" :title="tab.title">
      <van-collapse v-model="activeNames" accordion>
        <van-swipe-cell v-for="(item) in paginatedData.value" :key="item.sw">
          <template #left>
            <van-button square type="primary" text="添加" @click="addItem(item)" />
          </template>
          <van-collapse-item
            :key="item.sw"
            :title="item.sw"
            :name="item.sw"
          > 
            <!-- <van-button square type="primary" text="选择" @click="addItem(item)" /> -->
            <div>【音标】: {{ item.phonetic }}</div>
            <div>【翻译】:</div><div class="text-with-line-breaks" v-html="formatNewlines(item.translation)"></div>
            <div>【定义】: {{ item.definition }}</div>
          </van-collapse-item>
        </van-swipe-cell>
      </van-collapse>
    </van-tab>
  </van-tabs>
</template>

<script setup>
import { ref, computed, onMounted,watch  } from 'vue';
import { showNotify,showLoadingToast } from 'vant';
import { db } from "../database"
const active = ref();
const tabs = [
  { title: '中考', filepath: '/word_dict_zk.json' },
  { title: '高考', filepath: '/word_dict_gk.json' },
  { title: '四级', filepath: '/word_dict_cet4.json' },
  { title: '六级', filepath: '/word_dict_cet6.json' },
  { title: '考研', filepath: '/word_dict_ky.json' },
  { title: '雅思', filepath: '/word_dict_ielts.json' },
  { title: '托福', filepath: '/word_dict_toefl.json' },
];
// const onClickTab = ({ dataLength }) => showToast(dataLength);
// import jsonfile from "@/data/word_dict_test.json";
const activeNames = ref(1);
const jsonData = ref([]);
const pageSize = 20; // 每页显示的数据量
const currentPage = ref(1);
const paginatedData = ref([]);
const dataLength = ref(0);
// 声明 searchValue 变量
const searchValue = ref(""); // 请确保适当初始化 searchValue
async function loadJSON(filepath) {
  try {
    const response = await fetch(filepath);
    const data = await response.json();
    jsonData.value = data;
    // 在 computed 外部定义 computed 属性，以便在其他地方使用
    paginatedData.value = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      if (!searchValue.value) {
        dataLength.value = jsonData.value.length;
        return jsonData.value.slice(startIndex, endIndex);
      } else {
        // 使用 filter 方法筛选包含 searchValue 的数据项
        const filterData = jsonData.value.filter(item => {
            // 根据你的匹配逻辑来判断是否保留 item
            return item.sw?.includes(searchValue.value.toLowerCase()); // 例如，假设要匹配某个属性
        })
        dataLength.value = filterData.length
        return filterData.slice(startIndex, endIndex);
      }
    });
    console.log(paginatedData.value)
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
watch(active, (newActive) => {
  loadJSON(tabs[newActive].filepath);
  currentPage.value = 1; // 重置页数
});
// 初始化加载第一个标签的数据
onMounted(() => {
  loadJSON(tabs[0].filepath);
});

// 添加存储功能

async function addItem(item) {
  const existingItem = await db.selectWordTable.where('sw').equals(item.sw).first();
  if (existingItem) {
    // 如果已存在相同的 sw，可以选择不添加或执行更新操作
    return; // 不执行添加操作
  }
  let datetime = Date.now();
  const newItem = {
    sw: item.sw,
    phonetic: item.phonetic,
    translation: item.translation,
    definition: item.definition,
    datetime: datetime,
    type: 0
  };
  const id = await db.selectWordTable.add(newItem);
  console.log('Added item with ID:', id);
}




</script>
<style scoped>
</style>