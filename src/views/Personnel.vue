<template>
  <van-collapse v-model="activeNames" accordion>
    <van-collapse-item title="关于" name="关于">
      <div>皮革新茶馆</div>
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
         - 底部导入单词<br/>
         - 页面会按时间推算提示需要加强记忆的单词<br/>
        4、个人中心：<br/>
         - 数据导入功能<br/>
        -修复若干BUG...
      </div>
    </van-collapse-item>
    <van-collapse-item title="数据导入" name="数据导入">
      <van-row>
        <van-col span="12">
          <van-button :loading="importLoading" loading-text="数据导入中..." type="primary" block @click="loadJSON">单词数据导入</van-button>
        </van-col>
        <van-col span="12">
          <van-button type="danger" block @click="deleteDB" :disabled="deleteButtonDisabled">删除单词数据</van-button>
        </van-col>
      </van-row>
    </van-collapse-item>
  </van-collapse>
  <div>
    <van-cell-group>
      <van-cell title="版本" value="v1.5.0" />
      <!-- <van-cell title="导航" is-link url="https://pgxcg.tk" /> -->
      <van-cell title="占用空间" :value="dataBig.valueOf()"/>
      <van-cell title="每日随机记词数量" value="20" disabled />
      <van-cell title="copyright © 2023 皮革新茶馆" disabled />
    </van-cell-group>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { db } from "../database";
import { showNotify } from 'vant';
const activeNames = ref();
const likeme = ref(3);
// 打开或创建IndexedDB数据库
const dbName = 'PLearningEnglish'; // 替换成你的数据库名称
const request = indexedDB.open(dbName);
const dataBig = ref("");
request.onsuccess = function(event) {
  try {
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
    request.result.close();
  }
  catch (error) {
    console.error('打开数据库时出错:', (event.target as IDBRequest).error);
    request.result.close();
  }
  // // 输出总空间
  // console.log(`数据库总空间占用: ${totalSpace} 字节`);
};
request.onerror = function(event) {
  console.error('无法打开数据库:', (event.target as IDBRequest).error);
  request.result.close();
};
// 数据导入
const importLoading: any = ref(false);
const deleteButtonDisabled: any = ref(false);
async function loadJSON() {
  // 初始化dexie数据库
  try {
    importLoading.value = true;
    deleteButtonDisabled.value = true;
    const response = await fetch('/word_dict_all.json');
    const data = await response.json();
    // 遍历每个单词，添加到 IndexedDB
    for (let i = 0; i < data.length; i++) {
      // 判断数据库中是否存在该单词
      const existingItem = await db.selectWordTable.where('word').equals(data[i].word).first();
      if (existingItem) {
        // console.log('已存在相同的单词')
        const percent = (((i+1)/data.length)*100).toFixed(2);
        showNotify({ type: 'success', message: '添加进度：' + percent + '%' });
        continue; // 如果已存在相同的 word，可以选择不添加或执行更新操作
      }
      data[i].datetime = Date.now();
      data[i].type = 0;
      data[i].level = 0;
      data[i].isSelect = false;
      await db.selectWordTable.add(data[i]);
      // 获取百分比，并保留小数
      const percent = (((i+1)/data.length)*100).toFixed(2);
      showNotify({ type: 'success', message: '添加进度：' + percent + '%' });
      // console.log('添加单词:' + i);
    }
    importLoading.value = false;
    deleteButtonDisabled.value = false;
  } catch (error) {
    console.error('加载数据时发生错误:', error);
    importLoading.value = false;
    deleteButtonDisabled.value = false;
    showNotify({ type: 'danger', message: '添加失败！' });
  }
}
async function deleteDB() {
  try {
    // 删除数据库
    await db.selectWordTable.clear();
    // 删除 IndexedDB
    await indexedDB.deleteDatabase(dbName);
    // 重新加载页面
    location.reload();
    showNotify({ type: 'success', message: '删除成功！请手动刷新页面！' });
  }
  catch (error) {
    showNotify({ type: 'danger', message: '删除失败!' });
  }
}
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
