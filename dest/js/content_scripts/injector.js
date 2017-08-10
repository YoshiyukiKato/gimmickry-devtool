init();

function init() {
  gimmify().then(loadScripts)
  .catch((err) => {
    console.log(err);
  });
}

//gimmickryの__importUser__と__importView__がなかったら勝手に突っ込む
function gimmify(){
  const url = chrome.runtime.getURL("./js/content_scripts/init.js")
  return request(url)
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

//スクリプトのリストを読み出して突っ込む
function loadScripts(){
  const message = { type : "init" };
  chrome.runtime.sendMessage(message, function(response){});
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message && message.gimmicks){
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.innerHTML = message.gimmicks.map((gimmick) => {
        return `window.__importView__("${gimmick.name}", (user) => { ${gimmick.script} })`;
      }).join("\n");
      document.body.appendChild(script);
    }
  });
}

