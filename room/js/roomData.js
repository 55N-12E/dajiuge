var info = {
  dayType: {
    txt: "day",
    num: 1
  }
};

var browser = checkVersion();
var env = EnvCheck();
var api = locateJudge();
var locateObj = getQueryString();

var pageNo = 1, pageSize = 30;
var timeout = null, timeout2 = null;
var charmRank = 0, richRank = 0;

if(EnvCheck() == 'test'){
  var vConsole = new VConsole;
}

var nobleArr = [
  '/modules/nobles/images/icon_noble_primary@2x.png', //1
  '/modules/nobles/images/ic_noble_advanced@2x.png',  //2
  '/modules/nobles/images/icon_noble_viscount@2x.png', //3
  '/modules/nobles/images/icon_noble_marquis@2x.png', //4
  '/modules/nobles/images/icon_noble_baron@2x.png', //5
  '/modules/nobles/images/icon_noble_earl@2x.png', //6
  '/modules/nobles/images/icon_noble_king@2x.png' //7
]


$(function(){
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

  $(".ulBox").css("height", window.innerHeight - $(".nav")[0].clientHeight - $(".content .detail")[0].clientHeight - 20 - $(".title")[0].clientHeight)
  $(".ulBox.charm")[0].addEventListener("scroll", function(){
    if($(".ulBox.charm")[0].clientHeight + Math.round($(".ulBox.charm")[0].scrollTop) == $(".list-content.charmList")[0].clientHeight + 15){
      console.log("到底了1");
      pageNo ++;
      debounce(getCharmList, 500)();
    }
  })
  $(".ulBox.rich")[0].addEventListener("scroll", function(){
    if($(".ulBox.rich")[0].clientHeight + Math.round($(".ulBox.rich")[0].scrollTop) == $(".list-content.richList")[0].clientHeight + 15){
      console.log("到底了2");
      pageNo ++;
      debounce(getRichList, 500)();
    }
  })

  $(".nav ul li").click(function(){
    if(!$(this).hasClass("active")){
      $("#loading").show()
      $(".triangle").removeClass('p-1 p-2 p-3 p-4').addClass("p-" + ($(this).index() + 1))
      $(".nav ul li").removeClass("active")
      $(this).addClass("active")
      pageNo = 1;
      charmRank = 0;
      richRank = 0;

      switch($(this).index()){
        case 0:{
          info.dayType.num = 1
          info.dayType.txt = "day"

          break;
        }
        case 1:{
          info.dayType.num = 5
          info.dayType.txt = "yesterday"
          
          break;
        }
        case 2:{
          info.dayType.num = 2
          info.dayType.txt = "week"
          
          break;
        }
        case 3:{
          info.dayType.num = 6
          info.dayType.txt = "lastWeek"
          
          break;
        }
      }

      $(".list-content.charmList li").remove()
      $(".list-content.richList li").remove()

      if(timeout2 != null){
        clearTimeout(timeout2)
      }
      timeout2 = setTimeout(function(){
        getRank()
        getCharmList()
        getRichList()
      }, 800)
    }
  })

  $(".title").click(function(e){
    $("#loading").show()
    if($(e.target).hasClass("active")){
      console.log("木大")
    }else{
      $(".title span").removeClass("active")
      $(e.target).addClass("active")
      pageNo = 1;
      charmRank = 0;
      richRank = 0;

      switch($(e.target).index()){
        case 0:{
          $(".ulBox.charm").show();
          $(".ulBox.rich").hide();
  
          $(".list-content.charmList li").remove()
          getCharmList()

          break;
        }
        case 1:{
          $(".ulBox.charm").hide();
          $(".ulBox.rich").show();
  
          $(".list-content.richList li").remove()
          getRichList()
          
          break;
        }
      }
    }
  })

  $(".list-content").on('click', ".user-img", function(){
    var uid = $(this).data().id.toString();
    if (browser.app && browser.ios) {
      window.webkit.messageHandlers.openPersonPage.postMessage(uid)
    } else if (browser.app && browser.android) {
      if (androidJsObj && typeof androidJsObj === "object") {
        window.androidJsObj.openPersonPage(uid)
      }
    }
  })

  setTimeout(function(){
    getRank()
    getCharmList()
  }, 100)

  initNav(showTitleRightNoticeFuck())
})

// 获取流水-人数
function getRank(){
  var obj = {
    method: 1,
    path: "room/statisticsRoomData",
    params: {
      roomUid: info.roomUid,
      type: info.dayType.num
    }
  }

  if(browser.android){
    window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
  }else if(browser.ios){
    var data = JSON.stringify(obj)
    window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
  }
}

// 获取魅力列表
function getCharmList(){
  var obj = {
    method: 1,
    path: "room/recive/rankings",
    params: {
      roomUid: info.roomUid,
      type: info.dayType.txt,
      page: pageNo,
      pageSize: pageSize
    }
  }

  if(browser.android){
    window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
  }else if(browser.ios){
    var data = JSON.stringify(obj)
    window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
  }
}

// 获取土豪列表
function getRichList(){
  var obj = {
    method: 1,
    path: "room/rankings",
    params: {
      roomUid: info.roomUid,
      type: info.dayType.txt,
      page: pageNo,
      pageSize: pageSize
    }
  }

  if(browser.android){
    window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
  }else if(browser.ios){
    var data = JSON.stringify(obj)
    window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
  }
}

// 渲染魅力
function renderCharmList(data){
  var str = ""
  for(var i=0; i<data.length; i++){
    charmRank += 1;

    if((i == 0 && charmRank == 1) || (i == 1 && charmRank == 2) || (i == 2 && charmRank == 3)){
      str += "<li class='d-flex'>" +
              "<div class='left d-flex'>" +
                "<div class='rank-no'>" +
                  "<img src='" + (i==0?'./images/no1.png':i==1?'./images/no2.png':i==2?'./images/no3.png':'') + "' />" +
                "</div>" +
                "<img src='"+ data[i].avatar +"' class='user-img' data-id='"+ data[i].uid +"' />" +
                "<div class='user-msg'>" +
                  "<p class='user-name'>" +
                    "<span>" + truncated(data[i].nick, 5) + "</span>" +
                    '<img style="'+ ((data[i].nobleId)? "display: block;" : "display: none;") +'" src="'+ ((data[i].nobleId) && (api + nobleArr[data[i].nobleId - 1]) || undefined) +'" alt="" />' +
                    "<img src='"+ data[i].experUrl +"' />" +
                  "</p>" +
                  "<p>" +
                    "<img src='https://api.99date.hudongco.com/modules/erbanRank/images/lianghao.png' style='width: 15px;height: 15px;display:"+ (data[i].hasPrettyErbanNo?'inline-block;':'none;') +"'/>" +
                    "<img src='https://api.99date.hudongco.com/modules/erbanRank/images/xinren.png' style='width: 15px;height: 15px;margin-right: 5px;display:"+ (data[i].hasPrettyErbanNo?'inline-block;':'none;') +"'/>" +
                    "ID:"+ (data[i].erbanNo == undefined? '0' : data[i].erbanNo.toString()) +
                  "</p>" +
                "</div>" +
              "</div>" +
              "<div class='right d-flex'>" +
                "<span>"+ data[i].goldAmount +"</span>" +
                "<img src='./images/heart.png' alt='' />" +
              "</div>" +
            "</li>"
    }else{
      str += "<li class='d-flex'>" +
              "<div class='left d-flex'>" +
                "<div class='rank-no'>" +
                  "<span>"+ charmRank +"</span>" +
                "</div>" +
                "<img src='"+ data[i].avatar +"' class='user-img' data-id='"+ data[i].uid +"' />" +
                "<div class='user-msg'>" +
                  "<p class='user-name'>" +
                    "<span>" + truncated(data[i].nick, 5) + "</span>" +
                    '<img style="'+ ((data[i].nobleId)? "display: block;" : "display: none;") +'" src="'+ ((data[i].nobleId) && (api + nobleArr[data[i].nobleId - 1]) || undefined) +'" alt="" />' +
                    "<img src='"+ data[i].experUrl +"' />" +
                  "</p>" +
                  "<p>" +
                    "<img src='https://api.99date.hudongco.com/modules/erbanRank/images/lianghao.png' style='width: 15px;height: 15px;display:"+ (data[i].hasPrettyErbanNo?'inline-block;':'none;') +"'/>" +
                    "<img src='https://api.99date.hudongco.com/modules/erbanRank/images/xinren.png' style='width: 15px;height: 15px;margin-right: 5px;display:"+ (data[i].hasPrettyErbanNo?'inline-block;':'none;') +"'/>" +
                    "ID:"+ (data[i].erbanNo == undefined? '0' : data[i].erbanNo.toString()) +
                  "</p>" +
                "</div>" +
              "</div>" +
              "<div class='right d-flex'>" +
                "<span>"+ data[i].goldAmount +"</span>" +
                "<img src='./images/heart.png' alt='' />" +
              "</div>" +
            "</li>"
    }
  }
  
  $(".list-content.charmList").append(str);
  setTimeout(function(){
    $("#loading").hide()
  }, 1500)
}

// 渲染土豪
function renderRichList(data){
  var str = ""
  for(var i=0; i<data.length; i++){
    richRank += 1;

    if((i == 0 && richRank == 1) || (i == 1 && richRank == 2) || (i == 2 && richRank == 3)){
      str += "<li class='d-flex'>" +
              "<div class='left d-flex'>" +
                "<div class='rank-no'>" +
                  "<img src='" + (i==0?'./images/no1.png':i==1?'./images/no2.png':i==2?'./images/no3.png':'') + "' />" +
                "</div>" +
                "<img src='"+ data[i].avatar +"' class='user-img' data-id='"+ data[i].uid +"' />" +
                "<div class='user-msg'>" +
                  "<p class='user-name'>" +
                    "<span>" + truncated(data[i].nick, 5) + "</span>" +
                    '<img style="'+ ((data[i].nobleId)? "display: block;" : "display: none;") +'" src="'+ ((data[i].nobleId) && (api + nobleArr[data[i].nobleId - 1]) || undefined) +'" alt="" />' +
                    "<img src='"+ data[i].experUrl +"' />" +
                  "</p>" +
                  "<p>" +
                    "<img src='https://api.99date.hudongco.com/modules/erbanRank/images/lianghao.png' style='width: 15px;height: 15px;display:"+ (data[i].hasPrettyErbanNo?'inline-block;':'none;') +"'/>" +
                    "<img src='https://api.99date.hudongco.com/modules/erbanRank/images/xinren.png' style='width: 15px;height: 15px;margin-right: 5px;display:"+ (data[i].hasPrettyErbanNo?'inline-block;':'none;') +"'/>" +
                    "ID:"+ (data[i].erbanNo == undefined? '0' : data[i].erbanNo.toString()) +
                  "</p>" +
                "</div>" +
              "</div>" +
              "<div class='right d-flex'>" +
                "<span>"+ data[i].goldAmount +"</span>" +
                "<img src='./images/y-bean.png' alt='' />" +
              "</div>" +
            "</li>"
    }else{
      str += "<li class='d-flex'>" +
              "<div class='left d-flex'>" +
                "<div class='rank-no'>" +
                  "<span>"+ richRank +"</span>" +
                "</div>" +
                "<img src='"+ data[i].avatar +"' class='user-img' data-id='"+ data[i].uid +"' />" +
                "<div class='user-msg'>" +
                  "<p class='user-name'>" +
                    "<span>" + truncated(data[i].nick, 5) + "</span>" +
                    '<img style="'+ ((data[i].nobleId)? "display: block;" : "display: none;") +'" src="'+ ((data[i].nobleId) && (api + nobleArr[data[i].nobleId - 1]) || undefined) +'" alt="" />' +
                    "<img src='"+ data[i].experUrl +"' />" +
                  "</p>" +
                  "<p>" +
                    "<img src='https://api.99date.hudongco.com/modules/erbanRank/images/lianghao.png' style='width: 15px;height: 15px;display:"+ (data[i].hasPrettyErbanNo?'inline-block;':'none;') +"'/>" +
                    "<img src='https://api.99date.hudongco.com/modules/erbanRank/images/xinren.png' style='width: 15px;height: 15px;margin-right: 5px;display:"+ (data[i].hasPrettyErbanNo?'inline-block;':'none;') +"'/>" +
                    "ID:"+ (data[i].erbanNo == undefined? '0' : data[i].erbanNo.toString()) +
                  "</p>" +
                "</div>" +
              "</div>" +
              "<div class='right d-flex'>" +
                "<span>"+ data[i].goldAmount +"</span>" +
                "<img src='./images/y-bean.png' alt='' />" +
              "</div>" +
            "</li>"
    }
  }
  
  $(".list-content.richList").append(str);
  setTimeout(function(){
    $("#loading").hide()
  }, 1500)
}

// 渲染排行数据
function renderRoomDetail(data){
  $(".waterNum").text(data.totalWater);
  $(".rank span").text(data.rank || "未上榜");
  $(".prev span").text(data.gap);
  $(".roomNum").find("span").text(data.totalNumber);
}

// 用户名带点
function truncated(str, num) {
  if(typeof str === 'string'){
    let s = '';
    for (let v of str) {
      s += v;
      num--;
      if (num < 0) {
          break;
      }
    }
    return (num <0)?(s + ".."):s;
  }else{
    return '已注销用户';
  }
}

function showTitleRightNoticeFuck() {
  var linkUrl = ""
  if (EnvCheck() == "test") {
    if(locateJudge().match(/preview/)){
      linkUrl = "https://preview.api.99date.hudongco.com/modules/room/roomData.html"
    }else{
      linkUrl = "https://api.99date.hudongco.com/modules/room/roomData.html"
    }
  } else {
    linkUrl = "https://prod.api.99date.hudongco.com/modules/room/roomData.html"
  }
  var obj = {
    type: 6,
    data: {
      msg: "reflash",
      title: "刷新",
      link: linkUrl,
    },
  }
  return obj
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

// IOS -> js
function getMessage(key,value){
  info[key] = value;
}


// app -> js
function frontHttpResponse(res){
  console.log(res)
  if(res.resCode == 0){
    var data
    if(res.data){
      data = res.data
    }

    if(res.path == "room/statisticsRoomData"){
      renderRoomDetail(data)
      setTimeout(function(){
        $("#loading").hide()
      }, 1500)

    }else if(res.path == "room/recive/rankings"){
      if(data.rankings.length == 0 && pageNo != 1){
        pageNo --;
      }else{
        renderCharmList(data.rankings);
      }

    }else if(res.path == "room/rankings"){
      if(data.rankings.length == 0 && pageNo != 1){
        pageNo --;
      }else{
        renderRichList(data.rankings);
      }

    }
  }else{
    console.log(res)
    showToast(res.message)
  }
}