import {App} from "gimmickry";

if(!window.__import_user_attrs_value__ 
  && !window.__import_user_attr__
  && !window.__import_view_component__){
  const app = new App();
  if(window.__import_user_attrs_value__ 
  && window.__import_user_attr__
  && window.__import_view_component__){
    console.log("[gimmickry-devtool] Dev app is initialized");
  }else{
    console.log("[gimmickry-devtool] There are something wrong...");
  }
}