var info = {};
var vConsole = (EnvCheck() == 'test')? new VConsole() : '';
// var vConsole = new VConsole();
$(function () {
  var nobleUser = {};
  var browser = checkVersion();
  if(browser.app){
    if(browser.ios){
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null);
    }else if(browser.android){
      if(androidJsObj && typeof androidJsObj === 'object'){
        info.uid = parseInt(window.androidJsObj.getUid());
        info.ticket = window.androidJsObj.getTicket();
      }
    }
  }else{
    info.uid = 90650;
  }

  setTimeout(function () {
    getUserMsg();
  },50)

  function getUserMsg() {
    $.get("/noble/users/getrecomcount",{uid:info.uid,ticket:info.ticket},function (res) {
      if(res.code == 200){
        // res.data;
        $('.tips .first span').html(res.data);
      }
    });
  }

  $('.submit').on('click',function () {
    var val = $('.inputWrapper input').val();
    if(!val){
      return;
    }
    $('.mask').show();
  })
  $('.mask').on('click',function () {
    $(this).hide();
  })
  $('.mask .win').on('click',function (e) {
    if($(e.target).hasClass('iconClose') || $(e.target).hasClass('cancel')){
      $(this).parent().hide();
    }
  })
  $('.mask .sure').on('click',function () {
    var val = $('.inputWrapper input').val();
    $.get("/noble/users/recom",{uid:info.uid,erbanNo:val,ticket:info.ticket},function (res) {
      if(res.code == 200){
        $('.toast').show();
        $('.tips .first span').html(res.data);
        setTimeout(function () {
          $('.toast').hide();
        },1000)
      }else if(res.code == 1404){
        $('.errorResult p').html('输入信息有误，请查询');
        $('.errorResult').show();
        setTimeout(function () {
          $('.errorResult').hide();
        },1000)
      }else if(res.code == 500){
        $('.errorResult p').html('服务器错误，请稍候重试');
        $('.errorResult').show();
        setTimeout(function () {
          $('.errorResult').hide();
        },1000)
      }else if(res.code == 3401){
        $('.errorResult p').html('您已经没有推荐机会了');
        $('.errorResult').show();
        setTimeout(function () {
          $('.errorResult').hide();
        },1000)
      }
    });
  })
})

function shareInfo() {}

function getMessage(key,value){
  info[key] = value;
}
function showTitleRightNoticeFuck () {}


