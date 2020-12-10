// 日期
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth() + 1;

// 方法
var browser = checkVersion();
var env = EnvCheck();
var api = locateJudge();
var locateObj = getQueryString();

// 全局变量
var info = {};
var product_money = 0;
var product_num = 1;
var pageNo = 1;
var timeout = null;
var productArr = [{
  name: "双子座(头饰) ×3天",
  money: 2000,
  rock: "8~12个石头",
  imgUrl: "./images/szz.gif"
},{
  name: "双子恶魔(头饰) ×3天",
  money: 4000,
  rock: "18~25个石头",
  imgUrl: "./images/szem.gif"
},{
  name: "戏精(头饰) ×1天",
  money: 200,
  rock: "1~2个石头",
  imgUrl: "./images/xj.gif"
},{
  name: "双子天使(头饰) ×3天",
  money: 4000,
  rock: "18~25个石头",
  imgUrl: "./images/szts.gif"
},{
  name: "精分本人(头饰) ×1天",
  money: 400,
  rock: "2~4个石头",
  imgUrl: "./images/jfbr.gif"
}];
var productPick = {};
var vConsole

if(EnvCheck() == 'test'){
  vConsole = new VConsole;
}

$(function(){
  if(browser.app){
    if(browser.ios){
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null);
      window.webkit.messageHandlers.getDeviceId.postMessage(null);
      window.webkit.messageHandlers.getRoomUid.postMessage(null);
    }else if(browser.android){
      if(androidJsObj && typeof androidJsObj === 'object'){
        info.uid = parseInt(window.androidJsObj.getUid());
        info.ticket = window.androidJsObj.getTicket();
        info.deviceId = window.androidJsObj.getDeviceId();
        info.roomUid = parseInt(window.androidJsObj.getRoomUid());
      }
    }
  }else{
    info.uid = 924229;
    info.ticket = "";
  }

  if(info.uid == 10000057){
    vConsole = new VConsole;
  }


  $(".record-time span").text(year + "年" + month + "月")

  // 购买记录滚动
  $(".record-list")[0].addEventListener("scroll", function(){
    if(Math.round($(this).scrollTop() + $(this).height()) == $(this)[0].scrollHeight - 20){
      console.log("到底")

      debounce(getRecord, 300)()
    }
  })

  // 切换日期
  $(".record-time .prev").click(function(){
    $(".record-list li").remove();
    pageNo = 1;

    if(month -1 == 0){
      year -= 1;
      month = 12;
    }else{
      month -= 1;
    }

    (debounce(getRecord, 1000))()
    $(".record-time span").text(year + "年" + month + "月")
  })

  // 切换日期
  $(".record-time .next").click(function(){
    pageNo = 1;

    if(month + 1 > (date.getMonth() + 1) && year == date.getFullYear()){
      console.log("查看未来")
      return false;
    }else{
      $(".record-list li").remove();
      if(month + 1 > 12){
        year += 1;
        month = 1;
      }else{
        month += 1;
      }
    }

    (debounce(getRecord, 1000))()
    $(".record-time span").text(year + "年" + month + "月")
  })

  // 切换介绍标题
  $(".title h4").click(function(){
    $(".title h4").removeClass("active")
    $(this).addClass("active")

    if($(this).data().num == 1){
      $(".record").hide();
      $(".introduction-text").show();
    }else if($(this).data().num == 2){
      $(".introduction-text").hide();
      $(".record").show();
    }
  })

  // 关闭遮罩层
  $(".mask").click(function(e){
    if(e.target == $(".mask")[0]){
      $(".mask").hide();
      $(".mask2").hide();
      $(".record").hide();

      $(".introduction-text").show();
      $(".title h4").removeClass("active").eq(0).addClass("active")
    }
  })

  // 活动介绍
  $(".introduction-img").click(function(){
    $(".mask").show();
    $(".introduction").show();
    $(".buy").hide();

    getRecord()
  })

  // 购买按钮
  $(".gift-detail .buy-btn").click(function(){
    $(".mask").show();
    $(".mask .buy").show()
    $(".product-num .bg").removeClass("active").eq(0).addClass("active");
    product_money = $(this).data().money;
    info.dressId = $(this).data().id;

    switch ($(this).data().id){
      case 216: { //双子座
        productPick = productArr[0];
        $(".product-name").text(productArr[0].name)
        $(".product-rock").text(productArr[0].rock)
        $(".pay-btn i").text(productArr[0].money)
        $(".product-img").attr("src", productArr[0].imgUrl)
        break;
      }
      case 217:{ //恶魔
        productPick = productArr[1];
        $(".product-name").text(productArr[1].name)
        $(".product-rock").text(productArr[1].rock)
        $(".pay-btn i").text(productArr[1].money)
        $(".product-img").attr("src", productArr[1].imgUrl)
        break;
      }
      case 218:{ //戏精
        productPick = productArr[2];
        $(".product-name").text(productArr[2].name)
        $(".product-rock").text(productArr[2].rock)
        $(".pay-btn i").text(productArr[2].money)
        $(".product-img").attr("src", productArr[2].imgUrl)
        break;
      }
      case 219:{ //天使
        productPick = productArr[3];
        $(".product-name").text(productArr[3].name)
        $(".product-rock").text(productArr[3].rock)
        $(".pay-btn i").text(productArr[3].money)
        $(".product-img").attr("src", productArr[3].imgUrl)
        break;
      }
      case 220:{ //精分
        productPick = productArr[4];
        $(".product-name").text(productArr[4].name)
        $(".product-rock").text(productArr[4].rock)
        $(".pay-btn i").text(productArr[4].money)
        $(".product-img").attr("src", productArr[4].imgUrl)
        break;
      }
    }
  })

  // 购买数量选中
  $(".product-num .bg").click(function(){
    $(".product-num .bg").removeClass("active");
    $(this).addClass("active");
    product_num = parseInt($(this).text())

    $(".pay-btn i").text(parseInt($(this).text()) * productPick.money);
  })

  // 买单
  $(".pay-btn").click(function(){
    // $(".mask2").show();
    pay()
  })

  // 第二遮罩层
  $(".mask2 .m2-cancel").click(function(){
    $(".mask2").hide();
  })

  setTimeout(function(){
    getUser();
  }, 100)

  $(".getYueBean").click(function(){
    // alert("去充值咯")
    if(browser.app){
      if(browser.ios){
        window.webkit.messageHandlers.openChargePage.postMessage(null);
      }else if(browser.android){
        window.androidJsObj.openChargePage();
      }
    }
  })
  $(".goBalloon").click(function(){
    // alert("去打气球咯")
    if(browser.app){
      if(browser.ios){
        window.webkit.messageHandlers.closeWebView.postMessage(null);
      }else if(browser.android){
        console.log(123)
        window.androidJsObj.closeWebView();
        console.log(321)
      }
    }
    console.log(window.androidJsObj)
    console.log(window.androidJsObj.closeDialogWebView)
  })
})

function getUser(){
  // 获取约豆和石头
  $.get(api + "/hitball/userkey", {uid: info.uid}, function(res){
    if(res.code == 200){
      $(".rock").text(res.data)
    }
  })

  $.ajax({
    url: api + "/purse/query",
    headers: {
      ticket: info.ticket,
      pub_uid: info.uid,
      "Content-Type": "text/plain;charset=UTF-8",
    },
    type: "get",
    dataType: "json",
    data: {
      uid: info.uid,
      ticket: info.ticket,
    },
    success(res){
      console.log(res)
      $(".yueBean").text(parseFloat(res.data.goldNum).toFixed(0));
    },
    error(err){
      console.log(err)
    }
  })
}

// 花钱
function pay(){
  var yueBean = parseInt($(".yueBean").text()) || 0;
  var price = product_num * product_money;
  if(yueBean < price){
    $(".mask2").show();
  }else{
    $.ajax({
      url: api + "/constellation/buy",
      headers: {
        "ticket": info.ticket,
        "pub_uid": info.uid,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      type: "POST",
      data: {
        uid: info.uid,
        num: product_num,
        dressId: info.dressId,
        ticket: info.ticket,
        type: 1
      },
      success(res){
        console.log(res)
        if(res.code == 200){
          getUser();
  
          $(".mask").hide();
          $(".mask2").hide();
          $(".record").hide();
          $(".toast").text("购买成功！").fadeTo(400, 1)
          setTimeout(function(){
            $(".toast").fadeTo(400, 0)
          }, 1500)
        }
      },
      error(err){
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
    })
  }
}

function getRecord(){
  var dateStr = year + (month >= 10 ? month : "0" + month).toString();
  $.ajax({
    url: api + "/constellation/buy_record",
    type: "POST",
    headers: {
      "ticket": info.ticket,
      "pub_uid": info.uid,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: {
      uid: info.uid,
      date: dateStr,
      pageNo: pageNo,
      pageSize: 10,
      ticket: info.ticket
    },
    success(res){
      if(res.code == 200 && res.data.length != 0){
        pageNo ++;

        $(".no-list").hide();
        renderRecord(res.data)
      }else{
        if($(".record-list li").length == 0){
          $(".no-list").show();
        }
      }
    },
    error(err){
      console.log(err)
    }
  })
}

function renderRecord(list){
  var str = "";
  for(var i=0; i<list.length; i++){
    str += "<li>" +
              "<div class='time' style='width: 100px;'>" + list[i].date + "</div>" +
              "<div class='product' style='width: 111px;'>" + list[i].typeDes + "</div>" +
              "<div class='num' style='width: 40px;'>" + list[i].num + "</div>" +
            "</li>"
  }  
  $(".record-list").append(str)
}

// 防抖
function debounce(fn, wait){
  return function(){
    if(timeout !== null){
      clearTimeout(timeout)
    }
    timeout = setTimeout(fn, wait)
  }
}

// IOS回调方法
function getMessage(key, value) {
  info[key] = value
}
