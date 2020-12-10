<<<<<<< HEAD
var info = {}
var locateObj = getQueryString();
if(EnvCheck() == 'test'){
  var vConsole = new VConsole();
}
$(function () {
  var nobleArr = [];
  var noblePower = [];
  var browser = checkVersion();
  var nobleUser = {};
  var env = EnvCheck();
  if(browser.app){
    if(browser.ios){
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null);
      window.webkit.messageHandlers.loadingStatus.postMessage(null);
    }else if(browser.android){
      if(androidJsObj && typeof androidJsObj === 'object'){
        info.uid = parseInt(window.androidJsObj.getUid());
        info.ticket = window.androidJsObj.getTicket();
        info.loadingStatus = '0';
      }
    }
  }else{
    info.uid = 91011;
    info.loadingStatus = '0';
  }

  setTimeout(function () {
    // console.log(info);
    // alert(info);
    getNobleMsg();
  },150)


  function renderButtonText(nobleId) {
    var nobleMsg = nobleArr[nobleId];
    var $openWin = $('.open-win');
    $openWin.find('.price span').html(formatPrice(nobleMsg.openGold/10));
    $openWin.find('.present span').html(formatPrice(nobleMsg.openReturn) + '贵族金币');
    $openWin.find('.renew span').html(formatPrice(nobleMsg.renewGold/10));
    $openWin.find('.renewReturn span').html(formatPrice(nobleMsg.renewReturn));
  }
  function getNobleMsg() {
    var $openWin = $('.open-win');
    // 审核专用
    if(info.loadingStatus == '1'){
      // $('.nav ul li').eq(4).hide();
      // $('.nav ul li').eq(5).hide();
      // $('.nav ul li').eq(6).hide();
      $('.nav ul li').eq(0).siblings('li').hide();
      $openWin.find('.present').hide();
      $openWin.find('.renewReturn').hide();
    }else{
      // $('.nav ul li').eq(4).show();
      // $('.nav ul li').eq(5).show();
      // $('.nav ul li').eq(6).show();
      $('.nav ul li').eq(0).siblings('li').show();
    }
    var ajaxList = $.ajax({
      url: '/noble/right/list',
      type: 'get',
      dataType: 'json',
      success: function (res) {
        if(res.code == 200){
          // nobleArr = res.data;
          // renderPowerList(nobleArr[0]);
          if(info.loadingStatus == '1'){
            nobleArr = switchNobleArr(res.data);
          }else{
            nobleArr = res.data;
          }
        }
      }
    })

    var ajaxUser = $.ajax({
      url: '/noble/users/get',
      type: 'get',
      dataType: 'json',
      data:{
        uid: info.uid,
        ticket: info.ticket
      }
    })

    $.when(ajaxList,ajaxUser).done(function (ajax1,ajax2) {
      var nobleUserData = ajax2[0];
      nobleUser = nobleUserData.data;
      if(parseInt(locateObj.nobleId)){
        renderPowerList(nobleArr[locateObj.nobleId-1]);
        $('.nav ul li').eq(locateObj.nobleId-1).addClass('active');
        $('.open-win .open').show();
        renderButtonText(locateObj.nobleId-1);
      }else{
        if(nobleUserData.code == 200){
          var nobleId = nobleUserData.data.nobleId;
          renderPowerList(nobleArr[nobleId-1]);
          $('.nav ul li').eq(nobleId-1).addClass('active');
          $('.open-win .con').show();
          renderButtonText(nobleId-1);
        }else if(nobleUserData.code == 404){
          renderPowerList(nobleArr[0]);
          $('.nav ul li').eq(0).addClass('active');
          $('.open-win .open').show();
          renderButtonText(0);
        }
      }
      $('.open-win').css('display','flex');
    })

  }

  function renderPowerList(obj) {
    noblePower = [];
    noblePower.push(obj.userPage);
    noblePower.push(obj.userMedal);
    noblePower.push(obj.nobleGift);
    noblePower.push(obj.specialFace);
    noblePower.push(obj.enterNotice);
    noblePower.push(obj.roomBackground);
    noblePower.push(obj.micDecorate);
    noblePower.push(obj.chatBubble);
    noblePower.push(obj.micHalo);
    noblePower.push(obj.enterHide);
    noblePower.push(obj.rankHide);
    noblePower.push(obj.specialService);
    noblePower.push(obj.goodNum);
    noblePower.push(obj.recomRoom);
    noblePower.push(obj.prevent);

    var $li = $('.privilege-list li');
    for(var i = 0;i < noblePower.length;i++){
      if(noblePower[i]){
        $li.eq(i).addClass('active');
      }else{
        $li.eq(i).removeClass('active');
      }
    }

    $('.noble-wrapper').attr('class','noble-wrapper noble-' + obj.id);
    $('.noble-title .title span').html(obj.name);
  }
  $('.nav ul li').on('click',function () {
    if($(this).hasClass('active')){
      return;
    }
    var $openWin = $('.open-win');
    var $notOpenWin = $('.notOpen-win');
    $(this).addClass('active').siblings('li').removeClass('active');
    var index = $(this).index();
    renderPowerList(nobleArr[index]);

    if(!$.isEmptyObject(nobleUser)){
      // 是贵族
      if(nobleUser.nobleId - 1 > index){
        // 点击比当前贵族低的档次
        $notOpenWin.find('.cur').html(nobleUser.nobleName);
        $notOpenWin.find('.next').html(nobleArr[index].name);
        $openWin.hide();
        $notOpenWin.show();
      }else if(nobleUser.nobleId - 1 < index){
        // 点击比当前贵族高的档次
        renderButtonText(index);
        $openWin.find('.open').show();
        $openWin.find('.con').hide();
        $openWin.css('display','flex');
        $notOpenWin.hide();
      }else{
        // 点击贵族与当前贵族一样
        renderButtonText(index);
        $openWin.find('.con').show();
        $openWin.find('.open').hide();
        $openWin.css('display','flex');
        $notOpenWin.hide();
      }
    }else{
      // 不是贵族
      renderButtonText(index);
      $openWin.find('.open').show();
      $openWin.find('.con').hide();
      $openWin.css('display','flex');
      $notOpenWin.hide();
    }

  })

  $('.open-win .open').on('click',function () {
    // if(browser.ios && browser.loadingStatus){
    //   // 1审核中，0未审核
    //   $('.toast').html('该功能还在开发中');
    //   $('.toast').show();
    //   setTimeout(function () {
    //     $('.toast').hide();
    //   },1200);
    //   return;
    // }
    var index = $('.nav ul .active').index() + 1;
    var str = '?nobleIndex=' + index;
    // window.location.href = 'http://apibeta.kawayisound.xyz/modules/noble/order.html' + str;
    if(env == 'test'){
      window.location.href = 'http://apibeta.kawayisound.xyz/modules/noble/order.html' + str;
    }else{
      // window.location.href = 'https://www.erbanyy.com/modules/noble/order.html' + str;
      window.location.href = tranUrl + '/modules/noble/order.html' + str;
    }
  });
  $('.open-win .con').on('click',function () {
    // if(browser.ios && browser.loadingStatus){
    //   // 1审核中，0未审核
    //   $('.toast').html('该功能还在开发中');
    //   $('.toast').show();
    //   setTimeout(function () {
    //     $('.toast').hide();
    //   },1200);
    //   return;

    // }
    if(env == 'test'){
      window.location.href = 'http://apibeta.kawayisound.xyz/modules/noble/order.html';
    }else{
      // window.location.href = 'https://www.erbanyy.com/modules/noble/order.html';
      window.location.href = tranUrl + '/modules/noble/order.html';
    }
  });




  $('.open-win .question').on('click',function () {
    if(env == 'test'){
      window.location.href = 'http://apibeta.kawayisound.xyz/modules/noble/faq.html';
    }else{
      // window.location.href = 'https://www.erbanyy.com/modules/noble/faq.html';
      window.location.href = tranUrl + '/modules/noble/faq.html';
    }
  })
  initNav(showTitleRightNoticeFuck());
});
function switchNobleArr(nobleArr) {
  var arr = [12,588,1998,6498];
  for(var i = 0;i < 3;i++){
    nobleArr[i].openGold = arr[i]*10;
    nobleArr[i].renewGold = arr[i]*10;
    nobleArr[i].openReturn = 0;
    nobleArr[i].renewReturn = 0;
  }
  return nobleArr;
}


function getMessage(key,value){
  info[key] = value;
}

function formatPrice(num) {
  if(num < 10000){
    return num;
  }
  var res = (num/10000) + '万';
  return res;
}

function shareInfo() {}
function showTitleRightNoticeFuck () {
  var linkUrl = '';
  if(EnvCheck() == 'test'){
    linkUrl = 'http://apibeta.kawayisound.xyz/modules/noble/faq.html';
  }else{
    // linkUrl = 'https://www.erbanyy.com/modules/noble/faq.html';
    linkUrl = tranUrl + '/modules/noble/faq.html';
  }
  var obj = {
    type : 1,
    data : {
      msg : 'wewawa',
      title: '规则说明',
      link: linkUrl
    }
  }
  return obj;
}
=======
>>>>>>> origin/feature/strategy
