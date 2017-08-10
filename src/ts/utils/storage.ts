export default {
  init : function(){
    return chrome && chrome.storage ? chrome.storage.local : new MockStorage();
  }
}

class MockStorage{
  data:any;
  constructor(){
    this.data = {}
  }

  get(keys: string | string[] | Object | null, callback: (items: { [key: string]: any }) => void){
    if(!keys) return;
    if(typeof keys === "string") keys = [keys];
    if(Array.isArray(keys)){
      const vals:any = keys.reduce((acc:any, key:string) => {
        acc[key] = this.data[key];
        return acc;
      }, {});
      callback(vals);
    }
  }
  
  set(items: Object, callback?: () => void){
    this.data = Object.assign(this.data, items);
  }
}