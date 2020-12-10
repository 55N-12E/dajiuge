var vConsole;
if (EnvCheck() == "test") {
  vConsole = new VConsole()
}
var nobleArr = []
var user = {
  nobleStatus: 300,
  goldNum: 0,
}
var moneyText = ""
var browser = checkVersion()
var successUrl = ""
var nobleUser = {}
var locateObj = getQueryString()
var prefix = locateJudge()
var env = EnvCheck()
var info = {
  nobleId: locateObj.nobleIndex
}

if (env == "test") {
  successUrl = "https://api.99date.hudongco.com/modules/nobles/paySuccess.html"
} else {
  successUrl = "https://prod.api.99date.hudongco.com/modules/nobles/paySuccess.html"
}

$(function () {
  shareInfo()
  if (browser.app) {
    if (browser.ios) {
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null)
      window.webkit.messageHandlers.getRoomUid.postMessage(null)
      window.webkit.messageHandlers.getAppVersion.postMessage(null);
      info.loadingStatus = "1"
    } else if (browser.android) {
      if (androidJsObj && typeof androidJsObj === "object") {
        info.uid = parseInt(window.androidJsObj.getUid())
        info.roomUid = window.androidJsObj.getRoomUid()
        info.ticket = window.androidJsObj.getTicket()
        info.appVersion = window.androidJsObj.getAppVersion();
        info.loadingStatus = "0"
      }
    }
  } else {
    info.uid = 924229
    info.loadingStatus = "0"
    // info.loadingStatus = "0"
    info.appVersion = "1.5.5"
  }
  // if(info.loadingStatus =='1'){
  //   $('.buttonWrapper .payButton').addClass('iosPay')
  // }else{
  //   $('.buttonWrapper .payButton').addClass('andPay')
  // }
  // if(browser.app && browser.ios){
  //   // $('.copyBtn').html('长按微信号复制');
  // }

  // 判断是苹果还是安卓，对应显示支付方式
  setTimeout(function () {
    info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
    getAjaxMsg()
    
    if(locateObj.nobleIndex == 7){
      $(".payButton").css("filter", "grayScale(1)")
    }
  }, 300)

  function getAjaxMsg() {
    if(browser.app && info.useNew){
      var obj1 = {
        method: 1,
        path: "noble/right/list"
      }
      var obj2 = {
        method: 1,
        path: "noble/users/validNobleUserList",
        params: {
          ticket: info.ticket
        }
      }
      var obj3 = {
        method: 1,
        path: "purse/query",
        params: {
          ticket: info.ticket
        }
      }

      if(browser.android){
        window.androidJsObj.frontHttpRequest(JSON.stringify(obj1))
        window.androidJsObj.frontHttpRequest(JSON.stringify(obj2))
        window.androidJsObj.frontHttpRequest(JSON.stringify(obj3))
      }else if(browser.ios){
        var data1 = JSON.stringify(obj1)
        var data2 = JSON.stringify(obj2)
        var data3 = JSON.stringify(obj3)
        window.webkit.messageHandlers.frontHttpRequest.postMessage(data1);
        window.webkit.messageHandlers.frontHttpRequest.postMessage(data2);
        window.webkit.messageHandlers.frontHttpRequest.postMessage(data3);
      }
    }else{
      var getNobleList = $.ajax({
        url: prefix + "/noble/right/list",
        type: "get",
        dataType: "json",
        headers: {
          "pub_ticket": info.ticket
        }
      })
  
      var getNobleUser = $.ajax({
        url: prefix + "/noble/users/validNobleUserList",
        type: "get",
        dataType: "json",
        data: {
          uid: info.uid,
          ticket: info.ticket,
        },
        headers: {
          "pub_ticket": info.ticket
        }
      })
  
      var getUserCoin = $.ajax({
        url: prefix + "/purse/query",
        headers: {
          "pub_ticket": info.ticket,
          "Content-Type": "text/plain;charset=UTF-8",
        },
        type: "get",
        dataType: "json",
        data: {
          uid: info.uid,
          ticket: info.ticket,
        },
      })
  
      $.when(getNobleList, getNobleUser, getUserCoin).done(function (
        ajax1,
        ajax2,
        ajax3
      ) {
        var res1 = ajax1[0],
          res2 = ajax2[0],
          res3 = ajax3[0]
        console.log(ajax1, ajax2, ajax3)
        if (res1.code == 200) {
          if (info.loadingStatus == "1") {
            switchNobleArr(res1.data)
            nobleArr = res1.data.reverse()
            console.log(nobleArr, "123")
          } else {
            nobleArr = res1.data.reverse()
            console.log(nobleArr, "456")
          }
        }
        if(res2.code == 200){
          nobleUser = res2.data

          if (info.loadingStatus == "0") {
            setTimeout(function(){
              renderNobleList("coin")
            }, 100)
            $(".payWayBox").show()
          } else if (info.loadingStatus == "1") {
            // 审核中版本
            setTimeout(function(){
              renderNobleList("money")
            }, 100)
            $(".payWayBox").hide()
          }
        }else{
          nobleUser = []
        }

        if (info.loadingStatus == "0") {
          setTimeout(function(){
            renderNobleList("coin")
          }, 100)
          $(".payWayBox").show()
        } else if (info.loadingStatus == "1") {
          // 审核中版本
          setTimeout(function(){
            renderNobleList("money")
          }, 100)
          $(".payWayBox").hide()
        }
        
        // chagngBbc(nobleUser)
        if (res3.code == 200) {
          user.goldNum = res3.data.goldNum
          $(".WeChat .balance span").html(user.goldNum.toFixed(1)+"约豆")
        }
      })

      renderFirstNobleMsg()
    }
  }

  initNav(openVip())
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
    } else if (browser.ios) {
      window.webkit.messageHandlers.clipboardToPhone.postMessage(weixinNum)
    }
  }
})

// 高出贵族部分置灰
function chagngBbc(nobleUser) {
  console.log(nobleUser, "456")
  if (nobleUser) {
    if (nobleUser.nobleId >= 2) {
      $(" .WrapperBox .nanjue div").addClass("active")
      $(" .WrapperBox .nanjue ")
        .siblings("div")
        .find("i,.money")
        .css("color", "#999")
    }
    if (nobleUser.nobleId >= 3) {
      $(" .WrapperBox .zijue div").addClass("active")
      $(" .WrapperBox .zijue ")
        .siblings("div")
        .find("i,.money")
        .css("color", "#999")
    }
    if (nobleUser.nobleId >= 4) {
      $(" .WrapperBox .bojue div").addClass("active")
      $(" .WrapperBox .bojue ")
        .siblings("div")
        .find("i,.money")
        .css("color", "#999")
    }
    if (nobleUser.nobleId >= 5) {
      $(" .WrapperBox .houjue div").addClass("active")
      $(" .WrapperBox .houjue ")
        .siblings("div")
        .find("i,.money")
        .css("color", "#999")
    }
    if (nobleUser.nobleId > 6) {
      $(" .WrapperBox .gongjue div").addClass("active")
      $(" .WrapperBox .gongjue ")
        .siblings("div")
        .find("i,.money")
        .css("color", "#999")
    }
  }
}

$(".payProWrapperList .WrapperList ").on("click", ".WrapperBox", function () {
  console.log(214)
  // 贵族产品点击事件
  if ($(this).hasClass(".active")) {
    return
  }
  // var $button = $(".buttonWrapper")
  var index = $(this).index()
  info.nobleId = nobleArr[index].id
  // if (nobleUser && nobleArr[index].id < nobleUser.nobleId) {
  //   return
  // }
  console.log(nobleArr[index])
  $(".payButton").css("filter", "grayScale(0)")
  if (nobleArr[index].id === 7) {
    return
  }
  if($(this).hasClass("openFee")){
    moneyText = nobleArr[index].openGold
  }else{
    moneyText = nobleArr[index].renewGold
  }
  
  $(this).addClass("active").siblings(".WrapperBox").removeClass("active")
})

// $(".payWayBox .pay-box ").on("click", function () {
//   if ($(this).hasClass("active")) {
//     return
//   }
//   var $button = $(".buttonWrapper")
//   var index = $(this).index()
//   console.log(index)
//   var $actList = $(".WrapperList .active ")

//   if (index < 1) {
//     // 用金币支付的情况下
//     renderNobleList("coin")
//   } else {
//     renderNobleList("money")
//   }
//   $(this).addClass("active").siblings(".pay-box ").removeClass("active")
//   $button.find(".price").html($actList.find(".money").html())
//   console.log("点击支付切换")
// })

function renderNobleList(moneyType) {
  // var moneyType = "coin"
  // info.loadingStatus = "0"
  // 用于渲染列表
  var $list = $(".WrapperList .WrapperBox")
  if (info.loadingStatus == "1") {
    $list.eq(0).hide()
    $list.eq(1).hide()
    $list.eq(2).hide()
    $list.eq(3).hide()
    $list.eq(4).hide()
    $list.eq(5).css({"marginRight":"18PX", "display":"flex"})
    $list.eq(6).css({"marginRight":"0", "display":"flex"})
  } else {
    $list.eq(0).css("display", "flex")
    $list.eq(1).css("display", "flex")
    $list.eq(2).css("display", "flex")
    $list.eq(3).css("display", "flex")
    $list.eq(4).css("display", "flex")
    $list.eq(5).css("display", "flex")
    $list.eq(6).css("display", "flex")
    $('.payWay').show()
  }
  if (moneyType == "coin") {
    $('.payWay').show()
    for (var i = 0; i < nobleArr.length; i++) {
      var price = ''
      if(i===0){
        price = '暂不支持付费开通'
      }else{
        //开通
        price = formatPrice(nobleArr[i].openGold) + "约豆" //+ addComma(nobleArr[i].openGold / 100)+ "元"
        
        for(var j=0; j<nobleUser.length; j++){
          if (nobleUser[j].nobleId == nobleArr[i].id) {
            $(".WrapperBox").eq(i).removeClass("openFee");
            //续费价格
            price = formatPrice(nobleArr[i].renewGold) + "约豆"
          }
        }
      }
      $list.eq(i).find(".money").html(price)
    }
  } else if (moneyType == "money") {
    $('.payWay').hide()
    for (var i = 0; i < nobleArr.length; i++) {
      for(var j=0; j<nobleUser.length; j++){
        if (nobleUser[j].nobleId == nobleArr[i].id) {
          $(".WrapperBox").eq(i).removeClass("openFee");
        }
      }
    }
  }

  if(browser.ios){
    $(".WrapperList .WrapperBox").eq(5).find(".money").html("¥30")
    $(".WrapperList .WrapperBox").eq(6).find(".money").html("¥18")
  }
}

function renderFirstNobleMsg() {
  console.log(locateObj)
  $(".WrapperList .WrapperBox").eq(7 - locateObj.nobleIndex).addClass("active")
}

function switchNobleArr(nobleArr) {
  var arr = [73, 588, 1998, 6498]
  for (var i = 0; i < nobleArr.length; i++) {
    if (i <= 3) {
      nobleArr[i].openGold = arr[i] * 10
      nobleArr[i].renewGold = arr[i] * 10
    }
    nobleArr[i].openReturn = 0
    nobleArr[i].renewReturn = 0
  }
}
$(".payButton").on("click", function () {
  var $payEnsure = $(".payEnsure")
  if(info.nobleId == 7){
    return
  }

  if (info.loadingStatus == 1) {
    payForIos()
  } else {
    if($('.buttonWrapper .payButton').hasClass('Alipay')){
      payForMoney("alipay_wap")
    }else{
      $payEnsure.find(".text span").html(moneyText + "约豆")
        $(".payEnsure").show()
    }
  }
})

//约豆支付
function payForCoin() {
  $("#loading").show()
  // isPay = true;
  console.log("发起支付")
  var $actList = $(".payProWrapperList .WrapperList .active")
  var nobleId = 7 - $actList.index()
  var isOpen = $actList.hasClass("openFee")
  console.log(isOpen)
  // 判断是开通升级还是续费
  if (isOpen) {
    payForCoinWay("/noble/pay/open/bygold")
    console.log("open")
  } else {
    payForCoinWay("/noble/pay/renew/bygold")
    console.log("续费")
  }

  function payForCoinWay(url) {
    if(browser.app && info.useNew){
      var obj = {
        method: 1,
        path: url.substr(1),
        params: {
          nobleId: nobleId,
          clientIp: 0,
          roomUid: info.roomUid,
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
        url: prefix + url,
        type: "get",
        dataType: "json",
        data: {
          uid: info.uid,
          nobleId: nobleId,
          clientIp: 0,
          roomUid: info.roomUid,
          ticket: info.ticket,
        },
        beforeSend(xhr){
          xhr.setRequestHeader("pub_ticket", info.ticket)
        },
        success: function (res) {
          $("#loading").hide()
          if (res.code == 200) {
            $(".paySuccess").show()
            setTimeout(function () {
              window.location.href = successUrl
            }, 800)
          } else if (res.code == 2103) {
            console.log("余额不足")
            $(".payFail").html("约豆余额不足，请充值")
            $(".payFail").show()
            setTimeout(function () {
              $(".payFail").hide()
              //  这里输入跳去充值页
              if (browser.app) {
                if (browser.android) {
                  window.androidJsObj.openChargePage()
                } else if (browser.ios) {
                  window.webkit.messageHandlers.openChargePage.postMessage(null)
                }
              }
            }, 1500)
          } else if (res.code == 402) {
            console.log("账号被冻结")
            $(".payFail").html(res.message).fadeIn(30).fadeOut(3000)
          }
        },
        error(err){
          $("#loading").hide();
          if(err.status == 401){
            var obj = JSON.parse(err.responseText);
            if(obj.code == 1413){
              if(browser.ios){
                window.webkit.messageHandlers.showPasswordDialog.postMessage(null);
              }else if(browser.android){
                window.androidJsObj.showPasswordDialog();
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
}
//钱支付
function payForMoney(payType) {
  nobleUser
  var $actList = $(".payProWrapperList .WrapperList .active")
  var index = $actList.index()
  var nobleId = 7 - index
  var isOpen = $actList.hasClass("openFee")
  var $payWeChatQuestion = $(".payWeChatQuestion")
  // if(nobleId >= 7 && payType == "alipay_wap" && isOpen){
  //   //支付宝超额条件
  //   $('.payAlipayQuestion .coinPayButton span').html(addComma(nobleArr[$actList.index()].openGold));
  //   $('.payAlipayQuestion').show();
  //   return
  // }
  if (payType == "alipay_wap" && nobleArr[index].openGold > 1000000 && isOpen) {
    $(".payAlipayQuestion .coinPayButton span").html(
      addComma(nobleArr[$actList.index()].openGold)
    )
    $(".payAlipayQuestion").show()
    return
  }
  if (
    payType == "alipay_wap" &&
    nobleArr[index].renewGold > 1000000 &&
    !isOpen
  ) {
    $(".payAlipayQuestion .coinPayButton span").html(
      addComma(nobleArr[$actList.index()].renewGold)
    )
    $(".payAlipayQuestion").show()
    return
  }

  if (payType == "wx_wap" && nobleArr[index].openGold > 30000 && isOpen) {
    $payWeChatQuestion
      .find(".alipayButton span")
      .html(formatPrice(nobleArr[$actList.index()].openGold / 10))
    $payWeChatQuestion
      .find(".coinPayButton span")
      .html(addComma(nobleArr[$actList.index()].openGold))
    $payWeChatQuestion.show()
    return
  }
  if (payType == "wx_wap" && nobleArr[index].renewGold > 30000 && !isOpen) {
    $payWeChatQuestion
      .find(".alipayButton span")
      .html(formatPrice(nobleArr[$actList.index()].renewGold / 10))
    $payWeChatQuestion
      .find(".coinPayButton span")
      .html(addComma(nobleArr[$actList.index()].renewGold))
    $payWeChatQuestion.show()
    return
  }
  // if(payType == "wx_wap"){
  //   // 只有续费侯爵或者开通/续费侯爵以下的的段位时微信支付才起效
  //   if(nobleId == 4 && isOpen){
  //     // 如果刚好是开通侯爵段位的临界
  //     $payWeChatQuestion.find('.alipayButton span').html(formatPrice(nobleArr[$actList.index()].openGold/10));
  //     $payWeChatQuestion.find('.coinPayButton span').html(addComma(nobleArr[$actList.index()].openGold));
  //     $payWeChatQuestion.show();
  //     return;
  //   }else if(nobleId > 4){
  //     if(nobleId >= 7 && isOpen){
  //       // 开通皇帝的临界条件
  //       $payWeChatQuestion.find('.alipayButton').hide();
  //       $payWeChatQuestion.find('.coinPayButton span').html(addComma(nobleArr[$actList.index()].openGold));
  //     }else{
  //       // 适用范围：  续费皇帝，开通/续费国王/，开通/续费公爵
  //       if(isOpen){
  //         $payWeChatQuestion.find('.alipayButton span').html(formatPrice(nobleArr[$actList.index()].openGold/10));
  //         $payWeChatQuestion.find('.coinPayButton span').html(addComma(nobleArr[$actList.index()].openGold));
  //       }else{
  //         $payWeChatQuestion.find('.alipayButton span').html(formatPrice(nobleArr[$actList.index()].renewGold/10));
  //         $payWeChatQuestion.find('.coinPayButton span').html(addComma(nobleArr[$actList.index()].renewGold));
  //       }
  //     }
  //     $payWeChatQuestion.show();
  //     return;
  //   }
  // }
  $("#loading").show()
  if (isOpen) {
    payForMoneyWay("/noble/pay/open/bymoney/v2")
  } else {
    console.log("续费进入")
    payForMoneyWay("/noble/pay/renew/bymoney/v2")
  }

  function payForMoneyWay(url) {
    // isPay = true; 
    if(browser.app && info.useNew){
      var obj = {
        method: 1,
        path: url.substr(1),
        params: {
          nobleId: nobleId,
          clientIp: 0,
          payChannel: payType,
          successUrl: successUrl,
          roomUid: info.roomUid,
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
        url: prefix + url,
        type: "get",
        dataType: "json",
        data: {
          uid: info.uid,
          nobleId: nobleId,
          clientIp: 0,
          payChannel: payType,
          successUrl: successUrl,
          roomUid: info.roomUid,
          ticket: info.ticket,
        },
        headers: {
          "pub_ticket": info.ticket
        },
        success: function (res) {
          $("#loading").hide()
          // isPay = false;
          if (res.code == 200) {
            const div = document.createElement("div")
            div.innerHTML = res.data
            document.body.appendChild(div)
            document.forms[0].submit()
          } else if (res.code == 10108) {
            console.log("充值金额过大")
            $(".payFail").html(res.message).fadeIn(30).fadeOut(3000)
          }
        },
      })
    }
  }
}
// 苹果内购专用

function payForIos() {
  // var $actList = $(".payProWrapper .middle ul .active");
  var $actList = $(".payProWrapperList .WrapperList .WrapperBox.active")
  var nobleId = 7 - $actList.index()
  var nobleOptType = $actList.hasClass("openFee") ? 1 : 2
  console.log($actList.index())
  if (nobleId >= 5 && info.loadingStatus == "1") {
    $(".copySucess").html("暂未开放，尽请期待")
    $(".copySucess").show()
    setTimeout(function () {
      $(".copySucess").hide()
    }, 1000)
    return
  }
  $("#loading").show()

  var obj = {
    nobleId: nobleId,
    nobleOptType: nobleOptType,
    iosNobleId: exchangeIosNobleId(nobleId),
  }
  console.log(obj)
  window.webkit.messageHandlers.orderNoble.postMessage(obj)
}
//选择支付方式

$(".WeChat").on("click", function () {
  $('.buttonWrapper .payButton').removeClass('Alipay')
  var checkBox1 = $(".WeChat .checkBox1")
  checkBox1.show().siblings("i").css("display", "none")
  var checkBox2 = $(".Alipay .checkBox2")
  checkBox2.show().siblings("i").css("display", "none")
})
$(".Alipay").on("click", function () {
  $('.buttonWrapper .payButton').addClass('Alipay')
  var checkBox2 = $(".Alipay .checkBox1")
  checkBox2.css("display", "block").siblings("i").hide()
  var checkBox1 = $(" .WeChat .checkBox1")
  checkBox1.hide().siblings("i").css("display", "block")
})

function exchangeIosNobleId(nobleId) {
  var iosNobleId = ""
  switch (nobleId) {
    case 1:
      iosNobleId = "com.leying.nndate.iap.vip.18";
      break;
    case 2:
      iosNobleId = "com.leying.nndate.iap.vip.30";
      break;
    case 3:
      iosNobleId = "com.tongdaxing.erban.noble.iap.3"
      break
    case 4:
      iosNobleId = "com.tongdaxing.erban.noble.iap.4"
      break
  }

  // hello处cp的代码
  if (locateObj.platform == "planet") {
    iosNobleId = "com.wagrant.planet.noble.ipa.1"
  }

  return iosNobleId
}
$(".paySuccess").on("click", function (e) {
  $(this).hide()
})

$(".paySuccess .win").on("click", function (e) {
  if ($(e.target).hasClass("iconClose")) {
    $(this).parent().hide()
  }
  e.stopPropagation()
})

$(".payAlipayQuestion").on("click", function (e) {
  $(this).hide()
})

$(".payAlipayQuestion .win").on("click", function (e) {
  if ($(e.target).hasClass("iconClose")) {
    $(this).parent().hide()
  }

  if ($(e.target).hasClass("coinPayButton")) {
    payForCoin()
    $(this).parent().hide()
  }
  e.stopPropagation()
})

$(".payWeChatQuestion").on("click", function (e) {
  $(this).hide()
})

$(".payWeChatQuestion .win").on("click", function (e) {
  if ($(e.target).hasClass("iconClose")) {
    $(this).parent().hide()
  }
  if ($(e.target).hasClass("coinPayButton")) {
    payForCoin()
    $(this).parent().hide()
  }
  if ($(e.target).hasClass("alipayButton")) {
    payForMoney("alipay_wap")
    $(this).parent().hide()
  }
  e.stopPropagation()
})

$(".payEnsure").on("click", function () {
  $(this).hide()
})

$(".payEnsure .win").on("click", function (e) {
  if ($(e.target).hasClass("iconClose") || $(e.target).hasClass("cancel")) {
    $(this).parent().hide()
  }
  // if($(e.target).hasClass('sure')){
  //   $(this).parent().hide();
  //
  // }
  e.stopPropagation()
})

$(".payEnsure .win .sure").on("click", function () {
  $(".payEnsure").hide()
  // var payWay = $(".payWayBox .active").index()
  // switch (payWay) {
  //   case 0:
  //     payForCoin()
  //     break
  //   case 1:
  //     payForMoney("alipay_wap")
  //     break
  //   case 2:
  //     payForIos()
  //     break
  //   // case 3:
  //   //   payForIos();
  //   //   break;
  // }
  payForCoin()
})

function addComma(num) {
  if (num < 15000) {
    return num
  }
  var res = (num + "")
    .split("")
    .reverse()
    .join("")
    .replace(/(\d{3})\B/g, "$1,")
    .split("")
    .reverse()
    .join("")
  return res
}

function formatPrice(num) {
  if (num < 15000) {
    return num
  }
  var res = num / 10000 + "万"
  return res
}

function getTodayDate() {
  var date = new Date()
  return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
}

function shareInfo() {}

function showTitleRightNoticeFuck() {}

function getMessage(key, value) {
  info[key] = value
}
// function refreshWeb() {
//   if(EnvCheck() == 'test'){
//     window.location.href = 'http://apibeta.kawayisound.xyz/modules/nobles/order.html';
//   }else{
//     window.location.href = 'https://api.kawayisound.xyz/modules/noble/order.html';
//   }
// }
function showCopySuccess() {
  $(".copySucess").show()
  setTimeout(function () {
    $(".copySucess").hide()
  }, 800)
}

function openVip() {
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
    $("#loading").hide()
    var data
    if(res.data){
      data = res.data
    }

    if(res.path == 'noble/right/list'){
      if (info.loadingStatus == "1") {
        switchNobleArr(data)
        nobleArr = data.reverse()
        console.log(nobleArr, "123")
      } else {
        nobleArr = data.reverse()
        console.log(nobleArr, "456")
      }
      if (info.loadingStatus == "0") {
        renderNobleList("coin")
        $(".payWayBox").show()
      } else if (info.loadingStatus == "1") {
        // 审核中版本
        renderNobleList("money")
        $(".payWayBox").hide()
      }
      renderFirstNobleMsg()


    }else if(res.path == 'noble/users/validNobleUserList'){
      nobleUser = data

      if (info.loadingStatus == "0") {
        setTimeout(function(){
          renderNobleList("coin")
        }, 100)
        $(".payWayBox").show()
      } else if (info.loadingStatus == "1") {
        // 审核中版本
        setTimeout(function(){
          renderNobleList("money")
        }, 100)
        $(".payWayBox").hide()
      }
    }else if(res.path == 'purse/query'){
      user.goldNum = data.goldNum
      $(".WeChat .balance span").html(user.goldNum.toFixed(1)+"约豆")

    }else if(res.path == 'noble/pay/open/bygold' || res.path == 'noble/pay/renew/bygold'){
      $("#loading").hide()
      $(".paySuccess").show()
      setTimeout(function () {
        window.location.href = successUrl
      }, 800)
    }else if(res.path == 'noble/pay/open/bymoney/v2' || res.path == 'noble/pay/renew/bymoney/v2'){
      const div = document.createElement("div")
      div.innerHTML = res.data
      document.body.appendChild(div)
      document.forms[0].submit()
    }
  }else if((res.path == 'noble/pay/open/bygold' || res.path == 'noble/pay/renew/bygold') && res.resCode == 1413){
    $("#loading").hide()
  }else if((res.path == 'noble/pay/open/bygold' || res.path == 'noble/pay/renew/bygold') && res.resCode == 1414){
    $("#loading").hide()
    $(".toast").text("请前往我的-设置-支付密码页面设置密码").fadeTo(400, 1)
    setTimeout(function(){
      $(".toast").fadeTo(400, 0)
    }, 1500)
  }else if (res.resCode == 2103) {
    $("#loading").hide();
    $(".toast").text(res.message).fadeTo(400, 1)
    setTimeout(function(){
      $(".toast").fadeTo(400, 0, function(){
        $(".toast").hide();
      })
    }, 1500)
    setTimeout(function () {
      $(".payFail").hide()
      //  这里输入跳去充值页
      if (browser.app) {
        if (browser.android) {
          window.androidJsObj.openChargePage()
        } else if (browser.ios) {
          window.webkit.messageHandlers.openChargePage.postMessage(null)
        }
      }
    }, 1500)
  } else if (res.resCode == 402) {
    console.log("账号被冻结")
    $(".payFail").html(res.message).fadeIn(30).fadeOut(3000)
  }else{
    $("#loading").hide()
    $(".toast").text(res.message).fadeTo(400, 1)
    setTimeout(function(){
      $(".toast").fadeTo(400, 0)
    }, 1500)
    console.log(res)
  }
}