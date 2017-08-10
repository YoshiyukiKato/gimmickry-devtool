import Gim from "../../../lib/gimmickry";

if(!window.__importUser__ && !window.__importView__){
  const app = new Gim.App();
  if(window.__importUser__ && window.__importView__){
    console.log("Dev app is added!");
  }else{
    console.log("There are something wrong...");
  }
}