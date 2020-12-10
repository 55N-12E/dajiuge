var info = {};

if(EnvCheck() == 'test'){
  var vConsole = new VConsole;
}

// 日期
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth() + 1;

var pageNo = 1;
var keyNum = 1;
var rankType = 1;

var timeout = null;

var url = "";
var isGold = true;
var slingshotType = 1;

// 方法
var browser = checkVersion();
var env = EnvCheck();
var api = locateJudge();
var locateObj = getQueryString();
var oldGiftLength = 0;

$(function () {
  if(browser.app){
    if(browser.ios){
      // info.appVersion 
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null);
      window.webkit.messageHandlers.getDeviceId.postMessage(null);
      window.webkit.messageHandlers.getRoomUid.postMessage(null);
      window.webkit.messageHandlers.getAppVersion.postMessage(null);
    }else if(browser.android){
      info.uid = parseInt(window.androidJsObj.getUid());
      info.ticket = window.androidJsObj.getTicket();
      info.deviceId = window.androidJsObj.getDeviceId();
      info.roomUid = parseInt(window.androidJsObj.getRoomUid());
      info.appVersion = window.androidJsObj.getAppVersion();
    }
  }else{
    info.appVersion = "1.5.5"
  }

  setTimeout(function(){
    info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
  }, 100)

  // 玩几次
  $(".game-time .time-box1").click(function(){
    $(".game-time .time-box1").removeClass("active")
    $(this).addClass("active")

    keyNum = this.dataset.num
  })

  // 游戏开始
  $(".game-on .on-box1").click(function(){
    if(parseInt($(".stoneNum span").text()) == 0 || parseInt($(".stoneNum span").text()) < keyNum * (isGold == true?1:10)){
      $(".mask>.mask").show();
      $(".notEnough").show();
      // 关闭石头不足
      $(".mask>.mask").click(function(e){
        if(e.target == $(".mask>.mask")[0]){
          $(".mask>.mask").hide()
          $(".notEnough").hide();

          $(".mask>.mask").unbind()
        }
      })
      return false;
    }else{
      // 打气球
      gameOn()
    }
  });

  // 监听记录滚动
  $(".record-mid .record-list")[0].addEventListener("scroll", function(){
    if(Math.round($(this).scrollTop() + $(this).height()) + 50 >= Math.round($(this).find("div")[0].scrollHeight) && Math.round($(this).find("div")[0].scrollHeight) != 0){
      console.log("记录到底")
      
      debounce(getRecord, 300)()
    }
  });

  // 监听排行榜滚动
  $(".rank-mid .rank-list")[0].addEventListener("scroll", function(){
    if(Math.round($(this).scrollTop() + $(this).height()) == $(this).find("div")[0].scrollHeight){
      console.log("排行到底")
    }
  });
  
  // 记录切换按钮
  $(".record-mid .switch-btn p").click(function(){
    pageNo = 1;
    year = date.getFullYear();
    month = date.getMonth() + 1;
    clearTimeout(timeout)

    // 1打气球 2石头
    $(".record-mid .switch-btn p").removeClass("active")
    $(this).addClass("active");
    $(".record-mid .record-time span").text(date.getFullYear() + "年" + (date.getMonth() + 1) + "月");
    $(".record-list>div .d-flex").remove();

    getRecord()
  });

  // 排行榜切换按钮
  $(".rank-mid .switch-btn p").click(function(){
    $(".rank-mid .switch-btn p").removeClass("active")
    $(this).addClass("active");
    rankType = this.dataset.type;
    
    getRank()
  });

  // 记录日期事件
  $(".record-mid .record-time span").text(year + "年" + month + "月");
  $(".prev").click(function(){
    pageNo = 1;

    if(month -1 == 0){
      year -= 1;
      month = 12;
    }else{
      month -= 1;
    }
    $(".record-list>div .d-flex").remove();
    $(".record-mid .record-time span").text(year + "年" + month + "月");
  })
  $(".next").click(function(){
    pageNo = 1;

    if(month + 1 > (date.getMonth() + 1) && year == date.getFullYear()){
      console.log("查看未来")
      return false;
    }else{
      if(month + 1 > 12){
        year += 1;
        month = 1;
      }else{
        month += 1;
      }
      $(".record-list>div .d-flex").remove();
      $(".record-mid .record-time span").text(year + "年" + month + "月");
    }
  })
  
  $(".mid").css("height", "calc(100% - ".concat($(".bottom").height() + $(".top").height(), "px)"));

  // 排行榜
  $(".showRank").click(function(){
    $(".mid .ag").remove();
    $(".game-zone").hide();
    $(".rank").show();
    $(".rank-mid .switch-btn p").removeClass("active")
    $(".rank-mid .switch-btn p").eq(0).addClass("active");

    $(".rank-mid").css("height", $("#rank")[0].clientHeight - $(".rank-top")[0].clientHeight - 29)
    $(".rank-list").css("height", $(".rank-mid")[0].clientHeight - $(".rank-mid .switch-btn")[0].clientHeight - 45)

    getRank()
  })
  
  // 记录
  $(".showRecord").click(function(){
    $(".mid .ag").remove();
    $(".game-zone").hide();
    $(".record").show();
    $(".record-mid .switch-btn p").removeClass("active")
    $(".record-mid .switch-btn p").eq(0).addClass("active");

    $(".record-mid").css("height", ($("#record")[0].clientHeight - $(".record-top")[0].clientHeight - 29));
    $(".record-list").css("height", $(".record-mid")[0].clientHeight - $(".record-mid .switch-btn")[0].clientHeight - $(".record-time")[0].clientHeight - 45);
    
    $(".record-mid .record-time span").text(date.getFullYear() + "年" + (date.getMonth() + 1) + "月");

    pageNo = 1;
    getRecord()
  })

  // 怎么玩
  $(".howtoPlay").click(function(){
    $(".mid .ag").remove();
    $(".game-zone").hide();
    $(".rule").show();

    $(".rule-content").css("height", $("#rule")[0].clientHeight - $(".rule-top")[0].clientHeight - 29);
  })

  // 关闭按钮
  $(".exit").click(function(){
    $(".game-zone").show();
    
    $(".record").hide();
    $(".record-list>div .d-flex").remove();

    $(".rank").hide();
    $(".rule").hide();
  })

  // 获取石头按钮
  $(".getStone").click(function(){
    if(EnvCheck() == 'test'){
      if(locateJudge().match(/preview/)){
        url = "https://preview.api.99date.hudongco.com/activity/hit-balloon/constellation/cancer/cancer.html"
      }else{
        url = "https://api.99date.hudongco.com/activity/hit-balloon/constellation/cancer/cancer.html"
      }
    }else{
      url = "https://prod.api.99date.hudongco.com/activity/hit-balloon/constellation/cancer/cancer.html"
    }
    $(".mid .ag").remove();
    if(browser.app){
      if(browser.android){
        window.androidJsObj.jumpNewWebPage(url);
      }else if(browser.ios){
        setTimeout(function(){
          window.webkit.messageHandlers.closeAndJumpNewWebPage.postMessage(url);
        }, 300)
      }
    }else{
      console.log(123)
      window.location.href = url
    }
  })

  // 切换弹弓
  $(".switch-slingshot").click(function(e){
    (debounce(function(){
      if($(e.target).hasClass("active")){
        return 
      }

      if(isGold){
        isGold = false;
        $(".gold").addClass("active");
        $(".wood").removeClass("active");

        $(".tip").hide();
        $(".balloon-g").show();
        $(".balloon").hide().parent().hide();

        $(".slingshot").attr("src", "./images/slingshot-g.png");
        $(".game-time .time-box1").eq(0).find("span").eq(1).text("10");
        $(".game-time .time-box1").eq(1).find("span").eq(1).text("100");
        $(".game-time .time-box1").eq(2).find("span").eq(1).text("1000");
      }else{
        isGold = true
        $(".gold").removeClass("active");
        $(".wood").addClass("active");

        $(".tip").show();
        $(".balloon-g").hide();
        $(".balloon").show().parent().show();

        $(".slingshot").attr("src", "./images/slingshot.png");
        $(".game-time .time-box1").eq(0).find("span").eq(1).text("1");
        $(".game-time .time-box1").eq(1).find("span").eq(1).text("10");
        $(".game-time .time-box1").eq(2).find("span").eq(1).text("100");
      }
    }, 300))()
  })

  setTimeout(function(){
    getData()
    getPrizes()
    // 防抖监听
    $(".record-time>img").on("click", debounce(getRecord, 1000));

    $("#cover").click(function(e){
      if(e.target == $("#cover")[0]){
        if (browser.app) {
          if (browser.ios) {
    
          } else if (browser.android) {
            if (androidJsObj && typeof androidJsObj === 'object') {
              window.androidJsObj.closePage();
            }
          }
        }
      }
    })
  }, 100)

  // 刷新石头
  document.addEventListener('visibilitychange', function () {
    getData()
  });
})

// 获取用户石头
function getData(){
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: 'hitball/userkey'
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }
  }else{
    $.ajax({
      url: api + "/hitball/userkey",
      type: "GET",
      headers: {
        "pub_ticket": info.ticket
      },
      success(res){
        if(res.code == 200){
          $(".stoneNum span").text(res.data);
        }
      }
    })
  }
}

// 获取奖池
function getPrizes(){
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: 'hitball/prizes'
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }
  }else{
    $.ajax({
      url: api + "/hitball/prizes",
      type: "GET",
      headers: {
        "pub_ticket": info.ticket
      },
      success(res){
        if(res.code == 200){
          renderPrize(res.data)
        }
      }
    })
  }
}

// 打气球
function gameOn(){
  if(browser.app && info.useNew){
    var obj = {
      method: 2,
      path: 'hitball/drawHitball',
      params: {
        roomUid: info.roomUid || "",
        keyNum: keyNum,
        deviceId: info.deviceId,
        ticket: info.ticket,
        type: isGold?"1":"2",
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
      type: "post",
      url: api + "/hitball/drawHitball",
      headers: {
        "pub_ticket": info.ticket
      },
      data: {
        roomUid: info.roomUid || "",
        keyNum: keyNum,
        deviceId: info.deviceId,
        ticket: info.ticket,
        type: isGold?"1":"2",
      },
      success(res) {
        console.log(res)
        if(res.code == 10006){
          console.log("石头不够")
        }else if(res.code == 200){
          var str = "";
  
          // 清理礼物元素
          if($(".mid .ag").length > 50){
            for(var i=0; i<30; i++){
              $(".mid .ag")[0].remove();
            }
          }
          oldGiftLength = res.data.prizeItemVoList.length;
  
          if(res.data.prizeItemVoList.length == 1){
            str += "<div class='ag animate_gift0'>" +
                      "<img src='"+ res.data.prizeItemVoList[0].prizeImgUrl +"'>" +
                      "<span>×"+ res.data.prizeItemVoList[0].prizeNum +"</span>" +
                    "</div>"
  
            $(".mid").append(str)
          }else{
            var arr = [];
            for(var j=0; j<res.data.prizeItemVoList.length; j++){
              arr.push(res.data.prizeItemVoList[j])
            }
            arr.reverse();
            if(arr.length > 8){
              for(var i=0; i<8; i++){
                str += "<div class='ag animate_gift"+ i +"'>" +
                          "<img src='"+ arr[i].prizeImgUrl +"'>" +
                          "<span>×"+ arr[i].prizeNum +"</span>" +
                        "</div>"
              }
            }else{
              for(var i=0; i<arr.length; i++){
                str += "<div class='ag animate_gift"+ i +"'>" +
                          "<img src='"+ arr[i].prizeImgUrl +"'>" +
                          "<span>×"+ arr[i].prizeNum +"</span>" +
                        "</div>"
              }
            }
            
            $(".mid").append(str)
          }
  
          $(".stoneNum span").text(res.data.remainKeyNum)
        }else{
          $(".toast").text("打气球失败，请稍后再试").fadeTo(400, 1)
          setTimeout(function(){
            $(".toast").fadeTo(400, 0)
          }, 1500)
        }
      },
      error(err){
        console.log(err)
  
        if(err.status == 401){
          var obj = JSON.parse(err.responseText);
          if(obj.code == 1413){
            if(browser.app){
              if(browser.ios){
                window.webkit.messageHandlers.showPasswordDialog.postMessage(null);
              }else if(browser.android){
                window.androidJsObj.showPasswordDialog();
              }
            }
          }else if(obj.code == 1414){
            $(".toast").text("请前往我的-设置-支付密码页面设置密码").fadeTo(400, 1)
            setTimeout(function(){
              $(".toast").fadeTo(400, 0)
            }, 1500)
          }
        }
  
      }
    })
  }
}

// 获取排行榜
function getRank(){
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: 'hitball/type/rankinglist',
      params: {
        type: rankType
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
      url: api + "/hitball/type/rankinglist",
      type: "GET",
      data: {
        type: rankType// 1今日 2昨日
      },
      headers: {
        "pub_ticket": info.ticket
      },
      success(res){
        if(res.code == 200){
          $(".rank-list>div").remove()
          renderRank(res.data)
        }else{
          console.log(res.message);
        }
      }
    })
  }
}

// 获取记录
function getRecord(){
  var dateStr = year + (month >= 10 ? month : "0" + month).toString()
  if($(".record-mid .switch-btn p.active")[0].dataset.type == 1){
    // 打气球记录
    if(browser.app && info.useNew){
      var obj = {
        method: 2,
        path: 'hitball/hitball_record',
        params: {
          date: dateStr,
          pageNo: pageNo,
          pageSize: 10,
          ticket: info.ticket
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
        url: api + "/hitball/hitball_record",
        type: "POST",
        data: {
          date: dateStr,
          pageNo: pageNo,
          pageSize: 10,
          ticket: info.ticket
        },
        headers: {
          "pub_ticket": info.ticket
        },
        success(res){
          if(res.code == 200){
            if(res.data.length > 0){
              pageNo += 1;
            }
            renderRecord(res.data, 1)
          }else{
            console.log(res.message)
          }
        }
      })
    }
  }else if($(".record-mid .switch-btn p.active")[0].dataset.type == 2){
    // 石头使用记录
    if(browser.app && info.useNew){
      var obj = {
        method: 2,
        path: 'hitball/hitball_stone_record',
        params: {
          date: dateStr,
          pageNo: pageNo,
          pageSize: 10,
          ticket: info.ticket
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
        url: api + "/hitball/hitball_stone_record",
        type: "POST",
        data: {
          date: dateStr,
          pageNo: pageNo,
          pageSize: 10,
          ticket: info.ticket
        },
        headers: {
          "pub_ticket": info.ticket
        },
        success(res){
          if(res.code == 200){
            if(res.data.length > 0){
              pageNo += 1;
            }
            renderRecord(res.data, 2)
          }else{
            console.log(res.message)
          }
        }
      })
    }
  }
}

// 渲染排行榜
function renderRank(data){
  var str = ""
  for(var i=0; i< data.list.length; i++){
    str += "<div class=\"d-flex\">\n              <div class=\"user-detail d-flex\">\n                <span style=\"width: 19px;\">".concat(i + 1, "</span>\n                <div class=\"user-avatar d-flex\">\n                  <i class=\"toushi ").concat(data.list[i].nobleId == 4 ? 'huangjin-hd' : data.list[i].nobleId == 5 ? 'bojin-hd' : data.list[i].nobleId == 6 ? 'zuanshi-hd' : data.list[i].nobleId == 7 ? 'xingyao-hd' : '', "\"></i>\n                  <img src=\"").concat(data.list[i].avatar, "\" alt=\"\">\n                </div>\n                <div>\n                  <p class=\"user-name\">\n                    <span>").concat(data.list[i].nick.length > 5 ? truncated(data.list[i].nick, 5) : data.list[i].nick, "</span>\n                    <img class=\"gender\" src=\"./images/").concat(data.list[i].gender == 1 ? 'boy.png' : 'girl.png', "\" alt=\"\">\n                  </p>\n                  <p class=\"badge\">\n                    <img src=\"").concat(data.list[i].experUrl, "\" alt=\"\">\n                    <img style=\"display:").concat(data.list[i].nobleId == 0 ? 'none' : 'inline', ";\" src=\"./images/").concat(data.list[i].nobleId == 1 ? 'putong.png' : data.list[i].nobleId == 2 ? 'gaoji.png' : data.list[i].nobleId == 3 ? 'baiyin.png' : data.list[i].nobleId == 4 ? 'huangjin.png' : data.list[i].nobleId == 5 ? 'bojin.png' : data.list[i].nobleId == 6 ? 'zuanshi.png' : data.list[i].nobleId == 7 ? 'xingyao.png' : "putong.png", "\" alt=\"\">\n                  </p>\n                </div>\n              </div>\n              <div class=\"user-count d-flex\">\n                <span>").concat(data.list[i].totalCount.toString().length > 8 ? data.list[i].totalCount.toString()[0] + "." + data.list[i].totalCount.toString()[1] + data.list[i].totalCount.toString()[2] + "亿" : data.list[i].totalCount, "</span>\n                <img style=\"width: 15px;height: 15px;margin-left: 5px;\" src=\"./images/y-bean.png\" alt=\"\">\n              </div>\n            </div>");
  }
  $(".rank-list").append(str)
}

// 渲染记录
function renderRecord(data, type){
  var str = "";
  if(type == 1){
    for(var i=0; i<data.length; i++){
      str += "<div class='d-flex'>" +
                "<p style='width: 30%;'>" + data[i].date + "</p>" +
                "<p class='text-center' style='width: 55%;'>" + data[i].prizeName + "<br />(" + data[i].prizeValue + "约豆)</p>" +
                "<p class='text-center' style='width: 15%;'>" + data[i].prizeNum + "</p>" +
              "</div>"
    }
    $(".record-list>div").append(str);
  }else if(type == 2){
    for(var i=0; i<data.length; i++){
      str += "<div class='d-flex'>" +
                "<p style='width: 30%;'>" + data[i].date +"</p>" +
                "<p class='text-center' style='width: 50%;'>" + data[i].typeDes + "</p>" +
                "<p class='text-center' style='width: 20%'>" + data[i].num + "</p>" +
              "</div>"
    }
    $(".record-list>div").append(str);
  }
}

// 渲染奖池
function renderPrize(data){
  // 普通
  var woodStr = "";
  for(var i=0; i<data.hitballNormalPool.length; i++){
    var rate = (data.hitballNormalPool[i].showRate.replace(/%/g, "") * 100).toString();
    var hasPoint = rate.split(".");
    if(hasPoint.length == 1){
      data.hitballNormalPool[i].showRate = rate;
    }else{
      data.hitballNormalPool[i].showRate = hasPoint[0] + "." + hasPoint[1][0]
    }

    var chance = data.hitballNormalPool[i].showRate + "‱"
    woodStr += "<tr>" +
              "<td>" +
                "<img src='"+ data.hitballNormalPool[i].prizeImgUrl +"'>" +
              "</td>" +
              "<td>"+ data.hitballNormalPool[i].prizeName +"</td>" +
              "<td>"+ chance +"</td>"
            "</tr>"
  }
  $(".gift-list.woodTable table tbody tr").remove();
  $(".gift-list.woodTable table tbody").append(woodStr);

  // 黄金
  var goldStr = ""
  for(var i=0; i<data.hitballGoldPool.length; i++){
    var rate = (data.hitballGoldPool[i].showRate.replace(/%/g, "") * 100).toString();
    var hasPoint = rate.split(".");
    if(hasPoint.length == 1){
      data.hitballGoldPool[i].showRate = rate;
    }else{
      data.hitballGoldPool[i].showRate = hasPoint[0] + "." + hasPoint[1][0]
    }

    var chance = data.hitballGoldPool[i].showRate + "‱"
    goldStr += "<tr>" +
              "<td>" +
                "<img src='"+ data.hitballGoldPool[i].prizeImgUrl +"'>" +
              "</td>" +
              "<td>"+ data.hitballGoldPool[i].prizeName +"</td>" +
              "<td>"+ chance +"</td>"
            "</tr>"
  }
  $(".gift-list.goldTable table tbody tr").remove();
  $(".gift-list.goldTable table tbody").append(goldStr);

  // 稀有
  var rareStr = "";
  for(var i=0; i<data.hitballTreasurePool.length; i++){
    var rate = (data.hitballTreasurePool[i].showRate.replace(/%/g, "") * 100).toString();
    var hasPoint = rate.split(".");
    if(hasPoint.length == 1){
      data.hitballTreasurePool[i].showRate = rate;
    }else{
      data.hitballTreasurePool[i].showRate = hasPoint[0] + "." + hasPoint[1][0]
    }

    var chance = data.hitballTreasurePool[i].showRate + "‱"
    rareStr += "<tr>" +
              "<td>" +
                "<img src='"+ data.hitballTreasurePool[i].prizeImgUrl +"'>" +
              "</td>" +
              "<td>"+ data.hitballTreasurePool[i].prizeName +"</td>" +
              "<td>"+ chance +"</td>"
            "</tr>"
  }
  $(".gift-list.rareTable table tbody tr").remove();
  $(".gift-list.rareTable table tbody").append(rareStr);
}



// 过滤名字
function truncated(str, num) {
  var s = '';
  for (var v of str) {
    s += v;
    num--;
    if (num <= 0) {
      break;
    }
  }
  return s + "..";
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

    if(res.path == 'hitball/drawHitball'){
        var str = "";

        // 清理礼物元素
        if($(".mid .ag").length > 50){
          for(var i=0; i<30; i++){
            $(".mid .ag")[0].remove();
          }
        }
        oldGiftLength = res.data.prizeItemVoList.length;

        if(res.data.prizeItemVoList.length == 1){
          str += "<div class='ag animate_gift0'>" +
                    "<img src='"+ res.data.prizeItemVoList[0].prizeImgUrl +"'>" +
                    "<span>×"+ res.data.prizeItemVoList[0].prizeNum +"</span>" +
                  "</div>"

          $(".mid").append(str)
        }else{
          var arr = [];
          for(var j=0; j<res.data.prizeItemVoList.length; j++){
            arr.push(res.data.prizeItemVoList[j])
          }
          arr.reverse();
          if(arr.length > 8){
            for(var i=0; i<8; i++){
              str += "<div class='ag animate_gift"+ i +"'>" +
                        "<img src='"+ arr[i].prizeImgUrl +"'>" +
                        "<span>×"+ arr[i].prizeNum +"</span>" +
                      "</div>"
            }
          }else{
            for(var i=0; i<arr.length; i++){
              str += "<div class='ag animate_gift"+ i +"'>" +
                        "<img src='"+ arr[i].prizeImgUrl +"'>" +
                        "<span>×"+ arr[i].prizeNum +"</span>" +
                      "</div>"
            }
          }
          
          $(".mid").append(str)
        }

        $(".stoneNum span").text(res.data.remainKeyNum)

    }else if(res.path == 'hitball/type/rankinglist'){
      $(".rank-list>div").remove()
      renderRank(res.data)

    }else if(res.path == 'hitball/hitball_record'){
      if(res.data.length > 0){
        pageNo += 1;
      }
      renderRecord(res.data, 1)

    }else if(res.path == 'hitball/hitball_stone_record'){
      if(res.data.length > 0){
        pageNo += 1;
      }
      renderRecord(res.data, 2)

    }else if(res.path == 'hitball/userkey'){
      $(".stoneNum span").text(res.data);

    }else if(res.path == 'hitball/prizes'){
      renderPrize(res.data)

    }

  }else if(res.resCode == 9000){
    console.log("格式转换错误");

  }else if(res.resCode == 9001){
    console.log("请求路径不能为空");

  }else if(res.resCode == 9002){
    console.log("请求方法不正确");

  }else if(res.resCode == 10006 && res.path == '/hitball/drawHitball'){
    $(".toast").text("石头不够").fadeTo(400, 1)
    setTimeout(function(){
      $(".toast").fadeTo(400, 0)
    }, 1500)
  }else if(res.path == '/hitball/drawHitball' && res.resCode == 1413){
    $(".toast").text("请输入支付密码").fadeTo(400, 1)
    setTimeout(function(){
      $(".toast").fadeTo(400, 0)
    }, 1500)
  }else{
    showToast("网络错误，请稍后再试")
  }
}
