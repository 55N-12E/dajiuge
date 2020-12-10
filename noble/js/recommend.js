var info = {};
var browser = checkVersion(), env =EnvCheck();
var api = locateJudge();

$(function () {
  if(env == 'test') {
    var vConsole = new VConsole();
  }

  var main = {
    init: function() {
      this.getMsgFromDevice();
      this.eventRegister();
      this.getData();
    },

    getMsgFromDevice: function() {
      if(browser.app) {
        if(browser.ios) {
          info.uid = tools.cookieUtils.get('uid');
          window.webkit.messageHandlers.getUid.postMessage(null);
          window.webkit.messageHandlers.getTicket.postMessage(null);
        } else if(browser.android) {
          if(androidJsObj && typeof androidJsObj === 'object') {
            info.uid = parseInt(window.androidJsObj.getUid());
            info.ticket = window.androidJsObj.getTicket();
          }
        }
      }
       else {
         info.uid = 90650;
       }
    },

    eventRegister: function() {
      $('.recommend-btn').on('click',function() {
        var val = $('.user-inside').find('input').val();

        if(!val) {
          $('.toast').fadeIn(500).html('请输入正确的房间号或房主ID').fadeOut(6000);
          return;
        }

        $('.mask').css('display','flex').next().show();
      });

      $('.cancel').on('click',function() {
        $('.mask').hide().next().hide();
      })

      $('.confirm').on('click',function() {
        var val = $('.user-inside').find('input').val();
        $.get(api + '/noble/users/recom',{uid: info.uid, erbanNo: val, ticket: info.ticket}, function(res) {
          if(res.code == 200) {
            $('.mask').hide().next().hide();
            // $('.toast').fadeIn(500).html(res.data).fadeOut(5000)
            $('.toast').fadeIn(500).html('推荐成功，剩余次数' + res.data + '次').fadeOut(3000)
            setTimeout(function(){
              window.location.reload();
            },3100)
          } else if(res.code == 1404) {
            $('.toast').fadeIn(500).html('输入信息有误，请查询').fadeOut(3000);
          } else if(res.code ==500) {
            $('.toast').fadeIn(500).html('服务器错误，请稍后重试').fadeOut(3000);
          }else if(res.code == 3401) {
            $('.toast').fadeIn(500).html('您已经没有推荐机会了').fadeOut(3000);
          }
        })
      });
    },

    getData: function() {
      setTimeout(function() {
        $.get(api + '/noble/users/getrecomcount', {uid: info.uid, ticket: info.ticket}, function(res) {
          if(res.code == 200) {
            $('.times').html(res.data);
          }
        })
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