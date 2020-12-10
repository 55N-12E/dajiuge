var info = {};
var browser = checkVersion(), env =EnvCheck(), api = locateJudge();
if(env == 'test') {
  var vConsole = new VConsole();
}

$(function () {
  var main = {
    init: function() {
      setTimeout(function () {
        info.useNew = (info.appVersion[0] >= 1 && info.appVersion[2] >= 5 && info.appVersion[4] >= 5) ? true : false
      },100)
      this.getMsgFromDevice();
      this.eventRegister();
      this.getData();
    },

    getMsgFromDevice: function() {
      if(browser.app) {
        if(browser.ios) {
          window.webkit.messageHandlers.getUid.postMessage(null);
          window.webkit.messageHandlers.getTicket.postMessage(null);
          window.webkit.messageHandlers.getAppVersion.postMessage(null);
        } else if(browser.android) {
          if(androidJsObj && typeof androidJsObj === 'object') {
            info.uid = parseInt(window.androidJsObj.getUid());
            info.ticket = window.androidJsObj.getTicket();
            info.appVersion = window.androidJsObj.getAppVersion();
          }
        }
      }else {
        info.appVersion = "1.5.5"
      }
    },

    eventRegister: function() {
      $('.recommend-btn').on('click',function() {
        var exp = /^[0-9]+$/
        var val = $('.user-inside').find('input').val();
        if(!exp.test(val)) {
          $('.toast').fadeIn(500).html('请输入正确的房主ID').fadeOut(6000);
          return;
        }
        $('.mask').css('display','flex').next().show();
      });

      $('.cancel').on('click',function() {
        $('.mask').hide().next().hide();
      })

      $('.confirm').on('click',function() {
        var val = $('.user-inside').find('input').val();

        if(browser.app && info.useNew){
          var obj = {
            method: 1,
            path: "noble/users/recom",
            params: {
              erbanNo: val,
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
            url: api + '/noble/users/recom',
            type: "GET",
            headers: {
              "pub_ticket": info.ticket
            },
            data: {
              erbanNo: val,
              ticket: info.ticket
            },
            success(res){
              if(res.code == 200) {
                $('.mask').hide().next().hide();
                // $('.toast').fadeIn(500).html(res.data).fadeOut(5000)
                $('.toast').fadeIn(500).html('推荐成功，剩余次数' + res.data + '次').fadeOut(3000)
                setTimeout(function(){
                  window.location.reload();
                },3100)
              } else if(res.code == 1404) {
                $('.toast').fadeIn(500).html(res.message).fadeOut(3000);
              } else if(res.code ==500) {
                $('.toast').fadeIn(500).html('服务器错误，请稍后重试').fadeOut(3000);
              }else if(res.code == 3401) {
                $('.toast').fadeIn(500).html('您已经没有推荐机会了').fadeOut(3000);
              }
            }
          })
        }
        $('.mask').hide().next().hide();
      });
    },

    getData: function() {
      setTimeout(function() {
        if(browser.app && info.useNew){
          var obj = {
            method: 1,
            path: "noble/users/getrecomcount",
            params: {
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
            url: api + '/noble/users/getrecomcount',
            type: "GET",
            headers: {
              "pub_ticket": info.ticket
            },
            data: {
              ticket: info.ticket
            },
            success(res){
              if(res.code == 200) {
                console.log(res.data)
                $('.times').html(res.data);
              }
            }
          })
        }
      },100)
    }
  };
  main.init();
})

function shareInfo() {};
function showTitleRightNoticeFuck() {};

function getMessage(key,value) {
  info[key] = value;
}


// app -> js
function frontHttpResponse(res){
  console.log(res)
  if(res.resCode == 0){
    var data
    if(res.data != undefined || res.data != null){
      data = res.data
    }

    if(res.path == 'noble/users/recom'){
      $('.mask').hide().next().hide();
      $('.toast').fadeIn(500).html('推荐成功，剩余次数' + data + '次').fadeOut(3000)
      setTimeout(function(){
        window.location.reload();
      },3100)
    }else if(res.path == 'noble/users/getrecomcount'){
      $('.times').html(data);
    }
  }else{
    console.log(res)
    if(browser.android){
      $('.toast').fadeIn(500).html(res.message).fadeOut(3000)
    }
  }
}