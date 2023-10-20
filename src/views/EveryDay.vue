<template>
  <div>
    <van-collapse v-model="activeNames" accordion>
      <van-collapse-item
        v-for="(item) in dailyWords"
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { format } from 'date-fns';
import seedrandom from 'seedrandom';
const activeNames = ref(1);
const jsonData = ref([]);
const dailyWords = ref([]);

onMounted(async () => {
  await loadJSON();
  generateDailyWords();
});

const loadJSON = async () => {
  try {
    const response = await fetch('/src/data/word_dict_all.json');
    const data = await response.json();
    jsonData.value = data;
  } catch (error) {
    console.error('加载JSON文件时发生错误:', error);
  }
};

const generateDailyWords = () => {
  const currentDate = new Date();
  const dateString = format(currentDate, 'yyyy-MM-dd');
  const seed = dateString;

  // 使用随机种子直接选择单词，无需排序
  const shuffledWords = [...jsonData.value];
  const random = seedrandom(seed);
  const selectedWords = [];
  while (selectedWords.length < 20 && shuffledWords.length > 0) {
    const randomIndex = Math.floor(random() * shuffledWords.length);
    selectedWords.push(shuffledWords.splice(randomIndex, 1)[0]);
  }

  dailyWords.value = selectedWords;
};
function formatNewlines(text) {
  return text.replace(/\n/g, '<br>');
}
</script>
