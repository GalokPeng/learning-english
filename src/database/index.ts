import Dexie from 'dexie';

class PLearningEnglish extends Dexie {
  selectWordTable: Dexie.Table<WordData, number>;

  constructor() {
    super('PLearningEnglish');
    this.version(1).stores({
      selectWordTable: '++id, sw, phonetic,translation,definition,datetime,type,level',
    });
    this.selectWordTable = this.table('selectWordTable');
  }
}

interface WordData {
  id?: number;
  sw: string;
  phonetic: string;
  translation: string;
  definition: string;
  datetime:number;
  type:number;
  level:number;
}

export const db = new PLearningEnglish();
