import {App} from "gimmickry";

if(!window.__importUser__ && !window.__importView__){
  const app = new App();
  if(window.__importUser__ && window.__importView__){
    console.log("Dev app is initialized");
  }else{
    console.log("There are something wrong...");
  }
}