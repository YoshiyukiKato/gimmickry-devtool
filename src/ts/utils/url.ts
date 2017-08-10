export default {
  parse : (urlstr:string) => {
    let urlobj:any = {};
    let urlparts = urlstr.split("?");
    urlobj.baseurl = urlparts[0];
    if (urlparts.length > 1) {
      let paramStrs = urlparts[1].split("&");
      urlobj.params = paramStrs.reduce((params:any, paramStr:string) => {
        let kv = paramStr.split("=");
        params[kv[0]] = kv[1];
        return params;
      }, {});
    }
    return urlobj;
  },
  stringify : (urlobj:any) => {
    const paramstr = urlobj.params ? "?" + Object.keys(urlobj.params).map((key) => {
      return `${key}=${urlobj.params[key]}`;
    }).join("&") : "";
    return urlobj.baseurl + paramstr;
  }
};