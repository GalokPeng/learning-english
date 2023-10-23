import Dexie from 'dexie';

class PLearningEnglish extends Dexie {
  selectWordTable: Dexie.Table<WordData, number>;

  constructor() {
    super('PLearningEnglish');
    this.version(1).stores({
      selectWordTable: '++id,word,sw,phonetic,translation,definition,tag,datetime,type,level,isSelect',
    });
    this.selectWordTable = this.table('selectWordTable');
  }
}

interface WordData {
  id?: number;
  word: string;
  sw: string;
  phonetic: string;
  translation: string;
  definition: string;
  tag: any;
  datetime:number;
  type:number;
  level:number;
  isSelect:boolean;
}

export const db = new PLearningEnglish();
