/**
 * Created by raymondjack on 2018/1/18.
 */
var info = {};
var nobleArr = [];
var timer = null;
var api = locateJudge();
var locateObj = getQueryString();
if(EnvCheck() == 'test'){
  var vConsole = new VConsole();
}
var isScroll = false;
$(function () {
  var browser = checkVersion();
  var page = 1;
  var bufferArr = [];
  var env = EnvCheck();
  var nobleId = 0;
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
    info.uid = 4;
  }

  setTimeout(function () {
    getNobleMsg();
  },50)

  function getNobleMsg() {
    var browser = checkVersion();
    var ajaxUser = $.get(api+"/noble/users/get",{uid:info.uid,ticket:info.ticket});
    // var ajaxRes = $.get("/noble/res/list",{type:1,page:page,uid:info.uid,ticket:info.ticket});
    var ajaxList = $.get(api+"/noble/right/list");

    $.when(ajaxUser,ajaxList).done(function (ajax1,ajax3) {
      var res1 = ajax1[0],res3 = ajax3[0];
      nobleId = 0;
      if(res1.code == 404 && browser.ios){
        $('.tips').css('display','flex');
        return;
      }

      if(res1.code == 200){
        if(browser.ios){
          nobleId = res1.data.nobleId;
        }
      }
      nobleArr = res3.data;


      requestNobleRes(nobleId);
      // renderList(res2.data,page);
      // requestNext();
    })
  }
  
  function requestNobleRes(nobleId) {
    $.ajax({
      type: "get",
      url: api+"/noble/res/list",
      data:{type:1,page:page,uid:info.uid,ticket:info.ticket,nobleId: nobleId},
      headers: {
        "pub_ticket":info.ticket
      },
      success: function (res) {
        renderList(res.data,page);
      }
    });
    // $.get(api+"/noble/res/list",{type:1,page:page,uid:info.uid,ticket:info.ticket,nobleId: nobleId},function (res) {
    //   renderList(res.data,page);
    // });
  }

  $('.container').unbind('scroll').bind('scroll',function (e) {
    e.stopPropagation();
    if(isScroll == true) {
      return;
    }
    console.log(isScroll,'滚动处');
    var sum = this.scrollHeight;
    if($(this).scrollTop() + $(this).height() >= sum){
      isScroll = true;
      $('#loading').show();
      clearInterval(timer);
      timer = setTimeout(function () {
        requestNext();


      },500)

    }
  })

  $('.tips .openButton').on('click',function () {
    if(env == 'test'){
      window.location.href = 'https://api.99date.hudongco.com/modules/nobles/intro.html';
    }else{
      // window.location.href = 'https://www.erbanyy.com/modules/noble/intro.html';
      window.location.href = 'https://api.99date.hudongco.com/modules/nobles/intro.html';
    }
  })
  $('.backgroundList ul').on('click','li',function () {
    var msgData = $(this).data('msg');
    var htmlStr = '?';
    var count = 0;
    for(var i in msgData){
      if(count == 0){
        htmlStr += i + '=' + msgData[i];
      }else{
        htmlStr += '&' + i + '=' + msgData[i];
      }
      count++;
    }
    // htmlStr += '&time=' + new Date().getTime();
    if(env == 'test'){
      window.location.href = 'https://api.99date.hudongco.com/modules/nobles/roomBgDetail.html' + htmlStr;
    }else{
      // window.location.href = 'https://www.erbanyy.com/modules/noble/roomBgDetail.html' + htmlStr;
      window.location.href = 'https://api.99date.hudongco.com/modules/nobles/roomBgDetail.html' + htmlStr;
    }
  })


  function requestNext() {
    // 请求下一页数据
    page++;
    $.ajax({
      type: "get",
      url: api+"/noble/res/list",
      data: {type:1,page:page,uid:info.uid,ticket:info.ticket,nobleId: nobleId},
      headers: {
        "pub_ticket":info.ticket
      },
      success: function (res) {
        if(res.code == 200){
          $('#loading').hide();
          if(res.data.length){
            bufferArr = res.data;
            console.log('有数据');
            renderList(bufferArr,page);
          }else{
            console.log('没数据了');
            isScroll = true;
            bufferArr = [];
          }
        }
      }
    })
    // $.get(api+"/noble/res/list",{type:1,page:page,uid:info.uid,ticket:info.ticket,nobleId: nobleId},function (res) {
    //   if(res.code == 200){
    //     $('#loading').hide();
    //     if(res.data.length){
    //       bufferArr = res.data;
    //       console.log('有数据');
    //       renderList(bufferArr,page);
    //     }else{
    //       console.log('没数据了');
    //       isScroll = true;
    //       bufferArr = [];
    //     }
    //   }
    // });
  }
})

function renderList(data,page) {
  var $ul = $('.backgroundList ul');
  for(var i = 0;i < data.length;i++){
    var $li = $('<li />');
    // var imgStr = data[i].preview + '|imageView2/1/w/320/h/569';
    var imgStr = data[i].preview + '|imageView2/1/w/160/h/285';
    var htmlStr = '<div class="background"><i class="chosen"></i><div class="noble"></div><img class="backImg" src="'+imgStr+'" alt=""><div class="badge">动态</div></div><p class="title">'+data[i].name+'</p>';
    $li.html(htmlStr);
    if(data[i].nobleId > 0){
      $li.find('.noble').html(nobleArr[data[i].nobleId - 1].name).addClass('noble-'+data[i].nobleId);
      $li.addClass('hasNoble');
    }
    $li.data('msg',{
      page: page,
      index: i
    });
    if(data[i].isDyn){
      $li.addClass('hasAni');
    }
    if(data[i].tmpint){
      $li.addClass('hasChosen');
    }
    $ul.append($li);
  }
  console.log(isScroll,'渲染处',page);
  isScroll = false;
}


function getMessage(key,value){
  info[key] = value;
}
function shareInfo() {}

function showTitleRightNoticeFuck () {}
