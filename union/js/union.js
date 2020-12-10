var info = {};
var browser = checkVersion();
var env = EnvCheck();
var api = locateJudge();
var locateObj = getQueryString();

var pageNo = 1, pageSize = 10, newUnionName = '';
var timeout = null;
var _searchTxt = ""

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

  $(".member-list")[0].addEventListener("scroll", function(){
    if(Math.round($(this).scrollTop()) + $(this).height() == $(this).find("ul").height()){
      console.log("到底了")
      getMemberList()
    }
  })

  $(".searchInput")[0].addEventListener('input', function(){
    pageNo = 1
    _searchTxt = this.value;
    $(".list-loading").show()
    $(".member-list ul li").remove()
    debounce(getMemberList, 1100)()
  })

  setTimeout(function () {
    info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
    getMsg();
    getMemberList();
    unionDetail();

    // 取消退出
    $(".quitMsg .btn").click(function(){
      cancelQuit()
    })

    // 退出公会
    $(".member-join-time>.btn").click(function(){
      quitUnion()
    })
  
    // 公会规则
    $(".union-qus").click(function(){
      $(".mask").show()
      $(".mask .rule").show()
    })
    // 公会规则隐藏
    $(".rule .btn").click(function(){
      $(".mask").hide()
      $(".mask .rule").hide()
    })

    // 查看申请记录
    $(".union-msg").click(function(){
      if(env == "test"){
        if(window.location.href.match(/preview/)){
          window.location.href = "https://preview.api.99date.hudongco.com/modules/union/unionHistory.html";
        }else{
          window.location.href = "https://api.99date.hudongco.com/modules/union/unionHistory.html";
        }
      }else{
        window.location.href = "https://prod.api.99date.hudongco.com/modules/union/unionHistory.html";
      }
    })

    // 查看公会信息
    $(".union-bottom .btn.detail").click(function(){
      $(".mask").show()
      $(".mask .member-join-time").show()

      $(".mask").click(function(e){
        if(e.target == $(".mask")[0]){
          $(".mask").hide()
          $(".mask .member-join-time").hide()
          $(".mask").unbind()
        }
      })
    })

    // 修改公会名字
    $(".pen").click(function(){
      $(".mask2").show()
      $(".mask2 .editUnionName").show()

      $(".mask2").click(function(e){
        if(e.target == $(".mask2")[0]){
          $(".mask2").hide()
          $(".mask2 .editUnionName").hide()
          $(".mask2").unbind()
        }
      })
    })
    $(".editUnionName .btn").click(function(){
      if($($(this).prevAll()[1]).val() == '' || $($(this).prevAll()[1]).val().indexOf(" ") != -1){
        $(".toast").show().fadeTo(400, 1).find("span").text("请输入公会名称，且不能携带空格")
        setTimeout(function(){
          $(".toast").fadeTo(400, 0, function(){
            $(".toast").hide()
          })
        }, 1500)

        return ;
      }
      if($(".remaining").eq(0).text() != 0){
        newUnionName = $($(this).prevAll()[1]).val()
        debounce(setUnionName, 500)()
      }else{
        $(".toast").show().fadeTo(400, 1).find("span").text("次数已用完，请下个月再试")
        setTimeout(function(){
          $(".toast").fadeTo(400, 0, function(){
            $(".toast").hide()
          })
        }, 1500)
      }
    })

    // 勋章晋升
    $(".user-badge").click(function(){
      if(env == "test"){
        if(window.location.href.match(/preview/)){
          window.location.href = "https://preview.api.99date.hudongco.com/modules/union/badge.html";
        }else{
          window.location.href = "https://api.99date.hudongco.com/modules/union/badge.html";
        }
      }else{
        window.location.href = "https://prod.api.99date.hudongco.com/modules/union/badge.html";
      }
    })
  },100)

  // 跳转工会数据
  $(".union-bottom .chairMan .unionData").click(function(){
    if(env == "test"){
      if(window.location.href.match(/preview/)){
        window.location.href = "https://preview.api.99date.hudongco.com/vue-project/unionData/build/index.html";
      }else{
        window.location.href = "https://api.99date.hudongco.com/vue-project/unionData/build/index.html";
      }
    }else{
      window.location.href = "https://prod.api.99date.hudongco.com/vue-project/unionData/build/index.html";
    }
  })

})

// 查询工会首页信息
function getMsg(){
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: "union/homePageInfo",
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }
  }else{
    $.ajax({
      url: api + "/union/homePageInfo",
      type: "GET",
      headers:{
        "pub_ticket": info.ticket
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          if(res.data.role && res.data.role == 1){
            //  1会长 2会员
            $(".union-qus").show()
            $(".user-badge").hide()
            $(".member-join-time .btn").hide()
            $(".union-bottom .chairMan").css("display", "flex")
  
            if(window.localStorage.getItem('hasShowUnionTip')){
              console.log("拿到了")
            }else{
              $(".mask").show()
              $(".mask .rule").show()
              window.localStorage.setItem("hasShowUnionTip", true)
            }
          }else{
            $(".union-qus").hide()
            $(".user-badge").show()
            $(".pen").hide()
            
            $(".union-bottom .member").css("display", "flex")
          }
          if(res.data.type == 2){
            //  1普通  2金牌 3银牌
            $(".gold-union").show()
            $(".member-join-time h4 div img").eq(0).show()
          }else if(res.data.type == 3){
            $(".silver-union").show()
            $(".member-join-time h4 div img").eq(1).show()
          }
  
          $(".unionName").text(res.data.name)
          $(".platformRate").text(res.data.platformRate * 100 + "%")
          $(".unionRate").text(res.data.myUnionRate * 100 + "%")
        }else{
          $(".toast").show().fadeTo(400, 1).find("span").text(res.message)
          setTimeout(function(){
            $(".toast").fadeTo(400, 0, function(){
              $(".toast").hide()
            })
          }, 1500)
        }
      },
      error(err) {
        console.log(err)
      }
    })
  
    $.ajax({
      url: api + "/union/getUnionCanModefyNum",
      type: "GET",
      headers:{
        "pub_ticket": info.ticket
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          $(".editName-chance").text(res.data.monthCanModefyNum)
          $(".remaining").text(res.data.monthRemainModefyNum)
        }
      },
      error(err) {
        console.log(err)
      }
    })
  }
}

// 修改公会名字
function setUnionName(){
  if(browser.app && info.useNew){
    var obj = {
      method: 2,
      path: "union/resetUnionName",
      params: {
        name: newUnionName
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
      url: api + "/union/resetUnionName",
      type: "POST",
      headers:{
        "pub_ticket": info.ticket
      },
      data:{
        name: newUnionName
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          $(".toast").show().fadeTo(400, 1).find("span").text("修改成功！")
          setTimeout(function(){
            window.location.href = "";
          }, 1500)
        }else{
          $(".toast").show().fadeTo(400, 1).find("span").text(res.message)
          setTimeout(function(){
            $(".toast").fadeTo(400, 0, function(){
              $(".toast").hide()
            })
          }, 1500)
        }
      },
      error(err) {
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
            $(".toast").show().fadeTo(400, 1).find("span").text("请前往我的-设置-支付密码页面设置密码")
            setTimeout(function(){
              $(".toast").fadeTo(400, 0, function(){
                $(".toast").hide()
              })
            }, 1500)
          }
        }
      }
    })
  }
}

// 获取公会详情信息
function unionDetail(){
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: "union/getUnionDetail"
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }
  }else{
    $.ajax({
      url: api + '/union/getUnionDetail',
      type: 'GET',
      headers:{
        "pub_ticket": info.ticket
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          $(".totalNum").text(res.data.totalNum + "人")
          $(".unionerNum").text(res.data.unionerNum + "人")
          $(".sevenDayNum").text(res.data.sevenDayNum + "人")
          $(".seventyDayNum").text(res.data.seventyDayNum + "人")
          $(".thirtyTwoDayNum").text(res.data.thirtyTwoDayNum + "人")
          $(".fiftyFiveDayNum").text(res.data.fiftyFiveDayNum + "人")
          $(".eightyThreeDayNum").text(res.data.eightyThreeDayNum + "人")
          $(".eightyThreeMoreDayNum").text(res.data.eightyThreeMoreDayNum + "人")
          $(".quitMsg p i").text(res.data.quitTime)
  
          if(res.data.status == 1){
            $(".mask .member-join-time .quitMsg").css("display", "flex")
            $(".mask .member-join-time>.btn").hide()
          }
        }else{
          $(".toast").show().fadeTo(400, 1).find("span").text(res.message)
          setTimeout(function(){
            $(".toast").fadeTo(400, 0, function(){
              $(".toast").hide()
            })
          }, 1500)
        }
      },
      error(err) {
        console.log(err)
      }
    })
  }
}

// 申请退出公会
function quitUnion(){
  if(browser.app && info.useNew){
    var obj = {
      method: 2,
      path: "union/applyQuitUnion"
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }
  }else{
    $.ajax({
      url: api + '/union/applyQuitUnion',
      type: 'POST',
      headers:{
        "pub_ticket": info.ticket
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          $(".mask .member-join-time .quitMsg").css("display", "flex")
          $(".mask .member-join-time>.btn").hide()
  
          $(".quitMsg p i").text(res.data)
  
          $(".toast").show().fadeTo(400, 1).find("span").text("申请成功")
          setTimeout(function(){
            $(".toast").fadeTo(400, 0, function(){
              $(".toast").hide()
            })
          }, 1500)
        }else{
          $(".toast").show().fadeTo(400, 1).find("span").text(res.message)
          setTimeout(function(){
            $(".toast").fadeTo(400, 0, function(){
              $(".toast").hide()
            })
          }, 1500)
        }
      },
      error(err) {
        console.log(err)
      }
    })
  }
}

// 取消退出公会
function cancelQuit(){
  if(browser.app && info.useNew){
    var obj = {
      method: 2,
      path: "union/cancelApplyQuitUnion"
    }

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
    }else if(browser.ios){
      var data = JSON.stringify(obj)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
    }
  }else{
    $.ajax({
      url: api + "/union/cancelApplyQuitUnion",
      type: "POST",
      headers:{
        "pub_ticket": info.ticket
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          $(".mask .member-join-time .quitMsg").hide()
          $(".mask .member-join-time>.btn").show()
  
          $(".toast").show().fadeTo(400, 1).find("span").text("取消成功")
          setTimeout(function(){
            $(".toast").fadeTo(400, 0, function(){
              $(".toast").hide()
            })
          }, 1500)
        }else{
          $(".toast").show().fadeTo(400, 1).find("span").text(res.message)
          setTimeout(function(){
            $(".toast").fadeTo(400, 0, function(){
              $(".toast").hide()
            })
          }, 1500)
        }
      },
      error(err) {
        console.log(err)
      }
    })
  }
}

// 获取公会用户
function getMemberList(){
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: "union/searchUnionMember",
      params: {
        key: _searchTxt,
        pageNo: pageNo,
        pageSize: pageSize
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
      url: api + "/union/searchUnionMember",
      type: "GET",
      headers:{
        "pub_ticket": info.ticket
      },
      data:{
        key: _searchTxt,
        pageNo: pageNo,
        pageSize: pageSize
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          pageNo += 1
          if(res.data.length == 0){
            pageNo -= 1
          }
  
          $(".list-loading").hide()
          renderMemberList(res.data)
        }else{
          $(".toast").show().fadeTo(400, 1).find("span").text(res.message)
          setTimeout(function(){
            $(".toast").fadeTo(400, 0, function(){
              $(".toast").hide()
            })
          }, 1500)
        }
      },
      error(err) {
        console.log(err)
      }
    })
  }
}

// 渲染公会用户列表
function renderMemberList(data){
  var str = '';
  for(var i=0; i<data.length; i++){
    if(data[i].role == 1){
      str += '<li class="d-flex">' +
                '<div class="left d-flex" data-id="'+ data[i].uid +'">' +
                  '<img src="'+ data[i].avatar +'" alt="" />' +
                  '<div class="user-msg">' +
                    '<p class="name d-flex">' +
                      '<span>'+ truncated(data[i].nick, 5) +'</span>' +
                      '<img style="'+ ((data[i].nobleUsers)? "display: block;" : "display: none;") +'" src="'+ ((data[i].nobleUsers) && (api + nobleArr[data[i].nobleUsers.nobleId - 1]) || undefined) +'" alt="" />' +
                      '<img src="'+ data[i].userLevelVo.experUrl +'" alt="" />' +
                    '</p>' +
                    '<p class="user-id d-flex">' +
                      '<img style="display:'+ (data[i].newUser?'inline-block;':'none;') +'" src="https://api.99date.hudongco.com/modules/erbanRank/images/xinren.png" alt="" />' +
                      '<img style="display:'+ (data[i].hasPrettyErbanNo?'inline-block;':'none;') +'" src="https://api.99date.hudongco.com/modules/erbanRank/images/lianghao.png" alt="" />' +
                      '<span>ID: '+ data[i].erbanNo +'</span>' +
                    '</p>' +
                  '</div>' +
                '</div>' +
                '<div class="right job">' +
                  '<h4 class="job-name">会长</h4>' +
                '</div>' +
              '</li>'
    }else if(data[i].role == 2){
      str += '<li class="d-flex">' +
                '<div class="left d-flex" data-id="'+ data[i].uid +'">' +
                  '<img src="'+ data[i].avatar +'" alt="" />' +
                  '<div class="user-msg">' +
                    '<p class="name d-flex">' +
                      '<span>'+ truncated(data[i].nick, 5) +'</span>' +
                      '<img style="'+ ((data[i].nobleUsers)? "display: block;" : "display: none;") +'" src="'+ ((data[i].nobleUsers) && (api + nobleArr[data[i].nobleUsers.nobleId - 1]) || undefined) +'" alt="" />' +
                      '<img src="'+ data[i].userLevelVo.experUrl +'" alt="" />' +
                    '</p>' +
                    '<p class="user-id d-flex">' +
                      '<img style="display:'+ (data[i].newUser?'inline-block;':'none;') +'" src="https://api.99date.hudongco.com/modules/erbanRank/images/xinren.png" alt="" />' +
                      '<img style="display:'+ (data[i].hasPrettyErbanNo?'inline-block;':'none;') +'" src="https://api.99date.hudongco.com/modules/erbanRank/images/lianghao.png" alt="" />' +
                      '<span>ID:'+ data[i].erbanNo +'</span>' +
                    '</p>' +
                  '</div>' +
                '</div>' +
                '<div class="right job">' +
                  '<h4 class="join-time d-flex">' +
                    '<img style="display:'+ (data[i].tag == 2?"block":"none") +';" src="./images/gold-star.png" alt="" />' +
                    '<img style="display:'+ (data[i].tag == 1?"block":"none") +'" src="./images/silver-star.png" alt="" />' +
                    '<span>已经加入'+ data[i].days +'天</span>' +
                  '</h4>' +
                  '<p class="addPercent">公会加成&nbsp;&nbsp;<i>'+ data[i].unionRate * 100 +'%</i></p>' +
                '</div>' +
              '</li>'
    }
  }

  $(".member-list ul").append(str)

  // 用户信息跳转
  $(".member-list li .left").click(function(e){
    // console.log($(this).data().id)
    var uid = $(this).data().id.toString();
    if (browser.app && browser.ios) {
      window.webkit.messageHandlers.openPersonPage.postMessage(uid)
    } else if (browser.app && browser.android) {
      if (androidJsObj && typeof androidJsObj === "object") {
        window.androidJsObj.openPersonPage(uid)
      }
    }else{
      console.log(123)
    }
  })
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
  console.log(res)
  if(res.resCode == 0){
    var data
    if(res.data){
      data = res.data
    }
    
    if(res.path == 'union/homePageInfo'){
      $(".unionName").text(data.name)
      $(".platformRate").text(parseFloat(data.platformRate) * 100 + "%")
      $(".unionRate").text(parseFloat(data.myUnionRate) * 100 + "%")

      if(data.role && data.role == 1){
        //  1会长 2会员
        $(".union-qus").show()
        $(".user-badge").hide()
        $(".member-join-time .btn").hide()
        $(".union-bottom .chairMan").css("display", "flex")

        if(window.localStorage.getItem('hasShowUnionTip')){
          console.log("拿到了")
        }else{
          $(".mask").show()
          $(".mask .rule").show()
          window.localStorage.setItem("hasShowUnionTip", true)
        }

        var obj = {
          method: 1,
          path: "union/getUnionCanModefyNum",
        }

        if(browser.android){
          window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
        }else if(browser.ios){
          var data = JSON.stringify(obj)
          window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
        }
      }else{
        $(".union-qus").hide()
        $(".user-badge").show()
        $(".pen").hide()
        $(".union-bottom .member").css("display", "flex")
      }
      if(data.type == 2){
        //  1普通  2金牌
        $(".gold-union").show()
        $(".member-join-time h4 div img").eq(0).show()
      }else if(res.data.type == 3){
        $(".silver-union").show()
        $(".member-join-time h4 div img").eq(1).show()
      }

    }else if(res.path == 'union/getUnionCanModefyNum'){
      $(".editName-chance").text(data.monthCanModefyNum)
      $(".remaining").text(data.monthRemainModefyNum)

    }else if(res.path == 'union/resetUnionName'){
      $(".toast").show().fadeTo(400, 1).find("span").text("修改成功！")
      setTimeout(function(){
        window.location.href = "";
      }, 1500)

    }else if(res.path == 'union/getUnionDetail'){
      $(".totalNum").text(data.totalNum + "人")
      $(".unionerNum").text(data.unionerNum + "人")
      $(".sevenDayNum").text(data.sevenDayNum + "人")
      $(".seventyDayNum").text(data.seventyDayNum + "人")
      $(".thirtyTwoDayNum").text(data.thirtyTwoDayNum + "人")
      $(".fiftyFiveDayNum").text(data.fiftyFiveDayNum + "人")
      $(".eightyThreeDayNum").text(data.eightyThreeDayNum + "人")
      $(".eightyThreeMoreDayNum").text(data.eightyThreeMoreDayNum + "人")
      $(".quitMsg p i").text(data.quitTime)

      if(data.status == 1){
        $(".mask .member-join-time .quitMsg").css("display", "flex")
        $(".mask .member-join-time>.btn").hide()
      }

    }else if(res.path == 'union/applyQuitUnion'){
      $(".mask .member-join-time .quitMsg").css("display", "flex")
      $(".mask .member-join-time>.btn").hide()

      $(".quitMsg p i").text(data)

      $(".toast").show().fadeTo(400, 1).find("span").text("申请成功")
      setTimeout(function(){
        $(".toast").fadeTo(400, 0, function(){
          $(".toast").hide()
        })
      }, 1500)

    }else if(res.path == 'union/cancelApplyQuitUnion'){
      $(".mask .member-join-time .quitMsg").hide()
      $(".mask .member-join-time>.btn").show()

      $(".toast").show().fadeTo(400, 1).find("span").text("取消成功")
      setTimeout(function(){
        $(".toast").fadeTo(400, 0, function(){
          $(".toast").hide()
        })
      }, 1500)

    }else if(res.path == 'union/searchUnionMember'){
      pageNo += 1
      if(data.length == 0){
        pageNo -= 1
      }

      $(".list-loading").hide()
      renderMemberList(data)
    }
  }else if(res.path == 'union/getUnionCanModefyNum' && res.resCode == 7068){
    return ;

  }else if(res.resCode == 9000){
    console.log("格式转换错误");

  }else if(res.resCode == 9001){
    console.log("请求路径不能为空");

  }else if(res.resCode == 9002){
    console.log("请求方法不正确");

  }else{
    if(res.resCode == 1413){
      $(".toast").show().fadeTo(400, 1).find("span").text("请输入支付密码")
      setTimeout(function(){
        $(".toast").fadeTo(400, 0, function(){
          $(".toast").hide()
        })
      }, 1500)
    }else{
      if(res.message){
        if(browser.ios && res.resCode == 404){
          return ;
        }else{
          $(".toast").show().fadeTo(400, 1).find("span").text(res.message)
          setTimeout(function(){
            $(".toast").fadeTo(400, 0, function(){
              $(".toast").hide()
            })
          }, 1500)
        }
      }else{
        $(".toast").show().fadeTo(400, 1).find("span").text("无相关内容")
        setTimeout(function(){
          $(".toast").fadeTo(400, 0, function(){
            $(".toast").hide()
          })
        }, 1500)
      }
    }
    
    console.log(res)
  }
}
