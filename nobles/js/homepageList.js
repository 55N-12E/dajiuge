if(EnvCheck() == 'test'){
  var vConsole = new VConsole;
}
var info = {}
var browser = checkVersion();
var env = EnvCheck();
var api = locateJudge();
var locateObj = getQueryString();

var nobleObj = {
  "1": {
    name: "普通会员",
    img: "./images/icon_noble_primary@2x.png",
    head: "./images/viplist-lv1-head.png",
    bg: "./images/viplist-lv1-bg.png"
  },
  "2": {
    name: "高级会员",
    img: "./images/ic_noble_advanced@2x.png",
    head: "./images/viplist-lv2-head.png",
    bg: "./images/viplist-lv2-bg.png"
  },
  "3": {
    name: "白银贵族",
    img: "./images/icon_noble_viscount@2x.png",
    head: "./images/viplist-lv3-head.png",
    bg: "./images/viplist-lv3-bg.png"
  },
  "4": {
    name: "黄金贵族",
    img: "./images/icon_noble_marquis@2x.png",
    head: "./images/viplist-lv4-head.png",
    bg: "./images/viplist-lv4-bg.png"
  },
  "5": {
    name: "铂金贵族",
    img: "./images/icon_noble_baron@2x.png",
    head: "./images/viplist-lv5-head.png",
    bg: "./images/viplist-lv5-bg.png"
  },
  "6": {
    name: "钻石贵族",
    img: "./images/icon_noble_earl@2x.png",
    head: "./images/viplist-lv6-head.png",
    bg: "./images/viplist-lv6-bg.png"
  },
  "7": {
    name: "星耀贵族",
    img: "./images/icon_noble_king@2x.png",
    head: "./images/viplist-lv7-head.png",
    bg: "./images/viplist-lv7-bg.png"
  }
}
var _pickNobleId = 0;
var _hasUse = false;
var _useNobleId = 0;

$(function () {
  if(browser.app){
    if(browser.ios){
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null);
      window.webkit.messageHandlers.getDeviceId.postMessage(null);
      window.webkit.messageHandlers.getRoomUid.postMessage(null);
      window.webkit.messageHandlers.getAppVersion.postMessage(null);
      $(".android").hide();
      $(".ios").show()
    }else if(browser.android){
      if(androidJsObj && typeof androidJsObj === 'object'){
        info.uid = parseInt(window.androidJsObj.getUid());
        info.ticket = window.androidJsObj.getTicket();
        info.deviceId = window.androidJsObj.getDeviceId();
        info.roomUid = parseInt(window.androidJsObj.getRoomUid());
        info.appVersion = window.androidJsObj.getAppVersion();
        $(".android").show();
        $(".ios").hide()
      }
    }
  }else{
    info.appVersion = "1.5.5"

    if(browser.ios){
      $(".android").hide();
      $(".ios").show()
    }else if(browser.android){
      $(".android").show();
      $(".ios").hide()
    }
  }

  setTimeout(function(){
    info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
    getUser()
  }, 100)

  $(".bottom").click(function(){
    if($(".using-detail img").attr("src")){
      if(EnvCheck() == 'test'){
        if(locateJudge().match(/preview/)){
          window.location.href = "https://preview.api.99date.hudongco.com/modules/nobles/vipDetail.html"
        }else{
          window.location.href = "https://api.99date.hudongco.com/modules/nobles/vipDetail.html"
        }
      }else{
        window.location.href = "https://prod.api.99date.hudongco.com/modules/nobles/vipDetail.html"
      }
    }
  });

  $(".btn-group .btn").click(function(){
    if($(this).hasClass("btn-remove")){
      removeNoble()
    }else if($(this).hasClass("btn-open")){
      if(EnvCheck() == 'test'){
        if(locateJudge().match(/preview/)){
          window.location.href = "https://preview.api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=" + _pickNobleId
        }else{
          window.location.href = "https://api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=" + _pickNobleId
        }
      }else{
        window.location.href = "https://prod.api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=" + _pickNobleId
      }
    }else if($(this).hasClass("btn-use")){
      if(_hasUse){
        $(".mask .mask2").show()
        $(".confirmBox").show()
        $(".mask .mask2 h4 span").text(nobleObj[_useNobleId].name)
      }else{
        useNoble(_pickNobleId)
      }
    }
  })

  $(".mask2").click(function(e){
    if(e.target == $(".mask2")[0] || e.target == $(".cancel")[0]){
      $(".mask .mask2").hide()
      $(".confirmBox").hide()
      $(".privilege-box").hide()
      $(".privilege-box").css("height", "450px")
      $(".privilege-conten img").css("width", "100%").show();
      $(".privilege-conten h4").eq(1).show();
    }
  })

  $(".confirm").click(function(){
    useNoble(_pickNobleId)
  })

  initNav(openVip())
})

function getUser(){
  //  /noble/users/validNobleUserList
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: 'noble/users/nobleList',
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }
  }else{
    $.ajax({
      url : api + '/noble/users/nobleList',
      type: 'get',
      headers: {
        "pub_ticket": info.ticket
      },
      success(res){
        console.log(res)
        if(res.code == 200){
          $(".loading").hide();
          $(".mask").hide();
  
          renderVipList(res.data)
  
          $(".mask").click(function(e){
            // console.log(e)
            if(e.target == $(".mask")[0]){
              $(".right-box").removeClass("show");
              $(".btn-group .btn").removeClass("btn-remove btn-use btn-open");
              $(".btn-group i").text("");
  
              $(".btn-group").hide();
              $(".mask").hide();
              $(".loading").hide();
              $(".vip-right").hide();
  
              $(".mask .vip-right .right-detail").css({
                "height": "0",
                "top": "8rem"
              });
            }
          })
  
          for(var i=0; i<res.data.length; i++){
            if(res.data[i].hasOwnProperty("expire")){
              res.data[i].expire = new Date(res.data[i].expire).getFullYear().toString() + "-" + (new Date(res.data[i].expire).getMonth() + 1).toString() + "-" + new Date(res.data[i].expire).getDate().toString();
              nobleObj[res.data[i].nobleId].expire = res.data[i].expire
              nobleObj[res.data[i].nobleId].used = res.data[i].used
  
              if(browser.ios){
                if(res.data[i].status == 1){
                  switch(res.data[i].nobleId){
                    case 1:{
                      $(".ios .vipBox").eq(0).removeClass("vip-none")
                      $(".ios .vipBox .vipDetail .date").eq(0).text(res.data[i].expire)
                      $(".ios .vipBox .d-none").eq(0).show();
  
                      break
                    }
                    case 2:{
                      $(".ios .vipBox").eq(1).removeClass("vip-none")
                      $(".ios .vipBox .vipDetail .date").eq(1).text(res.data[i].expire)
                      $(".ios .vipBox .d-none").eq(1).show();
  
                      break
                    }
                  }
                }
              }else if(browser.android){
                if(res.data[i].status == 1){
                  $(".android .vipBox").eq(i).removeClass("vip-none")
                }
                $(".android .vipBox .vipDetail .date").eq(i).text(res.data[i].expire)
                $(".android .vipBox .d-none").eq(i).show();
              }
            }
  
            if(res.data[i].used == 1){
              _hasUse = true
              _useNobleId = res.data[i].nobleId
  
              $(".using-text h4").text(res.data[i].nobleName)
              $(".using-text p i").text(res.data[i].expire)
              $(".using-detail>img").attr("src", nobleObj[res.data[i].nobleId].img)
              if(browser.ios){
                $(".ios .vipBox").eq(res.data[i].nobleId - 1).find(".isUsing").show()
              }else if(browser.android){
                $(".android .vipBox").eq(i).find(".isUsing").show()
              }
            }
          }
  
          if($(".using-detail>img").attr("src") == ""){
            $(".vip-bg").hide();
            $(".bottom-arrow").hide();
            $(".noVip").show();
          }
  
          if($(".using-detail>img").attr("src") == ""){
            $(".vip-bg").hide();
            $(".bottom-arrow").hide();
            $(".noVip").show();
          }
        }
      },
      error(err){
        console.log(err)
      }
    })
  }
}

function showNoblePower(nobleLv){
  $(".mask").eq(0).show();
  $(".vip-right").show();
  $(".btn-group").show();
  $(".right-detail h4 span").text(nobleObj[nobleLv].name)
  $(".right-detail h4 img").attr("src", nobleObj[nobleLv].img)
  $(".btn-group i").text(nobleObj[nobleLv].expire)

  setTimeout(() => {
    if(browser.android){
      $(".mask .vip-right .right-detail").css({
        "height": "362px",
        "top": "-40px"
      });
    }else if(browser.ios){
      $(".mask .vip-right .right-detail").css({
        "height": "190px",
        "top": "45px"
      });
    }

    $(".right-list .right-box").click(function(){
      if(browser.android){
        $(".mask .mask2").show()
        $(".privilege-box").show()
        
        rightBoxShow($(this).index())
      }
    })
  }, 200)

  if(nobleObj[nobleLv].hasOwnProperty("used")){
    $(".right-bottom span").removeClass("d-none")
    if(nobleObj[nobleLv].used == 1){
      $(".btn-group .btn").text("卸下").addClass("btn-remove")
    }else{
      $(".btn-group .btn").text("使用").addClass("btn-use")
    }
  }else{
    $(".right-bottom span").addClass("d-none")
    $(".btn-group .btn").text("开通").addClass("btn-open")
    $(".btn-group .btn").css("filter", "grayscale(0%)")
    if(nobleLv == 7){
      $(".btn-group .btn").removeClass("btn-remove btn-use btn-open");
      $(".btn-group .btn").css("filter", "grayscale(100%)").text("暂不支持开通")
    }
  }

  switch(parseInt(nobleLv)){
    case 1:{
      if(browser.ios){
        $(".right-box").hide().slice(0, 3).show().addClass("show")
      }else if(browser.android){
        $(".right-box").slice(0, 3).addClass("show")
      }
      
      break;
    }
    case 2:{
      if(browser.ios){
        $(".right-box").hide().slice(0, 5).show().addClass("show")
      }else if(browser.android){
        $(".right-box").slice(0, 5).addClass("show")
      }

      break;
    }
    case 3:{
      $(".right-box").slice(0, 5).addClass("show")
      break;
    }
    case 4:{
      $(".right-box").slice(0, 7).addClass("show")
      break;
    }
    case 5:{
      $(".right-box").slice(0, 9).addClass("show")
      break;
    }
    case 6:{
      $(".right-box").slice(0, 12).addClass("show")
      break;
    }
    case 7:{
      $(".right-box").slice(0, 14).addClass("show")
      break;
    }
  }
}

function removeNoble(){
  if(browser.app && info.useNew){
    var obj = {
      method: 2,
      path: 'noble/users/takeNobleUserTitle'
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }
  }else{
    $.ajax({
      url: api + '/noble/users/takeNobleUserTitle',
      type: "post",
      headers: {
        "pub_ticket": info.ticket,
        "Content-Type": "application/json;charset=UTF-8"
      },
      success(res){
        console.log(res)
        if(res.code == 200){
          $(".toast").text("卸下成功").fadeTo(400, 1)
          if(browser.app){
            if(browser.ios){
              window.webkit.messageHandlers.upDateUserInfo.postMessage(null);
            }else if(browser.android){
              if(androidJsObj && typeof androidJsObj === 'object'){
                window.androidJsObj.upDateUserInfo()
              }
            }
          }
  
          setTimeout(function(){
            window.location.href = ""
          }, 1000)
        }
      },
      error(err){
        console.log(err)
      }
    })
  }
}

function useNoble(nobleId){
  if(browser.app && info.useNew){
    var obj = {
      method: 2,
      path: 'noble/users/wearNobleUserTitle',
      params: {
        nobleId: nobleId
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
      url: api + '/noble/users/wearNobleUserTitle?nobleId=' + nobleId,
      type: "post",
      headers: {
        "pub_ticket": info.ticket,
        "Content-Type": "application/json;charset=UTF-8"
      },
      success(res){
        console.log(res)
        if(res.code == 200){
          $(".toast").text("使用成功").fadeTo(400, 1)
          if(browser.app){
            if(browser.ios){
              window.webkit.messageHandlers.upDateUserInfo.postMessage(null);
            }else if(browser.android){
              if(androidJsObj && typeof androidJsObj === 'object'){
                window.androidJsObj.upDateUserInfo()
              }
            }
          }
  
          setTimeout(function(){
            if(EnvCheck() == 'test'){
              if(locateJudge().match(/preview/)){
                window.location.href = "https://preview.api.99date.hudongco.com/modules/nobles/vipDetail.html"
              }else{
                window.location.href = "https://api.99date.hudongco.com/modules/nobles/vipDetail.html"
              }
            }else{
              window.location.href = "https://prod.api.99date.hudongco.com/modules/nobles/vipDetail.html"
            }
          }, 1000)
        }
      },
      error(err){
        console.log(err)
      }
    })
  }
}

function openVip() {
  var linkUrl = ""
  if(EnvCheck() == 'test'){
    if(locateJudge().match(/preview/)){
      linkUrl = "https://preview.api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=1"
    }else{
      linkUrl = "https://api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=1"
    }
  }else{
    linkUrl = "https://prod.api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=1"
  }
  var obj = {
    type: 1,
    data: {
      msg: "wewawa",
      title: "开通VIP",
      link: linkUrl,
    },
  }
  return obj
}

function renderVipList(arr) {
  // console.log(arr)
  var str = "";
  if(browser.android){
    for(var i=0; i<arr.length; i++){
      str += "<div class='vipBox vip-none' data-noble='"+ (arr[i].nobleId) +"'>" +
                "<img src='"+ nobleObj[arr[i].nobleId].bg +"'/>" +
                "<img class='head' src='"+ nobleObj[arr[i].nobleId].head +"' />" +
                "<p class='vipDetail vipList-name'>"+ nobleObj[arr[i].nobleId].name +"</p>" +
                "<p class='vipDetail d-none vipList-lv"+ (arr[i].nobleId) +"-time'>到期时间: <i class='date'></i></p>" +
                "<div class='isUsing viplist-lv"+ (arr[i].nobleId) +"-using'></div>" +
              "</div>"
    }
    $(".android>div").append(str)
  }else if(browser.ios){
    // $(".ios>div").append(str)
  }

  $(".vipBox").click(function(){
    showNoblePower($(this).data().noble)
    _pickNobleId = $(this).data().noble
  })
}

function rightBoxShow(index){
  switch(index){
    case 0:{
      $(".privilege-box h3").text("贵族勋章");
      $(".privilege-conten p").text("用于个人主页、社区、聊天室发言、消息列表、榜单 等模块展示您的Vip身份。");
      $(".privilege-box .badge").attr("src", "./images/item-1-2.png");
      $(".privilege-conten img").attr("src", "./images/item-1-1.png");

      break;
    }
    case 1:{
      $(".privilege-box h3").text("贵族礼物");
      $(".privilege-conten p").text("在聊天室、社区、私聊等模块可打赏特权专属礼物。");
      $(".privilege-box .badge").attr("src", "./images/item-2-1.png");
      $(".privilege-conten img").attr("src", "./images/item-2-2.png");

      break;
    }
    case 2:{
      $(".privilege-box h3").text("贵族表情");
      $(".privilege-conten p").text("在聊天室中上麦时可使用特权专属表情。");
      $(".privilege-box .badge").attr("src", "./images/item-3-1.png");
      $(".privilege-conten img").attr("src", "./images/item-3-2.png");

      break;
    }
    case 3:{
      $(".privilege-box h3").text("进场特效");
      $(".privilege-conten p").text("进入聊天室时，出现Vip专属进场特效。");
      $(".privilege-box .badge").attr("src", "./images/item-4-1.png");
      $(".privilege-conten img").attr("src", "./images/item-4-2.png").css("width", "70%");
      

      break;
    }
    case 4:{
      $(".privilege-box h3").text("贵族背景");
      $(".privilege-conten p").text("Vip用户创建的聊天室，在“房间设置”中可使用更多 专属华丽的聊天室背景。");
      $(".privilege-box .badge").attr("src", "./images/item-5-1.png");
      $(".privilege-conten img").hide();
      $(".privilege-conten h4").eq(1).hide();
      $(".privilege-box").css("height", "230px")

      break;
    }
    case 5:{
      $(".privilege-box h3").text("头像勋章");
      $(".privilege-conten p").text("专属Vip头饰，用于个人主页、聊天室、榜单等模块展示您的Vip身份。");
      $(".privilege-box .badge").attr("src", "./images/item-6-1.png");
      $(".privilege-conten img").attr("src", "./images/item-6-2.png");
      $(".privilege-box").css("height", "400px")

      break;
    }
    case 6:{
      $(".privilege-box h3").text("特殊气泡");
      $(".privilege-conten p").text("在聊天室内，公屏发言时发言背景按Vip专属效果展示。");
      $(".privilege-box .badge").attr("src", "./images/item-7-1.png");
      $(".privilege-conten img").attr("src", "./images/item-7-2.png");

      break;
    }
    case 7:{
      $(".privilege-box h3").text("特殊光晕");
      $(".privilege-conten p").text("在聊天室内上麦说话，将会显示Vip专属颜色的光晕效果。");
      $(".privilege-box .badge").attr("src", "./images/item-8-1.png");
      $(".privilege-conten img").hide();
      $(".privilege-conten h4").eq(1).hide();
      $(".privilege-box").css("height", "230px")

      break;
    }
    case 8:{
      $(".privilege-box h3").text("进场隐身");
      $(".privilege-conten p").text("Vip用户进入聊天室时，公屏不会显示您的进场提醒；进入聊天室后，在线列表将以“神秘人”身份显示；");
      $(".privilege-box .badge").attr("src", "./images/item-9-1.png");
      $(".privilege-conten img").hide();
      $(".privilege-conten h4").eq(1).hide();
      $(".privilege-box").css("height", "245px")

      break;
    }
    case 9:{
      $(".privilege-box h3").text("榜单隐身");
      $(".privilege-conten p").text("在排行榜中将以“神秘人”身份展示，他人无法查看您的隐私信息。");
      $(".privilege-box .badge").attr("src", "./images/item-10-1.png");
      $(".privilege-conten img").attr("src", "./images/item-10-2.png");
      $(".privilege-box").css("height", "370px")

      break;
    }
    case 10:{
      $(".privilege-box h3").text("专属客服");
      $(".privilege-conten p").text("星耀、钻石Vip用户将会配备专属客服，对其一对一服务。");
      $(".privilege-box .badge").attr("src", "./images/item-11-1.png");
      $(".privilege-conten img").hide();
      $(".privilege-conten h4").eq(1).hide();
      $(".privilege-box").css("height", "230px")

      break;
    }
    case 11:{
      $(".privilege-box h3").text("专属靓号");
      $(".privilege-conten p").text("星耀、钻石Vip用户可申请自己的专属靓号，彰显尊贵身份。");
      $(".privilege-box .badge").attr("src", "./images/item-12-1.png");
      $(".privilege-conten img").hide();
      $(".privilege-conten h4").eq(1).hide();
      $(".privilege-box").css("height", "230px")

      break;
    }
    case 12:{
      $(".privilege-box h3").text("推荐房间上热门");
      $(".privilege-conten p").text("星耀贵族用户可将任意聊天室推荐为热门房间，在首页展示提高曝光量。");
      $(".privilege-box .badge").attr("src", "./images/item-13-1.png");
      $(".privilege-conten img").hide();
      $(".privilege-conten h4").eq(1).hide();
      $(".privilege-box").css("height", "230px")

      break;
    }
    case 13:{
      $(".privilege-box h3").text("防禁言/踢麦");
      $(".privilege-conten p").text("星耀贵族用户在聊天室内发言或上麦，房主无权将其禁言或踢下麦位。");
      $(".privilege-box .badge").attr("src", "./images/item-14-1.png");
      $(".privilege-conten img").hide();
      $(".privilege-conten h4").eq(1).hide();
      $(".privilege-box").css("height", "230px")

      break;
    }
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


// app -> js
function frontHttpResponse(res){
  console.log(res)
  if(res.resCode == 0){
    var data
    if(res.data){
      data = res.data
    }
    $(".loading").hide();
    $(".mask").hide();
    if(res.path == 'noble/users/nobleList'){
      renderVipList(data)

      $(".mask").click(function(e){
        // console.log(e)
        if(e.target == $(".mask")[0]){
          $(".right-box").removeClass("show");
          $(".btn-group .btn").removeClass("btn-remove btn-use btn-open");
          $(".btn-group i").text("");

          $(".btn-group").hide();
          $(".mask").hide();
          $(".loading").hide();
          $(".vip-right").hide();

          $(".mask .vip-right .right-detail").css({
            "height": "0",
            "top": "8rem"
          });
        }
      })

      for(var i=0; i<data.length; i++){
        if(data[i].hasOwnProperty("expire")){
          data[i].expire = new Date(data[i].expire).getFullYear().toString() + "-" + (new Date(data[i].expire).getMonth() + 1).toString() + "-" + new Date(data[i].expire).getDate().toString();
          nobleObj[data[i].nobleId].expire = data[i].expire
          nobleObj[data[i].nobleId].used = data[i].used

          if(browser.ios){
            if(data[i].status == 1){
              switch(data[i].nobleId){
                case 1:{
                  $(".ios .vipBox").eq(0).removeClass("vip-none")
                  $(".ios .vipBox .vipDetail .date").eq(0).text(data[i].expire)
                  $(".ios .vipBox .d-none").eq(0).show();

                  break
                }
                case 2:{
                  $(".ios .vipBox").eq(1).removeClass("vip-none")
                  $(".ios .vipBox .vipDetail .date").eq(1).text(data[i].expire)
                  $(".ios .vipBox .d-none").eq(1).show();

                  break
                }
              }
            }
          }else if(browser.android){
            if(data[i].status == 1){
              $(".android .vipBox").eq(i).removeClass("vip-none")
            }
            $(".android .vipBox .vipDetail .date").eq(i).text(data[i].expire)
            $(".android .vipBox .d-none").eq(i).show();
          }
        }

        if(data[i].used == 1){
          _hasUse = true
          _useNobleId = data[i].nobleId

          $(".using-text h4").text(data[i].nobleName)
          $(".using-text p i").text(data[i].expire)
          $(".using-detail>img").attr("src", nobleObj[data[i].nobleId].img)
          if(browser.ios){
            $(".ios .vipBox").eq(data[i].nobleId - 1).find(".isUsing").show()
          }else if(browser.android){
            $(".android .vipBox").eq(i).find(".isUsing").show()
          }
        }
      }

      if($(".using-detail>img").attr("src") == ""){
        $(".vip-bg").hide();
        $(".bottom-arrow").hide();
        $(".noVip").show();
      }

      if($(".using-detail>img").attr("src") == ""){
        $(".vip-bg").hide();
        $(".bottom-arrow").hide();
        $(".noVip").show();
      }

    }else if(res.path == 'noble/users/takeNobleUserTitle'){
      $(".toast").text("卸下成功").fadeTo(400, 1)
      if(browser.app){
        if(browser.ios){
          window.webkit.messageHandlers.upDateUserInfo.postMessage(null);
        }else if(browser.android){
          if(androidJsObj && typeof androidJsObj === 'object'){
            window.androidJsObj.upDateUserInfo()
          }
        }
      }

      setTimeout(function(){
        window.location.href = ""
      }, 1000)

    }else if(res.path == 'noble/users/wearNobleUserTitle'){
      $(".toast").text("使用成功").fadeTo(400, 1)
      if(browser.app){
        if(browser.ios){
          window.webkit.messageHandlers.upDateUserInfo.postMessage(null);
        }else if(browser.android){
          if(androidJsObj && typeof androidJsObj === 'object'){
            window.androidJsObj.upDateUserInfo()
          }
        }
      }

      setTimeout(function(){
        if(EnvCheck() == 'test'){
          if(locateJudge().match(/preview/)){
            window.location.href = "https://preview.api.99date.hudongco.com/modules/nobles/vipDetail.html"
          }else{
            window.location.href = "https://api.99date.hudongco.com/modules/nobles/vipDetail.html"
          }
        }else{
          window.location.href = "https://prod.api.99date.hudongco.com/modules/nobles/vipDetail.html"
        }
      }, 1000)
      
    }
  }else{
    console.log(res)
    showToast("网络异常，请稍后再试")
  }
}