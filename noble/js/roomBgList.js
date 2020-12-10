/**
 * Created by raymondjack on 2018/1/18.
 */
var info = {};
var nobleArr = [];
var timer = null;
var api = locateJudge();
var locateObj = getQueryString();
var browser = checkVersion();
var page = 1;
var bufferArr = [];
var env = EnvCheck();
var nobleId = 0;

if(EnvCheck() == 'test'){
  var vConsole = new VConsole();
}
var isScroll = false;
$(function () {
  if(browser.app){
    if(browser.ios){
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null);
      window.webkit.messageHandlers.getAppVersion.postMessage(null);
    }else if(browser.android){
      if(androidJsObj && typeof androidJsObj === 'object'){
        info.uid = parseInt(window.androidJsObj.getUid());
        info.ticket = window.androidJsObj.getTicket();
        info.appVersion = window.androidJsObj.getAppVersion();
      }
    }
  }else{
    info.appVersion = "1.5.5"
  }

  setTimeout(function () {
    info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
    getNobleMsg();
  },50)

  function getNobleMsg() {
    if(browser.app && info.useNew){
      var obj1 = {
        method: 1,
        path: "noble/users/get",
        params: {
          ticket: info.ticket
        }
      }
      var obj2 = {
        method: 1,
        path: "noble/right/list",
      }

      if(browser.android){
        window.androidJsObj.frontHttpRequest(JSON.stringify(obj1))
        window.androidJsObj.frontHttpRequest(JSON.stringify(obj2))
      }else if(browser.ios){
        var data1 = JSON.stringify(obj1)
        var data2 = JSON.stringify(obj2)
        window.webkit.messageHandlers.frontHttpRequest.postMessage(data1);
        window.webkit.messageHandlers.frontHttpRequest.postMessage(data2);
      }
    }else{
      // var ajaxUser = $.get(api+"/noble/users/get",{ticket:info.ticket});
      var ajaxUser = $.ajax({
        url: api+"/noble/users/get",
        type: "GET",
        headers: {
          "pub_ticket": info.ticket
        },
        data: {
          ticket:info.ticket
        }
      })
      // var ajaxRes = $.get("/noble/res/list",{type:1,page:page,ticket:info.ticket});
      // var ajaxList = $.get(api+"/noble/right/list");
      var ajaxList = $.ajax({
        url: api+"/noble/right/list",
        type: "GET",
        headers: {
          "pub_ticket": info.ticket
        }
      })

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
  }

  $('.container').unbind('scroll').bind('scroll',function (e) {
    e.stopPropagation();
    if(isScroll == true) {
      return;
    }
    console.log(isScroll,'滚动处');
    var sum = this.scrollHeight;
    if(Math.round($(this).scrollTop() + $(this).height()) >= sum){
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
      if(locateJudge().match(/preview/)){
        window.location.href = 'https://preview.api.99date.hudongco.com/modules/nobles/intro.html';
      }else{
        window.location.href = 'https://api.99date.hudongco.com/modules/nobles/intro.html';
      }
    }else{
      window.location.href = 'https://prod.api.99date.hudongco.com/modules/nobles/intro.html';
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
        htmlStr += '&' + i + '=' + $(this).index()//msgData[i];
      }
      count++;
    }
    // htmlStr += '&time=' + new Date().getTime();
    if(env == 'test'){
      if(locateJudge().match(/preview/)){
        window.location.href = 'https://preview.api.99date.hudongco.com/modules/noble/roomBgDetail.html' + htmlStr;
      }else{
        window.location.href = 'https://api.99date.hudongco.com/modules/noble/roomBgDetail.html' + htmlStr;
      }
    }else{
      window.location.href = 'https://prod.api.99date.hudongco.com/modules/noble/roomBgDetail.html' + htmlStr;
    }
  })


  function requestNext() {
    // 请求下一页数据
    page++;
    if(browser.app && info.useNew){
      var obj = {
        method: 1,
        path: "noble/res/list",
        params: {
          type:1,
          page:page,
          ticket:info.ticket,
          nobleId: nobleId
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
        type: "get",
        url: api+"/noble/res/list",
        data: {type:1,page:page,ticket:info.ticket,nobleId: nobleId},
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
    }
    // $.get(api+"/noble/res/list",{type:1,page:page,ticket:info.ticket,nobleId: nobleId},function (res) {
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

function requestNobleRes(nobleId) {
  if(browser.app && info.useNew){
    var obj = {
      method: 1,
      path: "noble/res/list",
      params: {
        type:1,
        page:page,
        ticket:info.ticket,
        nobleId: nobleId
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
      type: "get",
      url: api+"/noble/res/list",
      data:{type:1,page:page,ticket:info.ticket,nobleId: nobleId},
      headers: {
        "pub_ticket":info.ticket
      },
      success: function (res) {
        renderList(res.data,page);
      }
    });
  }
  // $.get(api+"/noble/res/list",{type:1,page:page,ticket:info.ticket,nobleId: nobleId},function (res) {
  //   renderList(res.data,page);
  // });
}

function renderList(data,page) {
  var $ul = $('.backgroundList ul');
  for(var i = 0;i < data.length;i++){
    var $li = $('<li />');
    // var imgStr = data[i].preview + '|imageView2/1/w/320/h/569';
    var imgStr = data[i].preview + '|imageView2/1/w/160/h/285';
    var htmlStr = '<div class="background"><i class="chosen"></i><div class="noble"></div><img class="backImg" src="'+imgStr+'" alt=""><div class="badge">动态</div></div><p class="title">'+data[i].name+'</p>';
    $li.html(htmlStr);
    if(data[i].nobleId > 0){
      $li.find('.noble').html(nobleArr[data[i].nobleId - 1].name.substr(0,2)).addClass('noble-'+data[i].nobleId);
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


// app -> js
function frontHttpResponse(res){
  console.log(res)
  if(res.resCode == 0){
    var data
    if(res.data != undefined && res.data != null){
      data = res.data
    }

    if(res.path == 'noble/users/get'){
      if(data){
        if(browser.ios){
          nobleId = data.nobleId;
        }
      }else{
        showToast(res.message)
      }

    }else if(res.path == 'noble/right/list'){
      if(data){
        nobleArr = data;
        requestNobleRes(nobleId);
      }else{
        showToast(res.message)
      }
      
    }else if(res.path == 'noble/res/list'){
      $('#loading').hide();
      if(data){
        renderList(data,page);
      }else{
        showToast(res.message)
      }
      
    }
  }else{
    if(res.resCode == 404 && browser.ios){
      $('.tips').css('display','flex');
      return;
    }else{
      showToast(res.message)
    }
  }
}