chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.type === "init"){
    chrome.storage.local.get(["localGimmicks", "localUsers"], (data) => {
      const gimmicks = (data.localGimmicks || []).map((g)=>{ g.type = "local"; return g; }).filter((g) => { 
        if(g.targetURL){
          return g.status && sender.tab.url.match(new RegExp(g.targetURL));
        }
      });
      
      const user = (data.localUsers || []).reduce((user, u) => {
        if(u && u.targetURL && u.status && sender.tab.url.match(new RegExp(u.targetURL))){
          try{
            let attrs = JSON.parse(u.attrs);
            user[u.name] = attrs;
          }catch(e){
            //nothing todo when the u.attrs is invalid
          }
        }
        return user;
      }, {});
      chrome.tabs.sendMessage(sender.tab.id, { gimmicks : gimmicks, user : user }, function(response) {});
    });
  }
});

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