<template>
  <van-search v-model="searchValue" placeholder="请输入搜索关键字母或者中文" />
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
        <van-swipe-cell v-for="(item) in paginatedData.value" :key="item.id">
          <template #left>
            <van-button square type="primary" text="添加" @click="addItem(item.id)" />
          </template>
          <van-collapse-item
            :key="item.word"
            :title="item.word"
            :name="item.word"
          > 
            <!-- <van-button square type="primary" text="选择" @click="addItem(item)" /> -->
            <div>【音标】: [{{ item.phonetic }}]</div>
            <div>【翻译】:</div><div class="text-with-line-breaks" v-html="formatNewlines(item.translation)"></div>
            <div>【定义】:</div><div class="text-with-line-breaks" v-html="formatNewlines(item.definition)"></div>
          </van-collapse-item>
        </van-swipe-cell>
      </van-collapse>
    </van-tab>
    <van-row>
      <van-col span="12">
        <van-button :loading="addAllLoading" type="primary" block @click="addAllItem()">全部导入计划列表</van-button>
      </van-col>
      <van-col span="12">
        <van-button :loading="removeAllLoading" type="danger" block @click="removeAllItem()">全部移除计划列表</van-button>
      </van-col>
    </van-row>
  </van-tabs>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch  } from 'vue';
import { showNotify } from 'vant';
import { db } from "../database"
const active = ref();
const tabs = [
  { title: '中考', name: 'zk' },
  { title: '高考', name: 'gk' },
  { title: '四级', name: 'cet4' },
  { title: '六级', name: 'cet6' },
  { title: '考研', name: 'ky' },
  { title: '雅思', name: 'ielts' },
  { title: '托福', name: 'toefl' },
];
// const onClickTab = ({ dataLength }) => showToast(dataLength);
// import jsonfile from "@/data/word_dict_test.json";
const activeNames = ref(1);
const jsonData:any = ref([]);
const pageSize = 20; // 每页显示的数据量
const currentPage = ref(1);
const paginatedData:any = ref([]);
const dataLength = ref(0);
const selectName:any = ref("");
// 声明 searchValue 变量
const searchValue = ref(""); // 请确保适当初始化 searchValue
async function loadJSON(name:string) {
  try {
    const dbData = await db.selectWordTable.toArray();
    //取出dbData表格中字段tag中列表存在"zk"的数据
    const data = dbData.filter((item: { tag: any; }) => item.tag.includes(name)); 
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
        const filterData = jsonData.value.filter((item: { sw: string; translation: string; }) => {
            // 根据你的匹配逻辑来判断是否保留 item
            return item.sw?.includes(searchValue.value.toLowerCase()) ||
              item.translation?.includes(searchValue.value.toLowerCase()); // 例如，假设要匹配某个属性
        })
        dataLength.value = filterData.length
        return filterData.slice(startIndex, endIndex);
      }
    });
    // console.log(paginatedData.value)
  } catch (error) {
    console.error('加载JSON文件时发生错误:', error);
  }
}

function formatNewlines(text: string) {
  return text.replace(/\n/g, '<br>');
}

function handlePageChange(newPage: any) {
  currentPage.value = newPage;
}
watch(active, (newActive: number) => {
  selectName.value = tabs[newActive].name;
  loadJSON(tabs[newActive].name);
  currentPage.value = 1; // 重置页数
});
// 初始化加载第一个标签的数据
onMounted(() => {
  loadJSON(tabs[0].name);
  selectName.value = tabs[0].name;
});

// 添加存储功能
const addAllLoading = ref(false);
const removeAllLoading = ref(false);
async function addItem(id: any) {
  await db.selectWordTable.update(id, { isSelect: true });
  // console.log('Added item with ID:', id);
  showNotify({ type: 'success', message: '添加成功！' });
}
async function addAllItem() {
  try {
    addAllLoading.value = true;
    // 使用Dexie的bulkUpdate方法来更新匹配标签的记录
    console.log(selectName.value);
    const itemsToUpdate = await db.selectWordTable
      .filter((item: { tag: any; isSelect: boolean }) => {
        return item.tag.includes(selectName.value) && item.isSelect === false;
      }).toArray();
    console.log(itemsToUpdate.length);
    for (const item of itemsToUpdate) {
      await db.selectWordTable.where('id').equals(item.id!).modify({ isSelect: true });
    }
    addAllLoading.value = false;
    // 显示成功通知
    showNotify({ type: 'success', message: '添加成功！' });
  } catch (error) {
    addAllLoading.value = false;
    console.error('添加时出错：', error);
    showNotify({ type: 'danger', message: '添加时出错，请重试。' });
  }
}
async function removeAllItem() {
  try {
    removeAllLoading.value = true;
    // 使用Dexie的bulkUpdate方法来更新匹配标签的记录
    console.log(selectName.value);
    const itemsToUpdate = await db.selectWordTable
      .filter((item: { tag: any; isSelect: boolean }) => {
        return item.tag.includes(selectName.value) && item.isSelect === true;
      }).toArray();
    console.log(itemsToUpdate.length);
    for (const item of itemsToUpdate) {
      await db.selectWordTable.where('id').equals(item.id!).modify({ isSelect: false });
    }
    removeAllLoading.value = false;
    // 显示成功通知
    showNotify({ type: 'success', message: '移除成功！' });
  } catch (error) {
    removeAllLoading.value = false;
    console.error('移除时出错：', error);
    showNotify({ type: 'danger', message: '移除时出错，请重试。' });
  }
}
</script>
<style scoped>
</style>