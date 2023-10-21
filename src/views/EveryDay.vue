<template>
  <div>
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
            <van-collapse-item
              :key="item.sw"
              :title="item.sw"
              :name="item.sw"
            > 
              <!-- <van-button square type="danger" text="删除" @click="deleteItem(item.id)" /> -->
              <div>【音标】: {{ item.phonetic }}</div>
              <div>【翻译】:</div><div class="text-with-line-breaks" v-html="formatNewlines(item.translation)"></div>
              <div>【定义】: {{ item.definition }}</div>
            </van-collapse-item>
            <template #right>
              <van-button square type="danger" text="删除" @click="deleteItem(item.id)"/>
            </template>
          </van-swipe-cell>
        </van-collapse>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
// import { format } from 'date-fns';
import { db } from '../database';
// import seedrandom from 'seedrandom';
const activeNames = ref(1);
// const dailyWords = ref([]);
const active = ref();
const pageSize = 20; // 每页显示的数据量
const currentPage = ref(1);
const paginatedData = ref([]);
const dataLength = ref(0);
// 声明 searchValue 变量
const searchValue = ref(""); // 请确保适当初始化 searchValue
const tabs = [
  { title: '新添加', type: 0 },
  { title: '已记忆', type: 1 },
  { title: '将推送', type: 2 },
];
// 获取所有单词
async function getAllItems(type: number|undefined) {
  try {
    const filterItems = await db.selectWordTable.where('type').equals(type).toArray();
    // console.log(filterItems.length);
    // 在 computed 外部定义 computed 属性，以便在其他地方使用
    paginatedData.value = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      if (!searchValue.value) {
        dataLength.value = filterItems.length;
        return filterItems.slice(startIndex, endIndex);
      } else {
        // 使用 filter 方法筛选包含 searchValue 的数据项
        const filterData = filterItems.filter(item => {
          // console.log(item);
          // 根据你的匹配逻辑来判断是否保留 item
          return item.sw?.includes(searchValue.value.toLowerCase()); // 例如，假设要匹配某个属性
        })
        dataLength.value = filterData.length
        return filterData.slice(startIndex, endIndex);
      }
    });
    // console.log(paginatedData.value)
  } catch (error) {
    console.error('加载数据时发生错误:', error);
  }
}
watch(active, (newActive) => {
  // console.log(newActive);
  getAllItems(tabs[newActive].type);
  currentPage.value = 1; // 重置页数
});
onMounted(async () => {
  // console.log(tabs[0])
  await getAllItems(tabs[0].type);
});
// 删除单词
async function deleteItem(id) {
  // 如果找到匹配的单词，执行删除操作
  await db.selectWordTable.delete(id);
  // console.log('Deleted item with sw:', id);
  // 删除后刷新数据
  // console.log(tabs[0].type)
  await getAllItems(tabs[0].type);
}

// const loadJSON = async () => {
//   try {
//     const response = await fetch('/word_dict_all.json');
//     const data = await response.json();
//     jsonData.value = data;
//   } catch (error) {
//     console.error('加载JSON文件时发生错误:', error);
//   }
// };

// const generateDailyWords = () => {
//   const currentDate = new Date();
//   const dateString = format(currentDate, 'yyyy-MM-dd');
//   const seed = dateString;

//   // 使用随机种子直接选择单词，无需排序
//   const shuffledWords = [...jsonData.value];
//   const random = seedrandom(seed);
//   const selectedWords = [];
//   while (selectedWords.length < 20 && shuffledWords.length > 0) {
//     const randomIndex = Math.floor(random() * shuffledWords.length);
//     selectedWords.push(shuffledWords.splice(randomIndex, 1)[0]);
//   }

//   dailyWords.value = selectedWords;
// };
function formatNewlines(text) {
  return text.replace(/\n/g, '<br>');
}
function handlePageChange(newPage) {
  currentPage.value = newPage;
}
</script>
