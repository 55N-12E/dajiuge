/**
 * Created by raymondjack on 2019/1/20.
 */
var info = {},locateObj = getQueryString();
var MODE = {
  KTV: '1',
  TAG: '2'
};
var $tagRoomList = document.getElementById('tagRoom-list');
var $ktvLatestList = document.getElementById('ktv-latest-list');
var $ktvHotList = document.getElementById('ktv-hot-list');
var tagScroll,ktvLatestScroll,ktvHotScroll;
var initBol = true;
var endBol = false;
$(function () {
  var env = EnvCheck(),

    browser = checkVersion();


  if(env == 'test'){
    var vConsole = new VConsole();
  }


  var main = {
    data: {},
    init: function() {
      var that = this;
      resizeDom(locateObj.mode);
      changeTitle();
      this.getMsgFromDevice();
      this.eventRegister();
      setTimeout(function () {
        that.meScrollInitial();
      },200)
    },
    getMsgFromDevice: function () {
      if(browser.app){
        if(browser.ios){
          info.uid = tools.cookieUtils.get("uid");
          window.webkit.messageHandlers.getTicket.postMessage(null);
          window.webkit.messageHandlers.getAppVersion.postMessage(null);
          window.webkit.messageHandlers.getChannel.postMessage(null);
        }else{
          info.uid = parseInt(window.androidJsObj.getUid());
          info.ticket = window.androidJsObj.getTicket();
          info.appVersion = window.androidJsObj.getAppVersion();
          info.channel = window.androidJsObj.getChannel();
        }
      }else{
        info.uid = 90450078;
        info.ticket = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWNrZXRfdHlwZSI6bnVsbCwidWlkIjo5MDQ1MDA3OCwidGlja2V0X2lkIjoiNzkwNjdlMzAtNDI4ZS00YTlkLWE4ZmMtZmQ5YzY1ZGVkMmFkIiwiZXhwIjozNjAwLCJjbGllbnRfaWQiOiJlcmJhbi1jbGllbnQifQ.zR052Y2Jz7uLnEZdFR7xfg8jcX_fgABrGznljRhcsAA";
        info.appVersion = "1.0.0";
        info.channel = "appstore";
      }

    },
    eventRegister: function () {
      $('.tab-wrapper .tab').on('click',function () {
        if($(this).hasClass('active')){
          return;
        }
        $('.bar').toggleClass('right');
        var index = $(this).index();
        console.log(index);
        $(this).addClass('active').siblings('.tab').removeClass('active');
        $('.ktv-content').find('.mescroll').eq(index).show().siblings('.mescroll').hide();

        if(index == 1 && !ktvHotScroll){
          ktvHotScroll = main.buildScroll('ktvHotScroll','ktv-hot-list');
        }
      })
      
      $('.mescroll').on('click','li',function () {
        var erbanUid = $(this).data('uid');
        if(browser.app){
          if(browser.ios){
            window.webkit.messageHandlers.openRoom.postMessage(erbanUid);
          }else if(browser.android){
            if(androidJsObj && typeof androidJsObj === 'object'){
              window.androidJsObj.openRoom(erbanUid);
            }
          }
        }
      })
    },
    buildScroll: function (scrollId,emptyId) {
      return new MeScroll(scrollId,{
        up: {
          callback: upCallback,
          clearEmptyId: emptyId,
          isBounce: false,
          lazyLoad: {
            use: true // 是否开启懒加载,默认false
          }
        }
      })
    },
    meScrollInitial: function () {
      // 所有meScroll初始化
      var mode = locateObj.mode;
      if(mode == MODE.KTV){
        // ktv房，优先渲染ktv的最新
        ktvLatestScroll = this.buildScroll('ktvLastestScroll','ktv-latest-list');
      }else{
        // 标签房
        tagScroll = this.buildScroll('tagScroll','tagRoom-list');
      }
    }
  }

  main.init();
})


function resizeDom(mode) {
  var $tabWrapper = $('.tab-wrapper');
  if(mode == MODE.KTV){
    $tabWrapper.css('display','flex');
    var height = $tabWrapper.height();
    $('.mescroll').css('top',height);
    $('.ktv-content').show();
    $('#ktvHotScroll').hide();
  }else{
    $tabWrapper.hide();
    $('.mescroll').css('top',0);
    $('.tag-content').show();
    if(locateObj.tagId == '28'){
      $('#tagRoom-list').removeClass('list-wrapper').addClass('list-101-wrapper');
    }
  }
}

function changeTitle() {
  var tagId = locateObj.tagId;
  var mode = locateObj.mode;
  var title = $('title');
  var content = '';
  if(mode == MODE.KTV){
    content = 'K歌现场（KTV）';
  }else{
    switch (tagId){
      case '22':
        content = '热门推荐';
        break;
      case '27':
        content = '点唱电台';
        break;
      case '24':
        content = '聊天交友';
        break;
      case '26':
        content = "男神女神";
        break;
      case '23':
        content = '瞩目艺人';
        break;
      case '25':
        content = '娱乐派对';
        break;
      case '28':
        content = '99约101';
        break;
    }
  }
  title.html(content);
}

function upCallback(page) {
  console.log(page);
  var orderType = $('.tab-wrapper .tab.active').index() + 1;
  var curScroll = (locateObj.mode == MODE.TAG)?tagScroll:((orderType == 1)?ktvLatestScroll:ktvHotScroll);

  if(page.num == 1){
    endBol = false;
  }
  if(endBol){
    curScroll.endSuccess(0);
    return;
  }

  requestData(page,function (res) {
    if(locateObj.mode == MODE.TAG){
      curScroll.endSuccess(res.data.rooms.length);
      if(res.code == 200){
        if(parseInt(locateObj.tagId) == 28){
          render('roomListBy101',{roomListData: res.data.rooms},$tagRoomList);
        }else{
          render('roomListByTag',{roomListData: res.data.rooms},$tagRoomList);
        }
      }
    }else{
      curScroll.endSuccess(res.data.length);
      if(res.code == 200){
        if(initBol){
          initBol = false;
          render('roomListByKTV',{roomListData: res.data},$ktvLatestList);
        }else{
          var index = $('.tab-wrapper .tab.active').index() + 1;
          if(index == 1){
            render('roomListByKTV',{roomListData: res.data},$ktvLatestList);
          }else{
            render('roomListByKTV',{roomListData: res.data},$ktvHotList);
          }
        }
      }
    }
  },function (res) {
    curScroll.endErr();
  })
}

function requestData(page,successCb,failedCb) {
  var orderType = $('.tab-wrapper .tab.active').index() + 1;
  var browser =checkVersion();
  var os = browser.android?'android':'ios';
  var paramObj = {
    orderType: orderType,
    tagId : locateObj.tagId?locateObj.tagId:0,
    uid: info.uid,
    appVersion: info.appVersion,
    channel: info.channel,
    pageSize: page.size?page.size:10,
    page: page.num?page.num:1,
    ticket: info.ticket,
    os: os,
    mode: locateObj.mode?locateObj.mode:0
  };
  $.ajax({
    headers: {
      "pub_ticket":info.ticket
    },
    url: locateJudge() + '/room/h5/list/get',
    data: paramObj,
    success: function (res) {
      // dealing special data
      if((locateObj.mode == MODE.KTV && res.data.length > page.size)){
        endBol = true;
      } else if (locateObj.mode == MODE.TAG && res.data.rooms.length > page.size){
        endBol = true;
      }
      typeof successCb === 'function' && successCb(res);
    },
    error: function (res) {
      typeof failedCb === 'function' && failedCb(res);
    }
  })
}



function getMessage(key,val) {
  info[key] = val;
}