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
          <van-swipe-cell v-for="item in paginatedData.value" :key="item.id">
            <van-collapse-item
              :key="item.word"
              :title="item.word"
              :name="item.word"
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
            <van-row>
              <van-col span="8">
                <van-button round size="small" type="success" block @click="doNotKnow(item.id)">
                  <template v-if="wordType === 0 || wordType === 2" >
                    不认识
                  </template>
                  <template v-else-if="wordType === 1">
                    忘记了
                  </template>
                </van-button>
              </van-col>
              <van-col span="8">
                <van-button round size="small" type="success" block @click="impressive(item.id)">
                  <template v-if="wordType === 0 || wordType === 2" >
                    有印象
                  </template>
                  <template v-else-if="wordType === 1">
                    熟悉了
                  </template>
                </van-button>
              </van-col>
              <van-col span="8">
                <van-button round size="small" type="success" block @click="mastered(item.id)">掌握的</van-button>
              </van-col>
            </van-row>
          </van-swipe-cell>
        </van-collapse>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
// import { showToast } from 'vant';
import { format } from 'date-fns';
import { db } from '../database';
import seedrandom from 'seedrandom';
const activeNames = ref(1);
const active = ref(0);
const pageSize = ref(1); // 每页显示的数据量
const currentPage = ref(1);
const paginatedData: any = ref([]);
const dataLength = ref(0);
// 声明 searchValue 变量
const searchValue = ref(""); // 请确保适当初始化 searchValue
const tabs = [
  { title: '自主记', type: 0 },
  { title: '复习词', type: 1 },
  { title: '每日记', type: 2 },
];
// 单词识别
const wordType = ref(0);
// 获取所有单词
async function getAllItems(type: number|undefined) {
  try {
    // 获取当前时间戳
    const currentTimeStamp = Date.now();
    let filterItems:any = [];
    if (type === 1) {
      // 获取数据：type 等于 3 且 level 不为 0 的数据
      const dbfilterItems = await db.selectWordTable
        .where('type')
        .equals(type || 1)
        .toArray();
      // 根据条件筛选数据
      // console.log(dbfilterItems)
      filterItems = dbfilterItems.filter((item:any) => {
        // 计算天数，假设 datetime 是以毫秒为单位的时间戳
        const daysDiff = Math.floor((currentTimeStamp - item.datetime) / (24 * 60 * 60 * 1000));
        // 计算 level 对应的 2 次幂
        let levelPower = 0
        if (item.level === 0) {
          levelPower = 1;
        }else if (item.level === 1) {
          levelPower = 3;
        }else if (item.level === 2) {
          levelPower = 7;
        }
        else{
          levelPower = Math.pow(item.level,2);
        }
        // 筛选出天数大于等于 levelPower 的数据
        return daysDiff >= levelPower;
      });
    }else if (type === 0) {
      filterItems = await db.selectWordTable.where('type').equals(type || 0).and((item:any) => item.isSelect).toArray();
    }else if (type === 2) {
      filterItems = await db.selectWordTable.where('type').equals(type || 2).and((item:any) => item.isSelect).toArray();
      const currentDate = new Date();
      const dateString = format(currentDate, 'yyyy-MM-dd');
      const seed = dateString;
      // 使用随机种子直接选择单词，无需排序
      // console.log(jsonData);
      const dbPlanWords = await db.selectWordTable.where('type').equals(0).and((item:any) => item.isSelect).toArray();
      const shuffledWords = [...dbPlanWords];
      const random = seedrandom(seed);
      const selectedWords:any = [];
      // let defaultLength: number = 20;
      dataLength.value = 20;
      // 如果length不等于0，
      if (filterItems.length !== 0) {
        // // 计算第一个单词datetime与当前时间戳的差值
        // dataLength.value = filterItems.length;
        // const daysDiff = Math.floor((currentTimeStamp - filterItems[0].datetime) / (24 * 60 * 60 * 1000));
        // // 如果第一个单词的天数大于 1，则再随机取20减去filterItems.length个单词
        // if (daysDiff > 1) {

        // }
      }else{
        // console.log(dbPlanWords);
        while (selectedWords.length < 20 && shuffledWords.length > 0) {
          const randomIndex = Math.floor(random() * shuffledWords.length);
          // 随机选择一个单词，并将该单词在数据库中的type设定为2
          const randomWord:any = shuffledWords.splice(randomIndex, 1)[0]
          selectedWords.push(randomWord);
          // 数据库中的该单词type设定为2
          await db.selectWordTable.update(randomWord.id, { type: 2, datetime: Date.now() });
        }
        filterItems = await selectedWords;
      }
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
        const filterData = filterItems.filter((item: {
          translation: any; word: string|any[]; }) => {
          // console.log(item);
          // 根据你的匹配逻辑来判断是否保留 item
          return item.word?.includes(searchValue.value.toLowerCase()) 
          || item.translation?.includes(searchValue.value.toLowerCase()); // 例如，假设要匹配某个属性
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
    wordType.value = 0;
  }
  else if (newActive === 1) {
    wordType.value = 1;
  }
  else if (newActive === 2) {
    wordType.value = 2;
  }
  currentPage.value = 1; // 重置页数
  getAllItems(tabs[newActive].type);
});
onMounted(async () => {
  // console.log(tabs[0])
  await getAllItems(tabs[0].type);
});
// 删除单词
async function deleteItem(id: number) {
  // 如果找到匹配的单词，执行删除操作
  await db.selectWordTable.delete(id);
  // 删除后刷新数据
  // console.log(tabs[0].type)
  await getAllItems(wordType.value);
}
function formatNewlines(text: string) {
  return text.replace(/\n/g, '<br>');
}
function handlePageChange(newPage: number) {
  currentPage.value = newPage;
}
function doNotKnow(id: number) {
  db.selectWordTable.update(id, { type: 1 , level: 0, datetime: Date.now()});
  getAllItems(wordType.value);
  // showToast('一天后再来试试吧!');
}

function impressive(id: number) {
  // 获取该条数据的level
  const WordData: any = db.selectWordTable.where('id').equals(id).first()
  let levelValue: number =WordData.level;
  levelValue += 1;
  db.selectWordTable.update(id, { type: 1 , level: levelValue, datetime: Date.now()});
  getAllItems(wordType.value);
  // showToast('坚持！到时候复习');
}
function mastered(id: number) {
  const WordData: any = db.selectWordTable.where('id').equals(id).first()
  let levelValue: number =WordData.level;
  levelValue += 2;
  db.selectWordTable.update(id, { type: 1 , level: levelValue, datetime: Date.now()});
  getAllItems(wordType.value);
  // showToast('过段时间再出来');
}
</script>
<style scoped>
</style>
