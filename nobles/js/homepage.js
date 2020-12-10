var info = {}
var api = locateJudge()
var noblePower = []
var status = ""
if (EnvCheck() == "test") {
  var vConsole = new VConsole()
}
var browser = checkVersion()
var env = EnvCheck()
var locateObj = getQueryString();

var nobleArr = []
var nobleUser = {}

$(function () {
  // $(".loading").show()
  if (browser.app) {
    if (browser.ios) {
      window.webkit.messageHandlers.getUid.postMessage(null)
      window.webkit.messageHandlers.getTicket.postMessage(null)
      window.webkit.messageHandlers.loadingStatus.postMessage(null)
      window.webkit.messageHandlers.getAppVersion.postMessage(null);
      // info.loadingStatus = '1';
    } else if (browser.android) {
      if (androidJsObj && typeof androidJsObj === "object") {
        info.uid = parseInt(window.androidJsObj.getUid())
        info.ticket = window.androidJsObj.getTicket()
        info.appVersion = window.androidJsObj.getAppVersion();
        info.loadingStatus = "0"
      }
    }
  } else {
    info.appVersion = "1.5.5"
  }
  if (browser.app && browser.ios) {
    $(".copyBtn").html("长按微信号复制")
  }
  setTimeout(function () {
    info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
    getNobleMsg()
  }, 100)

  function getNobleMsg() {
    if(browser.app && info.useNew){
      var obj1 = {
        method: 1,
        path: "noble/right/list",
      }

      if(browser.android){
        window.androidJsObj.frontHttpRequest(JSON.stringify(obj1))
      }else if(browser.ios){
        var data1 = JSON.stringify(obj1)
        window.webkit.messageHandlers.frontHttpRequest.postMessage(data1);
      }
    }else{
      var ajaxList = $.ajax({
        url: api + "/noble/right/list",
        type: "get",
        dataType: "json",
        headers: {
          "pub_ticket": info.ticket
        },
        success: function (res) {
          if (res.code == 200) {
            console.log(res, "会员列表")
            nobleArr = res.data
            // renderPowerList(nobleArr[0]);
          }
        },
      })
  
      var ajaxUser = $.ajax({
        url: api + "/noble/users/get",
        type: "get",
        dataType: "json",
        data: {
          ticket: info.ticket,
        },
        headers: {
          "pub_ticket": info.ticket
        },
        success: function (res) {
          if (res.code == 200) {
            console.log(res, "个人会员详情")
            nobleUser = res.data
            showAuthority(nobleUser)
            var nobleId = nobleUser.nobleId
            showTable(nobleId - 1)
  
            if(browser.ios){
              // for(var i=0; i<5; i++){
                // $(".privilege-list ul li").css("display", "flex")
              // }
              switch(res.data.nobleId){
                case 1:{
                  $(".privilege-list ul li:lt(3)").css("display", "flex");
                  break;
                }
                case 2:{
                  $(".privilege-list ul li:lt(5)").css("display", "flex");
                  break;
                }
                case 3:{
                  $(".privilege-list ul li:lt(5)").css("display", "flex");
                  break;
                }
                case 4:{
                  $(".privilege-list ul li:lt(7)").css("display", "flex");
                  break;
                }
                case 5:{
                  $(".privilege-list ul li:lt(9)").css("display", "flex");
                  break;
                }
                case 6:{
                  $(".privilege-list ul li:lt(12)").css("display", "flex");
                  break;
                }
                case 7:{
                  $(".privilege-list ul li").css("display", "flex");
                  break;
                }
              }
              if(res.data.nobleId >= 2){
                $(".foot-button").text("续费VIP")
              }
            }else{
              $(".privilege-list ul li").css("display", "flex")
            }
  
            $(".foot-button").on("click", function () {
              var env = EnvCheck()
              if (env == "test") {
                if(locateJudge().match(/preview/)){
                  window.location.href = "https://preview.api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=" + nobleUser.nobleId
                }else{
                  window.location.href = "https://api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=" + nobleUser.nobleId
                }
              } else {
                window.location.href = "https://prod.api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=" + nobleUser.nobleId
              }
              console.log("点击了")
            })
          }
        },
      })
      $.when(ajaxList, ajaxUser).done(function (ajax1, ajax2) {
        var res1 = ajax1[0],
          res2 = ajax2[0]
        var user = res2.data
        var nobleId = user.nobleId
        renderPowerList(nobleArr[nobleId - 1])
        renderSettingList(user, nobleArr)
        renderBottom(user.expire, nobleId)
      })
    }
  }
  $(".attention .upgrade").on("click", function () {
    var index = nobleUser.nobleId + 1
    var str = "?nobleIndex=" + index
    if (env == "test") {
      if(locateJudge().match(/preview/)){
        window.location.href = "https://preview.api.99date.hudongco.com/modules/nobles/order.html" + str
      }else{
        window.location.href = "https://api.99date.hudongco.com/modules/nobles/order.html" + str
      }
    } else {
      window.location.href = "https://prod.api.99date.hudongco.com/modules/nobles/order.html" + str
    }
  })
  $(".copyBtn").on("click", function () {
    var weixinNum = $(this).siblings("span").html()
    if (browser.app) {
      if (browser.android) {
        window.androidJsObj.clipboardToPhone(weixinNum)
        $(".copySucess").show()
        setTimeout(function () {
          $(".copySucess").hide()
        }, 800)
      }
    }
  })
  initNav(showTitleRightNoticeFuck())
})
window.onload = function () {
  setTimeout(function () {
    $(".loading").css("display", "none")
  }, 800)
  console.log($("#loading"))
}

function renderPowerList(obj) {
  noblePower = []
  noblePower.push(obj.userPage)
  noblePower.push(obj.userMedal)
  noblePower.push(obj.nobleGift)
  noblePower.push(obj.specialFace)
  noblePower.push(obj.enterNotice)
  noblePower.push(obj.roomBackground)
  noblePower.push(obj.micDecorate)
  noblePower.push(obj.chatBubble)
  noblePower.push(obj.micHalo)
  noblePower.push(obj.enterHide)
  noblePower.push(obj.rankHide)
  noblePower.push(obj.specialService)
  noblePower.push(obj.goodNum)
  noblePower.push(obj.recomRoom)
  noblePower.push(obj.prevent)

  var $li = $(".privilege-list li")
  for (var i = 0; i < noblePower.length; i++) {
    if (noblePower[i]) {
      // $li.eq(i).addClass('active');
    } else {
      // $li.eq(i).removeClass('active');
    }
  }

  $(".noble-wrapper").attr("class", "noble-wrapper noble-" + obj.id)
  // $(".noble-wrapper").attr("class", "noble-wrapper noble-" + 7)
  $(".noble-title .title span").html(obj.name)
}

function renderSettingList(nobleUserObj, nobleArr) {
  var $list = $(".middle ul li")
  var nobleId = nobleUserObj.nobleId
  var noble = nobleArr[nobleId - 1]
  // 根据个人来设置相应信息
  switch (nobleId) {
    case 5:
      if (nobleUserObj.enterHide) {
        $list.eq(1).find(".button-wrapper").addClass("active")
      }
      break
    case 6:
    case 7:
      $list
        .eq(0)
        .find(".title")
        .html(nobleUserObj.nobleName + "靓号")
      if (nobleUserObj.goodNum) {
        $list.eq(0).find(".msg").html(nobleUserObj.goodNum)
      }
      if (nobleUserObj.enterHide) {
        $list.eq(1).find(".button-wrapper").addClass("active")
      }
      if (nobleUserObj.rankHide) {
        $list.eq(2).find(".button-wrapper").addClass("active")
      }
      break
  }

  // 根据权限来显示相应的设置
  var middleArr = [
    noble.goodNum,
    noble.enterHide,
    noble.rankHide,
    noble.recomRoom,
    noble.specialService,
  ]
  for (var i = 0; i < middleArr.length; i++) {
    if (middleArr[i]) {
      $list.eq(i).css("display", "flex")
    }
  }
  // $("#loading").css("display","none")
}

function renderBottom(time, nobleId) {
  var browser = checkVersion()
  // console.log(nobleId)
  var expireTime = new Date(time)
  $(".expire-time span").html(getDate(expireTime))
  if (nobleId == 7 || nobleId == 0 || browser.ios) {
    $(".upgrade").hide()
  } else {
    $(".upgrade").show()
  }

  if (browser.ios) {
    $(".con").hide()
  } else {
    $(".con").show()
  }
}

function showTable(index) {
  // console.log(index)
  var priArray1 = $(".privilege")
  var priArray2 = $(".privilege-ccc")
  // console.log(priArray1, priArray2)
  if (index === 0) {
    for (var i = 0; i <= priArray1.length; i++) {
      priArray1.show().siblings("img").hide()
    }
  } else {
    priArray1.each(function (i) {
      if (2 < i && i < 5) {
        $(this).hide().siblings("img").show()
        $(priArray1[5]).show().siblings("img").hide()
        $(priArray1[6]).show().siblings("img").hide()
        $(priArray1[7]).show().siblings("img").hide()
        $(priArray1[8]).show().siblings("img").hide()
        $(priArray1[9]).show().siblings("img").hide()
        $(priArray1[10]).show().siblings("img").hide()
        $(priArray1[11]).show().siblings("img").hide()
        $(priArray1[12]).show().siblings("img").hide()
        $(priArray1[13]).show().siblings("img").hide()
      } else if (2 < i && i < 7 && index === 3) {
        $(this).hide().siblings("img").show()
        $(priArray1[8]).show().siblings("img").hide()
        $(priArray1[9]).show().siblings("img").hide()
        $(priArray1[10]).show().siblings("img").hide()
        $(priArray1[11]).show().siblings("img").hide()
        $(priArray1[12]).show().siblings("img").hide()
        $(priArray1[13]).show().siblings("img").hide()
      } else if (2 < i && i < 9 && index === 4) {
        $(this).hide().siblings("img").show()
        $(priArray1[10]).show().siblings("img").hide()
        $(priArray1[11]).show().siblings("img").hide()
        $(priArray1[12]).show().siblings("img").hide()
        $(priArray1[13]).show().siblings("img").hide()
      } else if (2 < i && i < 12 && index === 5) {
        $(this).hide().siblings("img").show()
        $(priArray1[12]).show().siblings("img").hide()
        $(priArray1[13]).show().siblings("img").hide()
      } else if (2 < i && index === 6) {
        $(this).hide().siblings("img").show()
      }
    })
  }
}

function getMessage(key, value) {
  info[key] = value
}

function shareInfo() {}

function getDate(time) {
  var date = new Date(time)
  return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
}
//判断个人会员详情 展示权限
function showAuthority(nobleUser) {
  // console.log(nobleUser,"++++++")
  var goodMobNum = $('.exclusive-privilegee .good-box')
  var roomHiding = $('.exclusive-privilegee .room-hiding-box')
  var rankHiding = $('.exclusive-privilegee .rank-hiding-box')
  var recommendRoom = $('.exclusive-privilegee .recommend-room-box')
  var exclusiveService = $('.exclusive-privilegee .exclusive-service-box')
  if (nobleUser.nobleId == 5) {
    roomHiding.show()
  }
  if (nobleUser.nobleId == 6) {
    goodMobNum.show()
    roomHiding.show()
    rankHiding.show()
    exclusiveService.show()
  }
  if (nobleUser.nobleId == 7) {
    // console.log(nobleUser.enterHide)
    goodMobNum.show()
    roomHiding.show()
    rankHiding.show()
    exclusiveService.show()
    recommendRoom.show()
  }
  if (nobleUser.nobleId == 5 || nobleUser.nobleId == 6 || nobleUser.nobleId == 7) {
    if (nobleUser.enterHide === 0) {
      roomHiding.find('.swtich1').removeClass('swtich-on').addClass('swtich-off')
    } else if (nobleUser.enterHide === 1) {
      roomHiding.find('.swtich1').addClass('swtich-on').removeClass('swtich-off')
    }
    if (nobleUser.rankHide === 0) {
      rankHiding.find('.swtich2').removeClass('swtich-on').addClass('swtich-off')
    } else if (nobleUser.rankHide === 1) {
      rankHiding.find('.swtich2').addClass('swtich-on').removeClass('swtich-off')
    }
  }
}
//点击专属靓号
$('.good-mob-num').on('click', function () {
  
  if (env == "test") {
    if(locateJudge().match(/preview/)){
      window.location.href = 'https://preview.api.99date.hudongco.com/modules/nobles/numApply.html'
    }else{
      window.location.href = 'https://api.99date.hudongco.com/modules/nobles/numApply.html'
    }
  } else {
    window.location.href = 'https://prod.api.99date.hudongco.com/modules/nobles/numApply.html'
  }
})
//点击是否开启聊天室隐身权限
$(".room-hiding span").on("click", function () {
  var swtich = $(".swtich1")
  if (swtich.hasClass("swtich-on")) {
    swtich.removeClass("swtich-on").addClass("swtich-off")
    status = 0
  } else {
    swtich.removeClass("swtich-off").addClass("swtich-on")
    status = 1
  }
  $("#loading").show()
  // console.log(status, "++")

  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: 'noble/users/hideenter',
      params: {
        val: status,
        ticket: info.ticket,
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
      url: api + "/noble/users/hideenter",
      type: "get",
      dataType: "json",
      data: {
        val: status,
        ticket: info.ticket,
      },
      headers: {
        "pub_ticket": info.ticket
      },
      success: function (res) {
        // console.log(res)
        if (res.code == 200) {
          setTimeout(function () {
            $("#loading").hide()
          }, 1000)
        }
      },
    })
  }
})

//点击是否开启榜单隐身权限
$(".rank-hiding span").on("click", function () {
  var swtich = $(".swtich2")
  if (swtich.hasClass("swtich-on")) {
    swtich.removeClass("swtich-on").addClass("swtich-off")
    status = 0
  } else {
    swtich.removeClass("swtich-off").addClass("swtich-on")
    status = 1
  }
  $("#loading").show()

  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: 'noble/users/hiderank',
      params: {
        val: status,
        ticket: info.ticket,
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
      url: api + "/noble/users/hiderank",
      type: "get",
      dataType: "json",
      data: {
        val: status,
        ticket: info.ticket,
      },
      headers: {
        "pub_ticket": info.ticket
      },
      success: function (res) {
        if (res.code == 200) {
          setTimeout(function () {
            $("#loading").hide()
          }, 1000)
        }
      },
    })
  }
})
//点击推荐房间上热门
$(".recommend-room").on("click", function () {
  var env = EnvCheck()
  if (env == "test") {
    if(locateJudge().match(/preview/)){
      window.location.href = "https://preview.api.99date.hudongco.com/modules/nobles/room-recommend.html"
    }else{
      window.location.href = "https://api.99date.hudongco.com/modules/nobles/room-recommend.html"
    }
  }else{
    window.location.href = "https://prod.api.99date.hudongco.com/modules/nobles/room-recommend.html"
  }
})
//点击专属客服
$('.exclusive-service').on('click', function () {
  $('.contactMask').show();
})

$(".contactMask").on("click", function (e) {
  $(this).hide()
})
$(".contactMask .win").on("click", function (e) {
  if ($(e.target).hasClass("win-button")) {
    $(this).parent().hide()
  }
  e.stopPropagation()
})

function showTitleRightNoticeFuck() {
  var linkUrl = ""
  if (EnvCheck() == "test") {
    if(locateJudge().match(/preview/)){
      linkUrl = "https://preview.api.99date.hudongco.com/modules/record/index.html?id=1"
    }else{
      linkUrl = "https://api.99date.hudongco.com/modules/record/index.html?id=1"
    }
  } else {
    linkUrl = "https://prod.api.99date.hudongco.com/modules/record/index.html?id=1"
  }
  var obj = {
    type: 1,
    data: {
      msg: "wewawa",
      title: "开通记录",
      link: linkUrl,
    },
  }
  return obj
}


// app -> js
function frontHttpResponse(res){
  console.log(res)
  if(res.resCode == 0){
    var data
    if(res.data){
      data = res.data
    }

    if(res.path == 'noble/right/list'){
      nobleArr = data

      var obj2 = {
        method: 1,
        path: "noble/users/get",
        params: {
          ticket: info.ticket
        }
      }

      if(browser.android){
        window.androidJsObj.frontHttpRequest(JSON.stringify(obj2))
      }else if(browser.ios){
        var data2 = JSON.stringify(obj2)
        window.webkit.messageHandlers.frontHttpRequest.postMessage(data2);
      }
    }else if(res.path == 'noble/users/get'){
      console.log(res, "个人会员详情")
      nobleUser = data
      showAuthority(nobleUser)
      var nobleId = nobleUser.nobleId
      showTable(nobleId - 1)

      if(browser.ios){
        // for(var i=0; i<5; i++){
          // $(".privilege-list ul li").css("display", "flex")
        // }
        switch(data.nobleId){
          case 1:{
            $(".privilege-list ul li:lt(3)").css("display", "flex");
            break;
          }
          case 2:{
            $(".privilege-list ul li:lt(5)").css("display", "flex");
            break;
          }
          case 3:{
            $(".privilege-list ul li:lt(5)").css("display", "flex");
            break;
          }
          case 4:{
            $(".privilege-list ul li:lt(7)").css("display", "flex");
            break;
          }
          case 5:{
            $(".privilege-list ul li:lt(9)").css("display", "flex");
            break;
          }
          case 6:{
            $(".privilege-list ul li:lt(12)").css("display", "flex");
            break;
          }
          case 7:{
            $(".privilege-list ul li").css("display", "flex");
            break;
          }
        }
        if(data.nobleId >= 2){
          $(".foot-button").text("续费VIP")
        }
      }else{
        $(".privilege-list ul li").css("display", "flex")
      }

      $(".foot-button").on("click", function () {
        var env = EnvCheck()
        if (env == "test") {
          if(locateJudge().match(/preview/)){
            window.location.href = "https://preview.api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=" + nobleUser.nobleId
          }else{
            window.location.href = "https://api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=" + nobleUser.nobleId
          }
        } else {
          window.location.href = "https://prod.api.99date.hudongco.com/modules/nobles/order.html?nobleIndex=" + nobleUser.nobleId
        }
        console.log("点击了")
      })

      var user = data
      var nobleId = user.nobleId
      renderPowerList(nobleArr[nobleId - 1])
      renderSettingList(user, nobleArr)
      renderBottom(user.expire, nobleId)

    }else if(res.path == 'noble/users/hideenter'){
      setTimeout(function () {
        $("#loading").hide()
      }, 1000)

    }else if(res.path == 'noble/users/hiderank'){
      setTimeout(function () {
        $("#loading").hide()
      }, 1000)
      
    }
  }
}