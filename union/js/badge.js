var info = {};
var browser = checkVersion();
var env = EnvCheck();
var api = locateJudge();
var locateObj = getQueryString();

if(EnvCheck() == 'test'){
  var vConsole = new VConsole;
}


$(function () {
  if(browser.app){
    if(browser.ios){
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null);
      window.webkit.messageHandlers.getDeviceId.postMessage(null);
      window.webkit.messageHandlers.getRoomUid.postMessage(null);
      window.webkit.messageHandlers.getAppVersion.postMessage(null);
    }else if(browser.android){
      if(androidJsObj && typeof androidJsObj === 'object'){
        info.uid = parseInt(window.androidJsObj.getUid());
        info.ticket = window.androidJsObj.getTicket();
        info.deviceId = window.androidJsObj.getDeviceId();
        info.roomUid = parseInt(window.androidJsObj.getRoomUid());
        info.appVersion = window.androidJsObj.getAppVersion();
      }
    }
  }else{
    info.appVersion = "1.5.5"
  }

  setTimeout(function(){
    info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
    getUserDetail()
    getBadgeDetail()
  }, 100)


  $(".badge-upgrade .detail .btn").click(function(e){
    if($(e.target).data().type == 1 && $(e.target).hasClass("active")){
      getBadge(1)
    }else if($(e.target).data().type == 2 && $(e.target).hasClass("active")){
      getBadge(2)
    }else{
      return ;
    }
  })
})

// 用户详情
function getUserDetail(){
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: "user/get",
      params: {
        uid: info.uid
      }
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }
  }else{
    $.ajax({
      url: api + '/user/get',
      type: 'GET',
      data: {
        uid: info.uid
      },
      headers:{
        "pub_ticket": info.ticket
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          $(".user-img img").attr("src", res.data.avatar);
          $(".user-msg p:first").text(truncated(res.data.nick, 5));
          $(".user-msg p:last span").text("ID: " + res.data.erbanNo);
          // hasPrettyErbanNo
          (res.data.hasPrettyErbanNo)? $(".user-msg p:last img").eq(0).show() : $(".user-msg p:last img").eq(0).hide();
          // newUser
          (res.data.newUser)? $(".user-msg p:last img").eq(1).show() : $(".user-msg p:last img").eq(1).hide();
  
          switch(parseInt(res.data.unionMemberVo.tag)){
            case 0:{
              $(".nobadge").show()
              break;
            }
            case 1:{
              $(".silverbadge").show()
              break;
            }
            case 2:{
              $(".goldbadge").show();
              break;
            }
          }
        }
      },
      error(err) {
        console.log(err)
      }
    })
  }
}

// 勋章详情
function getBadgeDetail(){
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: "union/medalPromote/list"
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }    
  }else{
    $.ajax({
      url: api + "/union/medalPromote/list",
      type: "GET",
      headers:{
        "pub_ticket": info.ticket
      },
      success(res) {
        console.log(res);
        if(res.code == 200){
          (res.data[0].growth < 0)? $(".silver .line span").css("width", 0) : (res.data[0].growth > 0 && res.data[0].growth > 300000)? $(".silver .line span").css("width", "100%") :  $(".silver .line span").css("width", (res.data[0].growth/300000 * 100).toFixed(2) + "%");
          (res.data[1].growth < 0)? $(".gold .line span").css("width", 0) : (res.data[1].growth > 0 && res.data[1].growth > 600000)? $(".gold .line span").css("width", "100%") : $(".gold .line span").css("width", (res.data[1].growth/600000 * 100).toFixed(2) + "%");
  
          $(".silver .growNum i").text(res.data[0].growth)
          $(".gold .growNum i").text(res.data[1].growth)
  
          if(res.data[0].status == 0){
            $(".silver .detail .btn").text("未达标")
          }else if(res.data[0].status == 1){
            $(".silver .detail .btn").text("领取勋章").addClass("active")
          }else if(res.data[0].status == 2){
            $(".silver .detail .btn").text("已领取")
          }else if(res.data[0].status == 3){
            $(".silver .detail .btn").text("保级成功")
          }
  
          if(res.data[1].status == 0){
            $(".gold .detail .btn").text("未达标")
          }else if(res.data[1].status == 1){
            $(".gold .detail .btn").text("领取勋章").addClass("active")
          }else if(res.data[1].status == 2){
            $(".gold .detail .btn").text("已领取")
          }else if(res.data[1].status == 3){
            $(".gold .detail .btn").text("保级成功")
          }
        }
      },
      error(err) {
        console.log(err);
      }
    })
  }
}

// 领取勋章
function getBadge(btnType){
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: "union/drawMedalPromote",
      params: {
        type: btnType
      }
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }    
  }else{
    $.ajax({
      url: api + '/union/drawMedalPromote',
      type: 'GET',
      headers:{
        "pub_ticket": info.ticket
      },
      data: {
        type: btnType
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          $(".toast").show().fadeTo(400, 1).find("span").text("领取成功")
          setTimeout(function(){
            window.location.href = ""
          }, 1000)
        }
      },
      error(err) {
        console.log(err)
      }
    })
  }
}


// 防抖
function debounce(fn, wait){
  return function(){
    var context = this;
    var args = arguments;
    if(timeout !== null){
      clearTimeout(timeout)
    }
    timeout = setTimeout(function(){
      fn.apply(context, args)
    }, wait)
  }
}

// IOS回调方法
function getMessage(key, value) {
  info[key] = value
}

// 用户名带点
function truncated(str, num) {
  let s = '';
  for (let v of str) {
    s += v;
    num--;
    if (num < 0) {
      break;
    }
  }
  return (num <0)?(s + ".."):s;
}


// app -> js
function frontHttpResponse(res){
  console.log(res);
  if(res.resCode == 0){
    var data
    if(res.data){
      data = res.data
    }
    
    if(res.path == 'user/get'){
      $(".user-img img").attr("src", data.avatar);
      $(".user-msg p:first").text(truncated(data.nick, 5));
      $(".user-msg p:last span").text("ID: " + data.erbanNo);
      // hasPrettyErbanNo
      (data.hasPrettyErbanNo)? $(".user-msg p:last img").eq(0).show() : $(".user-msg p:last img").eq(0).hide();
      // newUser
      (data.newUser)? $(".user-msg p:last img").eq(1).show() : $(".user-msg p:last img").eq(1).hide();

      switch(parseInt(data.unionMemberVo.tag)){
        case 0:{
          $(".nobadge").show()
          break;
        }
        case 1:{
          $(".silverbadge").show()
          break;
        }
        case 2:{
          $(".goldbadge").show();
          break;
        }
      }

    }else if(res.path == 'union/medalPromote/list'){
      (data[0].growth < 0)? $(".silver .line span").css("width", 0) : (data[0].growth > 0 && data[0].growth > 300000)? $(".silver .line span").css("width", "100%") :  $(".silver .line span").css("width", (data[0].growth/300000 * 100).toFixed(2) + "%");
      (data[1].growth < 0)? $(".gold .line span").css("width", 0) : (data[1].growth > 0 && data[1].growth > 600000)? $(".gold .line span").css("width", "100%") : $(".gold .line span").css("width", (data[1].growth/600000 * 100).toFixed(2) + "%");

      $(".silver .growNum i").text(data[0].growth)
      $(".gold .growNum i").text(data[1].growth)

      if(data[0].status == 0){
        $(".silver .detail .btn").text("未达标")
      }else if(data[0].status == 1){
        $(".silver .detail .btn").text("领取勋章").addClass("active")
      }else if(data[0].status == 2){
        $(".silver .detail .btn").text("已领取")
      }else if(data[0].status == 3){
        $(".silver .detail .btn").text("保级成功")
      }

      if(data[1].status == 0){
        $(".gold .detail .btn").text("未达标")
      }else if(data[1].status == 1){
        $(".gold .detail .btn").text("领取勋章").addClass("active")
      }else if(data[1].status == 2){
        $(".gold .detail .btn").text("已领取")
      }else if(data[1].status == 3){
        $(".gold .detail .btn").text("保级成功")
      }

    }else if(res.path == 'union/drawMedalPromote'){
      $(".toast").show().fadeTo(400, 1).find("span").text("领取成功")
      setTimeout(function(){
        window.location.href = ""
      }, 1000)
      
    }
  }else{
    showToast("网络错误，请稍后再试")
    console.log(res)
  }
}
