var baseUrls = {
  development: "https://api.99date.hudongco.com",
  production: "https://prod.api.99date.hudongco.com",
  preview: "https://preview.api.99date.hudongco.com"
};

function render(templateId, templateData, target) {
  var html = template(templateId, templateData);
  target.innerHTML += html;
}

  function dateFormat(date, fmt) {
    date = new Date(date);
    var o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds()
    };

    // 补全0
    function padLeftZero(str) {
      return ('00' + str).substr(str.length);
    }

    // 年份
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    // 月日时分秒
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        var str = o[k] + '';
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
      }
    }

    date = o = padLeftZero = null;
    return fmt;
  }

function convert(_url) {
  var patt = /\d+/;
  var num = _url.match(patt);
  var rs = {};
  rs.uid = num[0];
  return rs;
}

// 传递分享信息给客户端,showUrl为分享的页面链接,为空时表示不分享
// function shareInfo () {
//   var _url = 'https://api.kawayisound.xyz/modules/bonus/fight.html';
//   var res = EnvCheck();
//   if (res == 'test'){
//     _url = 'http://apibeta.kawayisound.xyz/modules/bonus/fight.html';
//   }
//   var info = {
//     title: '99约与你一起红',
//     imgUrl: 'https://img.erbanyy.com/qingxunlogo-256.png',
//     desc: '登录即送20红包，每天还有分享红包，邀请红包，分成红包，四重红包大礼等你来拿',
//     showUrl: _url
//   };
//   return JSON.stringify(info);
// }

// 根据域名适配环境
function EnvCheck() {
  if (window.location.href) {
    var _url = window.location.href;
    var res = _url.match(/prod/);
    if (res) {
      return 'live';
    } else {
      return 'test';
    }
  }
}

// 根据域名判断是本地打开还是服务器打开
function locateJudge() {
  if (window.location.href) {
    var _url = window.location.href;
    // var res = _url.match(/view|beta|localhost|127.0.0.1|192.168.1.120|api.99date.hudongco.com/);
    var res = _url.match(/prod/) ? baseUrls['production'] : _url.match(/preview/) ? baseUrls['preview'] : baseUrls['development']
    return res;
  }
}

// 获取地址栏参数
function getQueryString() {
  var _url = location.search;
  var theRequest = new Object();
  if (_url.indexOf('?') != -1) {
    var str = _url.substr(1);
    strs = str.split('&');
    for (var i in strs) {
      theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
    }
  }
  return theRequest;
}

// 判断浏览器内核，手机类型
function checkVersion() {
  var u = navigator.userAgent,
    app = navigator.appVersion;
  return {
    trident: u.indexOf('Trident') > -1, //IE内核
    presto: u.indexOf('Presto') > -1, //opera内核
    webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
    mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
    android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
    iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
    iPad: u.indexOf('iPad') > -1, //是否iPad
    webApp: u.indexOf('Safari') > -1, //是否web应该程序，没有头部与底部
    weixin: u.indexOf('MicroMessenger') > -1, //是否微信
    qq: u.match(/\sQQ/i) == " qq", //是否QQ
    tutuApp: u.match('tutuApp'),
    app: u.match('tutuApp') //是否在app内
  };
}

// 图片预加载
function preloadImage(obj) {
  var loadLength = 0,
    newImages = [];
  for (var i = 0; i < obj.imageArr.length; i++) {
    newImages[i] = new Image();
    newImages[i].src = obj.imageArr[i];
    newImages[i].onload = newImages[i].onerror = function () {
      loadLength++;
      typeof obj.preloadPreFunc === 'function' && obj.preloadPreFunc(loadLength);
      if (loadLength == obj.imageArr.length) {
        typeof obj.doneFunc === 'function' && obj.doneFunc();
      }
    }
  }
}

// 判断是否在App内
function isApp() {
  var androidBol = false;
  var osBol = false;
  if (window.androidJsObj && typeof window.androidJsObj === 'object') {
    androidBol = true;
  }
  if (window.webkit) {
    console.log(window.webkit);
    osBol = true;
  }
  return (androidBol || osBol);

}

function UrlSearch() {
  var name, value;
  var str = location.href;
  var num = str.indexOf("?")
  str = str.substr(num + 1);
  var arr = str.split("&");
  for (var i = 0; i < arr.length; i++) {
    num = arr[i].indexOf("=");
    if (num > 0) {
      name = arr[i].substring(0, num);
      value = arr[i].substr(num + 1);
      this[name] = value;
    }
  }
  return value;
}

function erbanMask(channel,tags,params) {
  //此函数用于一般的99约底层面罩
  var browser = checkVersion();
  var env = EnvCheck();
  // params = params? params:0;
  var bol = $.isEmptyObject(params);
  var keyId = "49eb9d222e81bafce13738b9763b9e83";
  if (browser.ios) {
    if (env == 'test') {
      // keyId = '33f560a83c9c40d465711c0038653ca0'
      keyId = '49eb9d222e81bafce13738b9763b9e83';
    }
    console.log('ios_linkedme_keyId:',keyId)
  }
  var jsonStr = '';
  if (!bol) {
    jsonStr = JSON.stringify(params);
  }
  if (!browser.app) {
    $('#mask').css('display', 'flex');
    var linkData = {
      type: env,
      channel: channel,
      tags: tags,
      // ios_custom_url: "https://itunes.apple.com/cn/app/id1252542069?mt=8",
      params: jsonStr
    };

    linkedme.init(keyId, {
      type: env
    }, null);
    
    linkedme.link(linkData, function (err, response) {
      if (err) {
        // 生成深度链接失败，返回错误对象err
        console.log('err:', err);
      } else {
        console.log(response);
        $('#download a').attr("href", response.url);
        $('.download a').attr('href', response.url);
      }
    }, false);
  } else {
    $('#mask').hide();
  }
}

function wxConfig() {
  var wxurl = encodeURIComponent(location.href.split('#')[0]);
  var data = "url=" + wxurl;
  console.log(data);
  $.ajax({
    type: 'GET',
    url: '/wx/config',
    data: data,
    asyc: true,
    success: function (data) {
      if (data.code = 200) {
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: 'wx009d793f92c24eec', // 必填，公众号的唯一标识
          timestamp: data.data.timestamp, // 必填，生成签名的时间戳
          nonceStr: data.data.nonceStr, // 必填，生成签名的随机串
          signature: data.data.signature, // 必填，签名，见附录1
          jsApiList: data.data.jsApiList // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        wx.error(function (res) {
          console.log('config error,msg:' + res);
        });
      }
    },
    error: function (res) {
      console.log('config error,msg:' + res);
    }
  })
}

function refreshWeb() {
  window.location.href = window.location.href;
}

function shareInfo(urlMsg) {
  if (urlMsg) {
    var env = EnvCheck();
    if (env == 'test') {
      return 'http://apibeta.kawayisound.xyz/' + urlMsg;
    } else {
      return 'https://api.kawayisound.xyz/' + urlMsg;
    }
  }
}

function initNav(obj) {
  if ($.isEmptyObject(obj)) {
    return;
  }
  var browser = checkVersion();
  if (browser.app) {
    if (browser.ios) {
      window.webkit.messageHandlers.initNav.postMessage(obj);
    } else if (browser.android) {
      var json = JSON.stringify(obj);
      window.androidJsObj.initNav(json);
    }
  }
}

var tools = {
  cookieUtils: {
    set: function (key, val, time) {
      var date = new Date();
      var expiresDays = time;
      date.setTime(date.getTime() + expiresDays * 24 * 3600 * 1000);
      document.cookie = key + '=' + val + ';expires=' + date.toGMTString();
    },

    get: function (key) {
      var getCookie = document.cookie.replace(/[ ]/g, "");
      var arrCookie = getCookie.split(';');
      var val;
      for (var i = 0; i < arrCookie.length; i++) {
        var arr = arrCookie[i].split('=');
        if (key === arr[0]) {
          val = arr[1];
          break;
        }
      }
      return val;
    },

    delete: function (key) {
      var date = new Date();
      date.setTime(date.getTime() - 10000);
      document.cookie = key + "+v; expires =" + date.toGMTString();
    }
  },

  nativeUtils: {
    jumpAppointPage: function (type, val) {
      // routerType  跳转名称
      // routerVal   跳转需要传的参数
      
      var browser = checkVersion();
      var jumpObj = {};
      jumpObj.routerType = routeTypeConstant[type];
      if(val) {
        jumpObj.routerVal = val;
      }

      if (browser.app) {
        if (browser.ios) {
          if (type.indexOf('_') > -1) {
            window.webkit.messageHandlers.jumpAppointPage.postMessage(jumpObj);
          } else {
            if(val) {
              window.webkit.messageHandlers.type.postMessage(val);
            } else {
              window.webkit.messageHandlers.type.postMessage(null);
            }
          }
        } else if (browser.android) {
          if (androidJsObj && typeof androidJsObj === 'object') {
            if (type.indexOf('_') > -1) {
              window.androidJsObj.jumpAppointPage(JSON.stringify(jumpObj));
            } else {
              if(val) {
                window.androidJsObj.type(val);
              } else {
                window.androidJsObj.type();
              }
            }
          }
        }
      }
    },

    getUid: function () {
      var browser = checkVersion();
      console.log(browser);
      var val;
      if (browser.app) {
        if (browser.ios) {
          val = tools.cookieUtils.get('uid');
        } else if (browser.android) {
          if (androidJsObj && typeof androidJsObj === 'object') {
            val = parseInt(window.androidJsObj.getUid());
          }
        }
      } else {
        var locate = getQueryString();
        if(!locate.uid && !locate.shareUid) {
          val = 901189;
        } else {
          if(locate.shareUid) {
            val = locate.shareUid;
          } else {
            val = locate.uid;
          }
        }
      }
      return val;

    },

    getTicket: function() {
      var browser = checkVersion();
      var val;
      if(browser.app) {
        if(browser.ios) {
          val = window.webkit.messageHandlers.getTicket.postMessage(null);
        } else if(browser.android) {
          if(androidJsObj && typeof androidJsObj === 'object') {
            val = window.androidJsObj.getTicket();
          }
        }
      } else {
        val = 'app外'
      }
      return val;
    }
  }
}

// 透明loading层
var $Loading = {
  count: 0,
  isFadeOut: false,
  show: function() {
    this.count++;
    if($('#loadingToast').length >= 1) {
      if (this.isFadeOut) {
        this.isFadeOut = false;
        $('#loadingToast').stop(true).fadeTo(0, 1);
      }
    } else {
      $('body').append('<div id="loadingToast" style="display: none; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 9999;"></div>')
      $('#loadingToast').fadeIn(100);
    }
  },
  hide: function() {
    this.count--;
    if (this.count === 0) {
      this.isFadeOut = true;
      $('#loadingToast').fadeOut(200, function() {
        $Loading.isFadeOut = false;
        $(this).remove();
      });
    }
  }
};
var requestBaseUrl = locateJudge();
// ajax
function request(type, option) {
  return $.ajax({
    type: type,
    url: requestBaseUrl + option.url,
    data: option.data,
    headers: option.headers,
    beforeSend: function(xhr) {
      !option.isHideLoading && $Loading.show();
    },
    success: function(res, status, xhr) {
      !option.isHideLoading && $Loading.hide();
      typeof option.success === 'function' && option.success(res, status, xhr);
    },
    error: function(xhr, status, error) {
      !option.isHideLoading && $Loading.hide();
      typeof option.error === 'function' && option.error(xhr, status, error);
    }
  })
}
// ajax get
function getJSON(option) {
  request('get', option)
}
// ajax post
function postJSON(option) {
  request('post', option);
}

// toast
function showToast(text){
  $(".toast").show().fadeTo(400, 1).find("span").text(text)
  setTimeout(function(){
    $(".toast").fadeTo(400, 0, function(){
      $(".toast").hide()
    })
  }, 1500)
}
