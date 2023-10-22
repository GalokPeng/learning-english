<template>
  <div>
    <van-cell-group>
      <van-cell title="版本" value="v1.2.0" />
      <van-cell title="导航" is-link url="https://pgxcg.tk" />
      <van-cell title="占用空间" :value="dataBig.valueOf()"/>
    </van-cell-group>
  </div>
  <van-collapse v-model="activeNames" accordion>
    <van-collapse-item title="关于" name="关于">
      <div>copyright © 2023 皮革新茶馆</div>
      <van-rate v-model="likeme" icon="like" void-icon="like-o" />
    </van-collapse-item>
    <van-collapse-item title="更新日志" name="更新日志">
      <div style="white-space: normal;">
        1、主页：<br/>
        2、分类:<br/>
         - 单词可以右滑添加<br/>
         - 搜索功能：中英文搜索<br/>
        3、每日记词：<br/>
         - 新增单词可以左滑删除<br/>
         - 点击记住了加入在【已经记忆】<br/>
         - 需巩固页面会按时间推算提示需要加强记忆的单词<br/>
        4、个人中心：<br/>
        -修复若干BUG...
      </div>
    </van-collapse-item>
  </van-collapse>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const activeNames = ref([]);
const likeme = ref(3);
// 打开或创建IndexedDB数据库
const dbName = 'PLearningEnglish'; // 替换成你的数据库名称
const request = indexedDB.open(dbName);
const dataBig = ref("");
request.onsuccess = function(event) {
  const db = (event.target as IDBRequest).result;
  // 获取数据库的事务对象
  const transaction = db.transaction(db.objectStoreNames, 'readonly');
  // 获取数据库的所有Object Store
  const objectStores = Array.from(transaction.db.objectStoreNames);
  // 初始化总空间变量
  // let totalSpace = 0;
  // 遍历每个Object Store并获取其占用的空间
  objectStores.forEach(storeName => {
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAllKeys();

    request.onsuccess = function() {
      const keys = request.result;
      const storeSpace = keys.reduce((space: any, key: any) => {
        return space + key.toString().length;
      }, 0);
      dataBig.value = `${(storeSpace/1024).toFixed(3)} KB`
      console.log(`Object Store "${storeName}" 占用空间: ${(storeSpace/1024).toFixed(3)} KB`);
      // totalSpace += storeSpace;
    };
  });
  // // 输出总空间
  // console.log(`数据库总空间占用: ${totalSpace} 字节`);
};

request.onerror = function(event) {
  console.error('无法打开数据库:', (event.target as IDBRequest).error);
};

</script>
<style scoped>
.custom-indicator {
  position: absolute;
  right: 5px;
  bottom: 5px;
  padding: 2px 5px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.1);
}
.my-swipe .van-swipe-item {
  color: #ffffff;
  font-size: 20px;
  line-height: 50vh;
  /* text-align: center; */
  background-color: #e6d1ff;
}
canvas {
  width: 100%;
  height: 400px;
  border: 1px solid #000;
}
</style>