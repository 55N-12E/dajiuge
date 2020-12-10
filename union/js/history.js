var info = {};
var browser = checkVersion();
var env = EnvCheck();
var api = locateJudge();
var locateObj = getQueryString();

var pageNo = 1, pageSize = 10;
var _docHeight = 0;
var ele

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
    getApplication()
    _docHeight = $(document).height();


    $(document)[0].addEventListener("scroll", function(){
      if((Math.round($(this).scrollTop() + _docHeight) == document.body.clientHeight) && $(".union-history").height() != 0){
        getApplication()
        console.log("到底了")
      }
    })
  }, 100);

  $(".union-history ul").click(function(e){
    ele = $(e.target)
    if(ele.hasClass("agreeJoin")){
      console.log("入会")
      agree(ele.data().id, ele)
    }else if(ele.hasClass("agreeQuit")){
      console.log("退出");
      quit(ele.data().id, ele)
    }else{
      return ;
    }
  })
})

// 获取所有申请
function getApplication(){
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: "union/unionMemberLogList",
      params: {
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
  }else{
    $.ajax({
      url: api + '/union/unionMemberLogList',
      type: 'GET',
      headers: {
        "pub_ticket": info.ticket
      },
      data: {
        page: pageNo,
        pageSize: pageSize
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          pageNo += 1
          if(res.data.length == 0){
            pageNo -= 1
          }
          renderList(res.data)
        }else{
          $(".toast").show().find("span").text(res.message).fadeTo(400, 1)
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

// 同意入会
function agree(uid, ele){
  if(browser.app && info.useNew){
    var obj = {
      method: 2,
      path: "union/applicationPassed",
      params: {
        uid: uid
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
      url: api + '/union/applicationPassed',
      type: 'POST',
      headers: {
        "pub_ticket": info.ticket
      },
      data: {
        uid: uid
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          $(".toast").show().fadeTo(400, 1).find("span").text(ele.data().name + "加入公会")
          ele.text("已同意").removeClass("agreeJoin")
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

// 同意退出
function quit(uid, ele){
  if(browser.app && info.useNew){
    var obj = {
      method: 2,
      path: "union/passApplyQuitUnion",
      params: {
        uid: uid
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
      url: api + '/union/passApplyQuitUnion',
      type: 'POST',
      headers: {
        "pub_ticket": info.ticket
      },
      data: {
        uid: uid
      },
      success(res) {
        console.log(res)
        if(res.code == 200){
          $(".toast").show().fadeTo(400, 1).find("span").text(ele.data().name + "退出公会")
          ele.text("已同意").removeClass("agreeQuit")
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

// 渲染列表
function renderList(data){
  var str = ''
  for(var i=0; i<data.length; i++){
    var year = new Date(data[i].createTime).getFullYear();
    var month = new Date(data[i].createTime).getMonth() + 1;
    var day = new Date(data[i].createTime).getDate();
    var hours = new Date(data[i].createTime).getHours() >= 10 ? new Date(data[i].createTime).getHours() : "0" + new Date(data[i].createTime).getHours().toString();
    var min = new Date(data[i].createTime).getMinutes() >= 10 ? new Date(data[i].createTime).getMinutes() : "0" + new Date(data[i].createTime).getMinutes().toString();
    var sec = new Date(data[i].createTime).getSeconds() >= 10 ? new Date(data[i].createTime).getSeconds() : "0" + new Date(data[i].createTime).getSeconds().toString();

    if(data[i].status == 0){
      if(data[i].type == 1){ //入会
        str += '<li class="d-flex">' +
                '<div class="msg" data-id="'+ data[i].uid +'">' +
                  '<p>' +
                    '<i>'+ truncated(data[i].title.split("申")[0], 5) +'</i>' + data[i].title.split("”")[1] +
                  '</p>' +
                  '<p style="color: #C6CBF7;margin-top: 10px;">'+ year +'-'+ month +'-'+ day +'&nbsp;&nbsp;&nbsp;'+ hours +':'+ min +':'+ sec +'</p>' +
                '</div>' +
                '<div class="btn agreeJoin" data-id="'+ data[i].uid +'" data-name="'+ data[i].title.split("“")[1].split("”")[0] +'">同意</div>' +
              '</li>'
      }else if(data[i].type == 2){ // 退会
        str += '<li class="d-flex">' +
                '<div class="msg" data-id="'+ data[i].uid +'">' +
                  '<p>' +
                    '<i>'+ truncated(data[i].title.split("申")[0], 5) +'</i>' + data[i].title.split("”")[1] +
                  '</p>' +
                  '<p style="color: #C6CBF7;margin-top: 10px;">'+ year +'-'+ month +'-'+ day +'&nbsp;&nbsp;&nbsp;'+ hours +':'+ min +':'+ sec +'</p>' +
                '</div>' +
                '<div class="btn agreeQuit" data-id="'+ data[i].uid +'" data-name="'+ data[i].title.split("“")[1].split("”")[0] +'">同意</div>' +
              '</li>'
      }
    }else if(data[i].status == 1){
      str += '<li class="d-flex">' +
                '<div class="msg" data-id="'+ data[i].uid +'">' +
                  '<p>' +
                    '<i>'+ truncated(data[i].title.split("申")[0], 5) +'</i>' + data[i].title.split("”")[1] +
                  '</p>' +
                  '<p style="color: #C6CBF7;margin-top: 10px;">'+ year +'-'+ month +'-'+ day +'&nbsp;&nbsp;&nbsp;'+ hours +':'+ min +':'+ sec +'</p>' +
                '</div>' +
                '<div class="btn">已同意</div>' +
              '</li>'
    }else if(data[i].status == 2){
      str += '<li class="d-flex">' +
                '<div class="msg" data-id="'+ data[i].uid +'">' +
                  '<p>' +
                    '<i>'+ truncated(data[i].title.split("申")[0], 5) +'</i>' + data[i].title.split("”")[1] +
                  '</p>' +
                  '<p style="color: #C6CBF7;margin-top: 10px;">'+ year +'-'+ month +'-'+ day +'&nbsp;&nbsp;&nbsp;'+ hours +':'+ min +':'+ sec +'</p>' +
                '</div>' +
                '<div class="btn">已失效</div>' +
              '</li>'
    }else if(data[i].status == 3){
      str += '<li class="d-flex">' +
                '<div class="msg" data-id="'+ data[i].uid +'">' +
                  '<p>' +
                    '<i>'+ (data[i].title) +'</i>' +
                  '</p>' +
                '</div>' +
                '<div class="quit-time">' +
                  '<p>'+ year +'-'+ month +'-'+ day +'</p>' +
                  '<p>'+ hours +':'+ min +':'+ sec +'</p>' +
                '</div>' +
              '</li>'
    }
  }

  $(".union-history ul").append(str)
  $(".union-history ul li div.msg").click(function(e){
    var uid = $(this).data().id.toString()
    if(uid != info.uid){
      if (browser.app && browser.ios) {
        window.webkit.messageHandlers.openPersonPage.postMessage(uid)
      } else if (browser.app && browser.android) {
        if (androidJsObj && typeof androidJsObj === "object") {
          window.androidJsObj.openPersonPage(uid)
        }
      }else{
        console.log(123)
      }
    }
  })

  if(_docHeight < $(".union-history").height()){
    $("body").css("height", "auto");
    $("html").css("height", "auto");
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
    
    if(res.path == 'union/unionMemberLogList'){
      if(data){
        pageNo += 1
        if(data.length == 0){
          pageNo -= 1
        }
        renderList(data)
      }else{
        $(".toast").show().fadeTo(400, 1).find("span").text("无相关内容")
        setTimeout(function(){
          $(".toast").fadeTo(400, 0, function(){
            $(".toast").hide()
          })
        }, 1500)
      }

    }else if(res.path == 'union/applicationPassed'){
      $(".toast").show().fadeTo(400, 1).find("span").text(ele.data().name + "加入公会")
      ele.text("已同意").removeClass("agreeJoin")
      setTimeout(function(){
        $(".toast").fadeTo(400, 0, function(){
          $(".toast").hide()
        })
      }, 1500)

    }else if(res.path == 'union/passApplyQuitUnion'){
      $(".toast").show().fadeTo(400, 1).find("span").text(ele.data().name + "退出公会")
      ele.text("已同意").removeClass("agreeQuit")
      setTimeout(function(){
        $(".toast").fadeTo(400, 0, function(){
          $(".toast").hide()
        })
      }, 1500)

    }
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
        if(browser.ios){

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