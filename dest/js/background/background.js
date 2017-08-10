chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.type === "init"){
    chrome.storage.local.get(["localGimmicks", "remoteGimmicks", "remoteGimmickStatus"], (data) => {
      const remote = (data.remoteGimmicks || []).map((g)=>{
        g.type = "remote";
        g.status = (data.remoteGimmickStatus || {})[g.id];
        return g;
      });

      const local = (data.localGimmicks || []).map((g)=>{ g.type = "local"; return g; });
      const gimmicks = local.concat(remote).filter((g) => { 
        if(g.targetURL){
          return g.status && sender.tab.url.match(new RegExp(g.targetURL));
        }
      });
      chrome.tabs.sendMessage(sender.tab.id, { gimmicks : gimmicks }, function(response) {});
    });
  }

  if(request.type === "validate"){
    const req = {
      method : "GET",
      url : "https://s3-ap-northeast-1.amazonaws.com/gizmo-assets/private/secret.txt",
    };
    sendHTTPRequest(req)
    .then((secret) => {
      chrome.tabs.sendMessage(sender.tab.id, { secret : secret }, function(response) {});
    })
    .catch((err) => {
      chrome.tabs.sendMessage(sender.tab.id, { secret : null }, function(response) {});
    });
  }

  if(request.type === "auth"){
    chrome.tabs.onUpdated.addListener(handleAuth);
    chrome.tabs.create({ url : "https://ghe.rjbdev.jp/login/oauth/authorize?client_id=70585b49c0ed2b265a7f&scopes=user repo&state=hoge" });
  }
});

function handleAuth(tabId, changeInfo, tab){
  const urlobj = URL.parse(tab.url);
  if(urlobj.baseurl === "chrome-extension://ckhoahonlanihklpdbnckghblophikba/auth_callback.html"){
    //close tab
    chrome.tabs.remove(tabId);
    if(urlobj.params.code){      
      const url = URL.stringify({
        baseurl : "https://ghe.rjbdev.jp/login/oauth/access_token",
        params : {
          client_id : "70585b49c0ed2b265a7f",
          client_secret : "9e5087a1125d35cc50bd92c37b819e8ecc99a63d",
          code : urlobj.params.code
        }
      });
      
      sendHTTPRequest({ 
        headers : { 
          "Accept" : "application/json",
          "Content-Type" : 'application/x-www-form-urlencoded; charset=utf-8'
        }, 
        method : "POST", url : url })
      .then((xhr) => {
        chrome.tabs.onUpdated.removeListener(handleAuth);
        const result = JSON.parse(xhr.response);
        chrome.storage.local.set({ ghe_token : result.access_token });
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }
}

function sendHTTPRequest(req) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.onload = (data) => {
      if (xhr.readyState === 4) resolve(xhr);
    };
    xhr.onerror = reject;
    xhr.open(req.method, req.url, true);
    if (req.headers) {
      Object.keys(req.headers).forEach((header) => {
        xhr.setRequestHeader(header, req.headers[header]);
      });
    }
    xhr.send(req.body);
  });
}

const URL = {
  parse: (urlstr) => {
    let urlobj = {};
    let urlparts = urlstr.split("?");
    urlobj.baseurl = urlparts[0];
    if (urlparts.length > 1) {
      let paramStrs = urlparts[1].split("&");
      urlobj.params = paramStrs.reduce((params, paramStr) => {
        let kv = paramStr.split("=");
        params[kv[0]] = kv[1];
        return params;
      }, {});
    }
    return urlobj;
  },
  stringify : (urlobj) => {
    const paramstr = urlobj.params ? "?" + Object.keys(urlobj.params).map((key) => {
      return `${key}=${urlobj.params[key]}`;
    }).join("&") : "";
    return urlobj.baseurl + paramstr;
  }
};