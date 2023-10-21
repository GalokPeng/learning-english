<template>
  <div>
    <van-cell-group>
      <van-cell title="版本" value="v1.1.0" />
      <van-cell title="导航" is-link url="https://pgxcg.tk" />
      <van-cell title="占用空间" :value="dataBig.valueOf()"/>
    </van-cell-group>
  </div>
  <van-collapse v-model="activeNames">
    <van-swipe-cell>
        <template #left>
          <van-button square type="primary" text="选择" />
        </template>
        <van-collapse-item title="test_test" name="test_test">
          单词全不背，代码敲不停。
        </van-collapse-item>
        <template #right>
          <van-button square type="danger" text="删除" />
        </template>
    </van-swipe-cell>
  </van-collapse>
  <!-- <div>
    <button @click="addItem">Add Item</button>
    <button @click="getAllItems">Get All Items</button>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.sw }}: {{ item.phonetic }}</li>
    </ul>
  </div> -->
</template>
<script setup lang="ts">
import { ref, onMounted} from 'vue';
const activeNames = ref([]);
// const items = ref<WordData[]>([]);
// const datetime = Date.now()
// async function addItem() {
//   const newItem: WordData = {
//     sw: "test",
//     phonetic: "string",
//     translation: "string",
//     definition: "string",
//     datetime:datetime,
//     type:0
//   };
//   const id = await db.selectWordTable.add(newItem);
//   console.log('Added item with ID:', id);
// }

// async function getAllItems() {
//   items.value = await db.selectWordTable.toArray();
// }
// 打开或创建IndexedDB数据库
const dbName = 'PLearningEnglish'; // 替换成你的数据库名称
const request = indexedDB.open(dbName);
const dataBig = ref("");
request.onsuccess = function(event) {
  const db = event.target.result;

  // 获取数据库的事务对象
  const transaction = db.transaction(db.objectStoreNames, 'readonly');

  // 获取数据库的所有Object Store
  const objectStores = Array.from(transaction.db.objectStoreNames);

  // 初始化总空间变量
  let totalSpace = 0;

  // 遍历每个Object Store并获取其占用的空间
  objectStores.forEach(storeName => {
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAllKeys();

    request.onsuccess = function() {
      const keys = request.result;
      const storeSpace = keys.reduce((space, key) => {
        return space + key.toString().length;
      }, 0);
      dataBig.value = `${(storeSpace/1024).toFixed(3)} KB`
      console.log(`Object Store "${storeName}" 占用空间: ${(storeSpace/1024).toFixed(3)} KB`);
      totalSpace += storeSpace;
    };
  });
  // // 输出总空间
  // console.log(`数据库总空间占用: ${totalSpace} 字节`);
};

request.onerror = function(event) {
  console.error('无法打开数据库:', event.target.error);
};

</script>
