<template>

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
      <div ref="container" style="height: auto">
        <van-sticky :container="container">
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
        </van-sticky>
      </div>
    </van-tab>
  </van-tabs>

</template>

<script setup>
import { ref, computed, onMounted,watch  } from 'vue';
import { showNotify } from 'vant';
const container = ref(null);
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
const paginatedData = ref("")
const dataLength = ref(0);

async function loadJSON(filepath) {
  try {
    const response = await fetch(filepath);
    const data = await response.json();
    jsonData.value = data;
    dataLength.value = jsonData.value.length;
    console.log(dataLength.value);
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
watch(active, (newActive) => {
  loadJSON(tabs[newActive].filepath);
  currentPage.value = 1; // 重置页数
});
// 初始化加载第一个标签的数据
onMounted(() => {
  // showNotify({ type: 'primary', message: '通知内容' });
  // console.log(tabs[0].filepath);
  loadJSON(tabs[0].filepath);
});

// 你的 loadJSON 和其他逻辑
</script>
<style scoped>
</style>