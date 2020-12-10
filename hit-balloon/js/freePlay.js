var info = {};

// 日期
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth() + 1;

// 方法
var browser = checkVersion();
var env = EnvCheck();
var api = locateJudge();
var locateObj = getQueryString();

var residue = 0;

if(EnvCheck() == 'test'){
  var vConsole = new VConsole;
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
    info.deviceId = "MIPC880128"
  }

  setTimeout(function(){
    isReceive();
  }, 100)

  $(".explain").click(function(){
    $("#mask").show();
  })

  $("#mask").click(function(e){
    if(e.target == $("#mask")[0]){
      $("#mask").hide();
    }
  })

  // 任务一领取
  $(".m1btn").click(function(){
    if($(".m1btn").hasClass("btn-finish") || $(".m1btn").hasClass("btn-not")){
      return false;
    }else{

      $.post(api + "/hitball/searchHitball", {
        uid: info.uid
      }, function(res1){
        console.log(res1, 62)
        if(res1.code == 200){

          if(parseInt(res1.data.residue) <= 1){
            $(".m1btn").removeClass("btn-finish btn-done btn-not").addClass("btn-not");
            $(".m1btn").addClass("btn-not").text("已领完");
            return false;
          }else{
            $.post(api + "/hitball/getHitballStone", {
              uid: info.uid
            }, function(res2){
              console.log(res2, 73)
              if(res2.code == 200){
                $(".m1btn").removeClass("btn-done").addClass("btn-finish").text("已领取");
                
                $(".toast").fadeIn();
                setTimeout(function(){
                  $(".toast").fadeOut();
                }, 1500)
              }
            })
          }

        }
      })
    }
  })

  var divHeight = parseFloat($(".mission-list").css("height").split("px")[0]) + parseFloat($(".mission-list").css("top").split("px")[0]);
  $("#main>div").eq(0).css("height", divHeight)
})

// 查询是否完成任务一
function isReceive(){
  $.post(api + "/hitball/searchHitball", {
    uid: info.uid
  }, function(res){
    console.log(res)
    if(res.code == 200){
      $(".m1btn").removeClass("btn-finish btn-done btn-not");
      residue = res.data.residue;

      // 积分赋值
      if(typeof res.data == "object"){
        $(".point").text(res.data.score);
      }else{
        $(".point").text("0");
      }

      // 积分可领取奖励
      if(res.data.score >= 100){
        $(".m2-span").show();
        $(".btn").eq(1).hide();
      }
      if(res.data.score >= 500){
        $(".m3-span").show();
        $(".btn").eq(2).hide();
      }
      if(res.data.score >= 1000){
        $(".m4-span").show();
        $(".btn").eq(3).hide();
      }
      if(res.data.score >= 3333){
        $(".m5-span").show();
        $(".btn").eq(4).hide();
      }
      if(res.data.score >= 6000){
        $(".m6-span").show();
        $(".btn").eq(5).hide();
      }
      if(res.data.score >= 8000){
        $(".m7-span").show();
        $(".btn").eq(6).hide();
      }
      if(res.data.score >= 10000){
        $(".m8-span").show();
        $(".btn").eq(7).hide();
      }

      // 任务一
      if(parseInt(res.data.residue) <= 1){
        $(".m1btn").removeClass("btn-finish btn-done btn-not").addClass("btn-not");
        $(".m1btn").addClass("btn-not").text("已领完");
        throw new Error("领完了");
      }

      if(typeof res.data != "object"){
        switch(res.data){
          case "未完成":
            $(".m1btn").addClass("btn-not").text(res.data);
            break;
          case "已完成":
            $(".m1btn").addClass("btn-finish").text(res.data);
            break;
          case "未领取":
            $(".m1btn").addClass("btn-done").text("领取奖励");
            break;
        }
      }else{
        if(res.data.status == undefined){
          switch(res.data.isReceive){
            case "未完成":
              $(".m1btn").addClass("btn-not").text(res.data);
              break;
            case "已完成":
              $(".m1btn").addClass("btn-finish").text(res.data);
              break;
            case "未领取":
              $(".m1btn").addClass("btn-done").text("领取奖励");
              break;
            case "已领完":
              $(".m1btn").addClass("btn-not").text("已领完");
              break;
          }

          if(res.data.residue <= 1){
            $(".m1btn").removeClass("btn-done").addClass("btn-finish").text("已领完");
          }
        }else if(res.data.status == "已完成"){
          $(".m1btn").removeClass("btn-done").addClass("btn-finish").text("已领取");
        }
      }
    }
  })
}

// IOS回调方法
function getMessage(key, value) {
  info[key] = value
}
