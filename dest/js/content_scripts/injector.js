init();

function init(){
  chrome.storage.local.get("status", (result) => {
    if(result.status){
      setup()
      .then(loadScripts)
      .catch((err) => {
        console.log(err);
      });
    }
  });
}

function setup(){
  const getapp = new Promise((resolve, reject) => {
    chrome.storage.local.get("localApps", (result) => {
      const items = result.localApps;
      if(!items) resolve();
      let item, appitem;
      for(let i = 0; i < items.length; i++){
        item = items[i];
        if(location.hostname.match(new RegExp(item.targetURL))){
          appitem = item;
        };
      }
      resolve(appitem);
    });
  });
  
  return getapp
  .then((item) => {
    if(item && item.source){
      return item.source;
    }else{
      const url = chrome.runtime.getURL("./js/content_scripts/init.js")
      return request(url);
    }
  })
  .then((payload) => {
    const script = document.createElement("script");
    script.innerHTML = payload;
    document.body.appendChild(script);
  })
}

function request(url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.statusText);
        }
      }
    };

    xhr.onerror = function (e) {
      reject(xhr.statusText);
    };
    xhr.send(null);
  });
}

function loadScripts(){
  const message = { type : "init" };
  chrome.runtime.sendMessage(message, function(response){});
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message && message.user){
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.innerHTML = `window.__import_user_attrs_value__(${JSON.stringify(message.user)})`;
      document.body.appendChild(script);
    }
    
    if(message && message.gimmicks){
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.innerHTML = message.gimmicks.map((gimmick) => {
        return `window.__import_view_component__("${gimmick.name}", (user) => { ${gimmick.script} })`;
      }).join("\n");
      document.body.appendChild(script);
    }
  });
}

