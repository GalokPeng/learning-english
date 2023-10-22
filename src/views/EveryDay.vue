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
        <van-collapse v-if="tab === tabs[0] || tab === tabs[3]" v-model="activeNames" accordion>
          <van-swipe-cell v-for="item in (tab === tabs[3] ? dailyWords.value : paginatedData.value)" :key="item.id">
            <van-collapse-item
              :key="item.sw"
              :title="item.sw"
              :name="item.sw"
            > 
              <!-- <van-button square type="danger" text="删除" @click="deleteItem(item.id)" /> -->
              <div>【音标】: [{{ item.phonetic }}]</div>
              <div>【翻译】:</div><div class="text-with-line-breaks" v-html="formatNewlines(item.translation)"></div>
              <div>【定义】:</div><div class="text-with-line-breaks" v-html="formatNewlines(item.definition)"></div>
              <!-- <div>: {{  }}</div> -->
            </van-collapse-item>
            <template #right>
              <van-button square type="danger" text="删除" @click="deleteItem(item.id)"/>
            </template>
            <van-row v-if="tab === tabs[0]">
              <van-col span="8"></van-col>
              <van-col span="8"><van-button round size="small" type="success" @click="rememberItem(item.id)" block>记住了</van-button></van-col>
              <van-col span="8"></van-col>
            </van-row>
          </van-swipe-cell>
        </van-collapse>
        <van-cell-group v-if="tab === tabs[1] || tab === tabs[2]">
          <van-cell v-for="item in paginatedData.value" :key="item.id" title="■■■■■🎇" >
            <div class="text-with-line-breaks" v-html="formatNewlines(item.translation)" @click="openPopup(item.id)"></div>
            <van-popup v-model:show="wordShow" round :style="{ padding: '64px' }">
              <div style="text-align: center">
                <h4>✨记忆对了吗？✨</h4>
                <p>正确单词：{{ wordShowValue }}</p>
                <van-space :size="20">
                  <van-button type="warning" size="small" @click="forgetItem()">我记错了</van-button>
                  <van-button type="success" size="small" @click="rightItem()">我记对了</van-button>
                </van-space>
              </div>
            </van-popup>
          </van-cell>
        </van-cell-group>
      </van-tab>
      <div v-if="active === 0 || active === 3" class="esign-container">
        <vue-esign
          ref="esign"
          :height="500"
          :lineColor="'#F1C9FF'"
          :lineWidth="6"
        />
        <button @click="clearCanvas">Clear</button>
      </div>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { showToast } from 'vant';
// import { format } from 'date-fns';
import { db } from '../database';
// import { el } from 'date-fns/locale';
// import seedrandom from 'seedrandom';
const activeNames = ref(1);
const dailyWords:any = ref([]);
// const jsonData = ref([]);
const active = ref(0);
const pageSize = ref(1); // 每页显示的数据量
const currentPage = ref(1);
const paginatedData: any = ref([]);
const dataLength = ref(0);
// 声明 searchValue 变量
const searchValue = ref(""); // 请确保适当初始化 searchValue
const tabs = [
  { title: '新添加', type: 0 },
  { title: '已记忆', type: 1 },
  { title: '需巩固', type: 2 },
  { title: '随心记', type: 3 },
];
// 单词识别
const wordShow = ref(false);
const wordShowID = ref(0);
const wordShowValue = ref("");
const wordType = ref(0);
function openPopup(id:number) {
  wordShow.value = true;
  wordShowID.value = id;
  db.selectWordTable.get(id).then((item:any) => {
    wordShowValue.value = item.sw
  });
}
// 创建画布
const esign:any = ref(null);
const clearCanvas = () => {
  // esignRef.value.reset();
  esign.value?.reset()
};
// 获取所有单词
async function getAllItems(type: number|undefined) {
  try {
    // 获取当前时间戳
    const currentTimeStamp = Date.now();
    let filterItems:any = [];
    if (type === 2) {
      // 获取数据：type 等于 3 且 level 不为 0 的数据
      const dbfilterItems = await db.selectWordTable
        .where('type')
        .equals(type || 0)
        .and((item:any) => item.level !== 0)
        .toArray();
      // 根据条件筛选数据
      filterItems = dbfilterItems.filter((item:any) => {
        // 计算天数，假设 datetime 是以毫秒为单位的时间戳
        const daysDiff = Math.floor((currentTimeStamp - item.datetime) / (24 * 60 * 60 * 1000));
        // 计算 level 对应的 2 次幂
        const levelPower = Math.pow(item.level,2);
        // 筛选出天数大于等于 level 2 次幂的数据
        // console.log(daysDiff, levelPower);
        return daysDiff >= levelPower;
      });
    }else {
      filterItems = await db.selectWordTable.where('type').equals(type || 0).toArray();
    }
    
    // console.log(filterItems.length);
    // 在 computed 外部定义 computed 属性，以便在其他地方使用
    paginatedData.value = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      if (!searchValue.value) {
        dataLength.value = filterItems.length;
        return filterItems.slice(startIndex, endIndex);
      } else {
        // 使用 filter 方法筛选包含 searchValue 的数据项
        const filterData = filterItems.filter((item: { sw: string|any[]; }) => {
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
watch(active, (newActive:number) => {
  // console.log(newActive);
  if (newActive === 0) {
    pageSize.value = 1;
    wordType.value = 0;
  }
  else if (newActive === 1) {
    pageSize.value = 20;
    wordType.value = 1;
  }
  else if (newActive === 2) {
    pageSize.value = 10;
    wordType.value = 2;
  }
  else if (newActive === 3) {
    // console.log(jsonData.value);
  }
  getAllItems(tabs[newActive].type);
  currentPage.value = 1; // 重置页数
});
onMounted(async () => {
  // console.log(tabs[0])
  // loadJSON();
  // generateDailyWords();
  await getAllItems(tabs[0].type);
});
// 删除单词
async function deleteItem(id: number) {
  // 如果找到匹配的单词，执行删除操作
  await db.selectWordTable.delete(id);
  // console.log('Deleted item with sw:', id);
  // 删除后刷新数据
  // console.log(tabs[0].type)
  await getAllItems(wordType.value);
}
// 更新单词信息
async function rememberItem(id:number) {
  // 如果找到匹配的单词，执行更新type
  showToast('不错，加入【已记忆】');
  await db.selectWordTable.update(id, {
    type: 1,
  });
  await getAllItems(wordType.value);
}
async function forgetItem() {
  showToast('没关系，一天后【需巩固】');
  wordShow.value = false;
  // 如果找到匹配的单词，执行更新type
  await db.selectWordTable.update(wordShowID.value, {
    type: 2,
    datetime: Date.now(),
    level: 1
  });
  await getAllItems(wordType.value);
}
async function rightItem() {
  showToast('可以！加入【需巩固】');
  wordShow.value = false;
  // 如果找到匹配的单词，执行更新type
  const level:number = await db.selectWordTable.get(wordShowID.value).then((item:any) => {
    return item.level
  })
  await db.selectWordTable.update(wordShowID.value, {
    type: 2,
    level: level+1
  });
  await getAllItems(wordType.value);
}
// const loadJSON = async () => {
//   try {
//     const response = await fetch('/word_dict_all.json');
//     const data = await response.json();
//     jsonData.value = data;
//     // console.log(data);
//   } catch (error) {
//     console.error('加载JSON文件时发生错误:', error);
//   }
// };

// const generateDailyWords = () => {
//   const currentDate = new Date();
//   const dateString = format(currentDate, 'yyyy-MM-dd');
//   const seed = dateString;

//   // 使用随机种子直接选择单词，无需排序
//   // console.log(jsonData);
//   const shuffledWords = [...jsonData.value];
//   const random = seedrandom(seed);
//   const selectedWords:any = [];
//   while (selectedWords.length < 20 && shuffledWords.length > 0) {
//     const randomIndex = Math.floor(random() * shuffledWords.length);
//     selectedWords.push(shuffledWords.splice(randomIndex, 1)[0]);
//   }
//   dailyWords.value = selectedWords;
//   // console.log(shuffledWords);
// };
function formatNewlines(text: string) {
  return text.replace(/\n/g, '<br>');
}
function handlePageChange(newPage: number) {
  currentPage.value = newPage;
}
</script>
<style scoped>
.esign-container {
  border: 1px solid #b900decc; /* 边框样式，可以根据需要自定义 */
  padding: 10px; /* 可选的内边距，以增加边框与画布之间的间距 */
}
.newline-cell .van-cell__title {
  white-space: pre-line;
}
</style>
