var info = {};
var noblePower = [];
if(EnvCheck() == 'test'){
  var vConsole = new VConsole();
}
$(function () {
  var nobleArr = [];

  var nobleUser = {};
  console.log($(window).width());
  var browser = checkVersion();
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
    info.uid = 90651;
  }
  if(browser.app && browser.ios){
    $('.copyBtn').html('长按微信号复制');
  }
  setTimeout(function () {
    getNobleMsg();
  },100)

  function getNobleMsg() {
    var ajaxList = $.ajax({
      url: '/noble/right/list',
      type: 'get',
      dataType: 'json',
      success: function (res) {
        if(res.code == 200){
          nobleArr = res.data;
          // renderPowerList(nobleArr[0]);
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
      },
      success:function (res) {
        if(res.code == 200){
          nobleUser = res.data;
        }
      }
    })
    $.when(ajaxList,ajaxUser).done(function (ajax1,ajax2) {
      var res1 = ajax1[0],res2 = ajax2[0];
      var user = res2.data;
      var nobleId = user.nobleId;
      renderPowerList(nobleArr[nobleId-1]);
      renderSettingList(user,nobleArr);

      renderBottom(user.expire,nobleId);
    })
  }
  $('.attention .upgrade').on('click',function () {

    var index = nobleUser.nobleId + 1;
    var str = '?nobleIndex=' + index;
    if(env == 'test'){
      window.location.href = 'http://apibeta.kawayisound.xyz/modules/noble/order.html' + str;
    }else{
      // window.location.href = 'https://www.erbanyy.com/modules/noble/order.html' + str;
      window.location.href = tranUrl + '/modules/noble/order.html' + str;
    }
  })
  $('.copyBtn').on('click',function () {
    var weixinNum = $(this).siblings('span').html();
    if(browser.app){
      if(browser.android){
        window.androidJsObj.clipboardToPhone(weixinNum);
        $('.copySucess').show();
        setTimeout(function () {
          $('.copySucess').hide();
        },800)
      }
    }
  })
  initNav(showTitleRightNoticeFuck());
})
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
function renderSettingList(nobleUserObj,nobleArr) {
  var $list = $('.middle ul li');
  var nobleId = nobleUserObj.nobleId;
  var noble = nobleArr[nobleId-1];
  // 根据个人来设置相应信息
  switch (nobleId){
    case 5:
      if(nobleUserObj.enterHide){
        $list.eq(1).find('.button-wrapper').addClass('active');
      }
      break;
    case 6:case 7:
    $list.eq(0).find('.title').html(nobleUserObj.nobleName+'靓号');
    if(nobleUserObj.goodNum){
      $list.eq(0).find('.msg').html(nobleUserObj.goodNum);
    }
    if(nobleUserObj.enterHide){
      $list.eq(1).find('.button-wrapper').addClass('active');
    }
    if(nobleUserObj.rankHide){
      $list.eq(2).find('.button-wrapper').addClass('active');
    }
    break;
  }


  // 根据权限来显示相应的设置
  var middleArr = [noble.goodNum,noble.enterHide,noble.rankHide,noble.recomRoom,noble.specialService];
  for(var i = 0;i < middleArr.length;i++){
    if(middleArr[i]){
      $list.eq(i).css('display','flex');
    }
  }
}
function renderBottom(time,nobleId) {
  console.log(nobleId);
  var expireTime = new Date(time);
  $('.attention span').html(getDate(expireTime));
  if(nobleId == 7 || nobleId == 0 || (info.loadingStatus == '1' && nobleId == 1)){
    $('.upgrade').hide();
  }else{
    $('.upgrade').show();
  }
}
function getMessage(key,value){
  info[key] = value;
}
function shareInfo() {

}
function getDate(time) {
  var date = new Date(time);
  return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

}

$('.middle li .button-wrapper').on('click',function () {
  var index = $(this).parents('li').index();
  console.log(index);
  $(this).toggleClass('active');
  var status = $(this).hasClass('active')?1:0;
  if(index == 1){
    $('#loading').show();
    $.ajax({
      url: '/noble/users/hideenter',
      type: 'get',
      dataType: 'json',
      data: {
        uid: info.uid,
        val: status,
        ticket: info.ticket
      },
      success:function (res) {
        if(res.code == 200){
          setTimeout(function () {
            $('#loading').hide();
          },1000)
        }
      }
    })
  }else if(index == 2){
    $('#loading').show();
    $.ajax({
      url: '/noble/users/hiderank',
      type: 'get',
      dataType: 'json',
      data: {
        uid: info.uid,
        val: status,
        ticket: info.ticket
      },
      success:function (res) {
        if(res.code == 200){
          setTimeout(function () {
            $('#loading').hide();
          },1000)
        }
      }
    })
  }
})


$('.middle li').on('click',function () {
  var index = $(this).index();
  var env = EnvCheck();
  if(index == 0){
    // window.location.href = (env == 'test')? 'http://apibeta.kawayisound.xyz/modules/noble/numApply.html':'https://www.erbanyy.com/modules/noble/numApply.html';
    window.location.href = (env == 'test')? 'http://apibeta.kawayisound.xyz/modules/noble/numApply.html':tranUrl + '/modules/noble/numApply.html';
    // window.location.href = window.location.origin + '/modules/noble/numApply.html';
  }else if(index == 3){
    // window.location.href = (env == 'test')? 'http://apibeta.kawayisound.xyz/modules/noble/roomRecomm.html':'https://www.erbanyy.com/modules/noble/roomRecomm.html';
    window.location.href = (env == 'test')? 'http://apibeta.kawayisound.xyz/modules/noble/roomRecomm.html':tranUrl + '/modules/noble/roomRecomm.html';
    // window.location.href = window.location.origin + '/modules/noble/roomRecomm.html';
  }else if(index == 4){

    $('.contactMask').show();
  }
})
$('.contactMask').on('click',function (e) {
  $(this).hide();
})
$('.contactMask .win').on('click',function (e) {
  if($(e.target).hasClass('iconClose')){
    $(this).parent().hide();
  }
  e.stopPropagation();
})
$('.attention .con').on('click',function () {
  var env = EnvCheck();
  if(env == 'test'){
    window.location.href = 'http://apibeta.kawayisound.xyz/modules/noble/order.html';
  }else{
    // window.location.href = 'https://www.erbanyy.com/modules/noble/order.html';
    window.location.href = tranUrl + '/modules/noble/order.html';
  }
  console.log('点击了');
})

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
  };
  return obj;
}
