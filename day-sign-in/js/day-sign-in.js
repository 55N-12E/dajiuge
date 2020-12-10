var info = {};
if(EnvCheck() == 'test'){
  var vConsole = new VConsole;
}
var browser = checkVersion();
var env = EnvCheck();
var api = locateJudge();
var locateObj = getQueryString();
var u = navigator.userAgent;
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

$(function() {
  // 获取用户 uid
  if(browser.app){
    if(browser.ios){
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null);
      window.webkit.messageHandlers.getDeviceId.postMessage(null);
      window.webkit.messageHandlers.getAppVersion.postMessage(null);
    }else if(browser.android){
      if(androidJsObj && typeof androidJsObj === 'object'){
        info.uid = parseInt(window.androidJsObj.getUid());
        info.ticket = window.androidJsObj.getTicket();
        info.deviceId = window.androidJsObj.getDeviceId();
        info.appVersion = window.androidJsObj.getAppVersion();
      }
    }
  }else{
    info.appVersion = "1.5.5"
  }

  setTimeout(function () {
    info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
    getSignDetail();
    getMsg();
  },100)

  // 点击签到
  $(".sign-in .btn-signin").on('click', function(){
    $("#loading").show();

    if(browser.app && info.useNew){
      var obj = {
        method: 2,
        path: 'sign/sign'
      }
      
      if(browser.android){
        window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
      }else if(browser.ios){
        var data = JSON.stringify(obj)
        window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
      }
    }else{
      $.ajax({
        url: api + '/sign/sign',
        type: 'POST',
        data: {
          ticket: info.ticket,
          deviceId: info.deviceId
        },
        headers: {
          "pub_ticket": info.ticket
        },
        success(res){
          if(res.code == 200){
            $("#loading").hide();
            $(".sign-in .btn-signin").hide();
            $(".sign-in .btn-done").show();
            $(".mask").hide();
            $(".signin-break").hide();
    
            getSignDetail()
            getMsg()
          }else if(res.code == 20034) {
            $("#loading").hide();
            $(".mask").show();
            $(".signin-break").show();
    
            // 重新签到
            setTimeout(function(){
              $(".re-signin").on('click', function(){
                if(browser.app && info.useNew){
                  var obj = {
                    method: 2,
                    path: 'sign/sign'
                  }
                  
                  if(browser.android){
                    window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
                  }else if(browser.ios){
                    var data = JSON.stringify(obj)
                    window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
                  }
                }else{
                  $.ajax({
                    url: api + '/sign/sign',
                    type: 'POST',
                    data: {
                      ticket: info.ticket,
                      deviceId: info.deviceId
                    },
                    headers: {
                      "pub_ticket": info.ticket
                    },
                    success(res){
                      if(res.code == 200){
                        $("#loading").hide();
                        $(".sign-in .btn-signin").hide();
                        $(".sign-in .btn-done").show();
                
                        $(".mask").hide();
                        $(".signin-break").hide();
                
                        getSignDetail()
                        getMsg()
                      } else {
                        $(".toast").text(res.message).fadeTo(400, 1)
                        setTimeout(function(){
                          $(".toast").fadeTo(400, 0)
                        }, 1500)
                        return false;
                      }
                    }
                  })
                }
              })
            }, 200)
          }else {
            $(".toast").text(res.message).fadeTo(400, 1)
            setTimeout(function(){
              $(".toast").fadeTo(400, 0)
            }, 1500)
            return false;
          }
        }
      })
    }
    
  })

  // 关闭遮罩层
  $(".gift-close").on('click', function(){
    $(".mask").hide();
    $(".mask .signIn-gift").hide();
  })

  $(".mission-tips div.btn").click(function(){
    $(".mask").hide();
    $(".mask .mission-tips").hide();
  })
})

  // 签到详情
  function getSignDetail(){
    if(browser.app && info.useNew){
      var obj = {
        method: 2,
        path: 'sign/signDetail'
      }
      
      if(browser.android){
        window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
      }else if(browser.ios){
        var data = JSON.stringify(obj)
        window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
      }
    }else{
      $.ajax({
        url: api + '/sign/signDetail',
        type: 'POST',
        headers: {
          "pub_ticket": info.ticket
        },
        success(res){
          if(res.code == 200 && res.data.isSign == 1){
            $(".sign-in .btn-signin").hide();
            $(".sign-in .btn-done").show();
          }else{
            showToast(res.message)
          }
        }
      })
    }
  }

// 任务信息
function getMsg() {
  // 每日签到奖励获取
  if(browser.app && info.useNew){
    var obj1 = {
      method: 2, //1 get  2 post  3 put
      path: 'sign/rewardAllNotice'
    }
    var obj2 = {
      method: 2,
      path: 'mission/list',
    }
    var obj3 = {
      method: 2,
      path: 'mission/achievement/list',
      params: obj2.params
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
    $.ajax({
      url: api + '/sign/rewardAllNotice',
      type: 'POST',
      headers: {
        "pub_ticket": info.ticket
      },
      success(res){
        if(res.code == 200){
          daySignin(res.data)
        }
      }
    })

    // 每日任务内容
    var obj = {
      appVersion: info.appVersion,
      os: isiOS == true?"ios":"android",
      channel: isiOS == true?"ios":"android",
      app: 'nndate'//browser.app
    }
    $.ajax({
      url: api + '/mission/list',
      type: 'POST',
      data: obj,
      headers: {
        "pub_ticket": info.ticket
      },
      success(res){
        if(res.code == 200){
          dayMission(res.data)
        }
      }
    })

    // 成就任务
    $.ajax({
      url: api + '/mission/achievement/list',
      type: 'POST',
      data: obj,
      headers: {
        "pub_ticket": info.ticket
      },
      success(res){
        if(res.code == 200){
          // status = 2:已经领取 status = 1:可以领取 status = 0:没完成
          conMission(res.data)
        }
      }
    })
  }
}

// 渲染成就任务
function conMission (data){
  $(".day-sign-in .mission ul.condition li").remove();
  var str = ""
  for(var i=0; i<data.length; i++) {
    str += "<li class=\"d-flex\">\n        <div class=\"mission-text\">\n          <div class=\"d-flex\">\n            <h4>".concat(data[i].name, "</h4>\n            <div class=\"d-flex\" style=\"align-items:center;\">\n              <img src=\"./images/silver.png\" alt=\"\">\n              <span>+").concat(data[i].prizeNum, "</span>\n            </div>\n          </div>\n          <p>").concat(data[i].description, "</p>\n        </div>\n        <div class=\"btn ").concat(data[i].status == 0 ? "btn-get" : data[i].status == 1 ? "btn-finish" : "btn-done", "\" data-index=\"").concat(data[i].configId, "\">").concat(data[i].status == 0 ? "去完成" : data[i].status == 1 ? "领取" : "已完成", "</div>\n      </li>");
  }
  $(".day-sign-in .mission ul.condition").append(str)

  setTimeout(function(){
    // 领取成就奖励
    $(".mission li .btn-finish").on('click', function(){
      $("#loading").show();
      if(browser.app && info.useNew){
        var obj = {
          method: 2,
          path: 'mission/receive',
          params: {
            configId: $(this).attr("data-index")  
          }
        }
        if(browser.android){
          window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
        }else if(browser.ios){
          var data = JSON.stringify(obj)
          window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
        }
      }else{
        var obj = {
          configId: $(this).attr("data-index"),
          deviceId: info.deviceId,
          appVersion: info.appVersion,
          os: isiOS == true?"ios":"android",
        }

        $.ajax({
          url: api + '/mission/receive',
          type: 'POST',
          data: obj,
          headers: {
            "pub_ticket": info.ticket
          },
          success(res){
            if(res.code == 200){
              $("#loading").hide();
              getMsg()
            }else{
              showToast(res.message)
            }
          }
        })
      }
    })

    // 成就任务调用app
    $(".mission li .btn-get").on('click', function(){
      var cfgId = $(this).attr("data-index");
      switch (cfgId){
        case "21":{ //发布动态
          if(browser.app){
            if(browser.android){
              window.androidJsObj.publishDynamic();
            }else if(browser.ios){
              window.webkit.messageHandlers.publishDynamic.postMessage(null)
            }
          }
          break;
        }
        case "14":{ //绑定手机
          if(browser.app){
            if(browser.android){
              window.androidJsObj.bindPhone();
            }else if(browser.ios){
              window.webkit.messageHandlers.bindPhone.postMessage(null)
            }
          }
          break;
        }
        case "11":{ //上传头像
          if(browser.app){
            if(browser.android){
              window.androidJsObj.modifyUserInfo();
            }else if(browser.ios){
              window.webkit.messageHandlers.modifyUserInfo.postMessage(null)
            }
          }
          break;
        }
        case "12":{ //录制你的声音
          if(browser.app){
            if(browser.android){
              window.androidJsObj.recordVoice();
            }else if(browser.ios){
              window.webkit.messageHandlers.recordVoice.postMessage(null)
            }
          }
          break;
        }
        case "13":{ //上传相册照片
          if(browser.app){
            if(browser.android){
              window.androidJsObj.modifyPhotos();
            }else if(browser.ios){
              window.webkit.messageHandlers.modifyPhotos.postMessage(null)
            }
          }
          break;
        }
      }
    })
  }, 200)
}

// 渲染每日任务
function dayMission (data){
  $(".day-sign-in .mission ul.day li").remove();
  var str = ""
  // 0 去完成, 1 领取
  for(var i=0; i<data.length; i++) {
    str += "<li class=\"d-flex\">\n        <div class=\"mission-text\">\n          <div class=\"d-flex\">\n            <h4>".concat(data[i].name, "</h4>\n            <div class=\"d-flex\" style=\"align-items:center;\">\n              <img src=\"./images/silver.png\" alt=\"\">\n              <span>+").concat(data[i].prizeNum, "</span>\n            </div>\n          </div>\n          <p>").concat(data[i].description, "</p>\n        </div>\n        <div class=\"btn ").concat(data[i].status == 0 ? "btn-get" : data[i].status == 1 ? "btn-finish" : "btn-done", "\" data-index=\"").concat(data[i].configId, "\" data-imgUrl=\"").concat(data[i].stepPic, "\">").concat(data[i].status == 0 ? "去完成" : data[i].status == 1 ? "领取" : "已完成", "</div>\n      </li>");
  }
  $(".day-sign-in .mission ul.day").append(str);

  setTimeout(function(){
    $(".day li div.btn-get").on('click', function(){
      var imgUrl = this.dataset.imgurl

      $(".mask").show()
      $(".mask .mission-tips").show()
      $(".mission-step").attr("src", imgUrl);
    })
  }, 200)
}

// 渲染签到奖励
function daySignin (data){
  $(".week ul li").remove();
  $(".gift-list li").remove();

  $(".sign-in>p>span").text(data.totalDay);
  $(".gift-detail>h3>span:first-child").text(data.totalDay);

  var reward = data.signSevenRewardList; //签到奖励
  var giftReward = data.signBagRewardList; //连续签到奖励

  // 签到奖励
  var str = "";
  for(var i=0; i<reward.length; i++) {
    if(i == 2) {
      str += "<li class='normal' data-rewardNo='"+ reward[i].signRewardNo +"'>" +
              "<div class='signin-box'>" +
                "<p style='font-size: 0.3rem;'>第" + reward[i].signDays + "天</p>" +
                "<img src='./images/headpic.png' />" +
                "<div>" +
                  "<img src='./images/sing-in-bg.png' />" +
                  "<p>" + reward[i].rewardNum + "天</p>" +
                "</div>" +
                "</div>" +
                "<div class='signin-mask'>" +
                "<img src='./images/finish.png' />" +
                "</div>" +
                "<div class='break'>" +
                  "<div><span>已断签</span></div>" +
                "</div>" +
              "</li>"
    }else if(i == 5){
      str += "<li class=\"normal\" style=\"width:calc(50% - 0.4rem);\" data-rewardNo=\"".concat(reward[i].signRewardNo, "\">\n          <div class=\"signin-box d-flex\">\n            <p style=\"font-size:0.3rem;width: 100%;\">\u7B2C").concat(reward[i].signDays, "\u5929</p>\n            <div class=\"reward-box\">\n              <img src=\"./images/silver.png\" alt=\"\">\n              <div>\n                <img src=\"./images/sing-in-bg.png\" alt=\"\">\n                <p>\xD7").concat(reward[i].rewardNum, "</p>\n              </div>\n            </div>\n            <div class=\"reward-box\">\n              <img src=\"./images/vip.png\" alt=\"\">\n              <div>\n                <img src=\"./images/sing-in-bg.png\" alt=\"\">\n                <p>\xD7").concat(reward[i].rewardDays, "</p>\n              </div>\n            </div>\n          </div>\n          <div class=\"signin-mask\">\n            <img src=\"./images/finish.png\" alt=\"\">\n          </div>\n          <div class=\"break\">\n            <div>\n              <span>\u5DF2\u65AD\u7B7E</span>\n            </div>\n          </div>\n        </li>");
    }else{
      str += "<li class=\"normal\" data-rewardNo=\"".concat(reward[i].signRewardNo, "\">\n          <div class=\"signin-box\">\n            <p style=\"font-size:0.3rem;\">\u7B2C").concat(reward[i].signDays, "\u5929</p>\n            <img src=\"./images/silver.png\" alt=\"\">\n            <div>\n              <img src=\"./images/sing-in-bg.png\" alt=\"\">\n              <p>\xD7").concat(reward[i].rewardNum, "</p>\n            </div>\n          </div>\n          <div class=\"signin-mask\">\n            <img src=\"./images/finish.png\" alt=\"\">\n          </div>\n          <div class=\"break\">\n            <div>\n              <span>\u5DF2\u65AD\u7B7E</span>\n            </div>\n          </div>\n        </li>");
    }
  }
  $(".week ul").append(str)

  for(var j=0; j<reward.length; j++){
    if(reward[j].isReceive == 1){
      $(".week li .signin-mask").eq(j).show();
    }
  }

  // 领取累计礼包操作
  $(".btn-get").on('click', function(){
    var that = $(this);
    var giftNo = that.attr("data-giftNo");

    if(browser.app && info.useNew){
      var obj = {
        method: 2,
        path: 'sign/receiveBagReward',
        params: {
          signRewardNo: giftNo
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
        url: api + '/sign/receiveBagReward',
        type: 'POST',
        data: {
          signRewardNo: giftNo
        },
        headers: {
          "pub_ticket": info.ticket
        },
        success(res){
          if(res.code == 200){
            that.removeClass("btn-get").addClass("btn-done").text("已领取")
          }
        }
      })
    }
  })

  // 打开连续签到礼包
  $(".week li.condition").on('click', function(){
    $(".mask").show();
    $(".mask .signIn-gift").show();
  })
}

// IOS回调方法
function getMessage(key, value) {
  info[key] = value
}



// app -> js
function frontHttpResponse(res){
  console.log(res)
  if(res.resCode == 0){

    if(res.path == 'sign/signDetail'){
      if(res.data.isSign == 1){
        $(".sign-in .btn-signin").hide();
        $(".sign-in .btn-done").show();
      }
    }else if(res.path == 'sign/rewardAllNotice'){
      daySignin(res.data)
    }else if(res.path == 'mission/list'){
      dayMission(res.data)
    }else if(res.path == 'mission/achievement/list'){
      conMission(res.data)
    }else if(res.path == 'sign/sign'){
      $("#loading").hide();
      $(".sign-in .btn-signin").hide();
      $(".sign-in .btn-done").show();
      $(".mask").hide();
      $(".signin-break").hide();

      showToast("签到成功！")
      getSignDetail()
      getMsg()
    }else if(res.path == 'mission/receive'){
      $("#loading").hide();
      showToast("领取成功！")
      getMsg()
    }

    // 累计礼包
    // else if(res.path == '/sign/receiveBagReward'){
    //   console.log(7);
    // }
  }else if(res.path == 'sign/sign' && res.resCode == 20034){
    $("#loading").hide();
    $(".mask").show();
    $(".signin-break").show();

    // 重新签到
    setTimeout(function(){
      $(".re-signin").on('click', function(){
        var obj = {
          method: 2,
          path: 'sign/sign'
        }
        
        if(browser.android){
          window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
        }else if(browser.ios){
          var data = JSON.stringify(obj)
          window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
        }
      })
    }, 200)
  }else{
    showToast("网络错误，请稍后再试")
  }
}