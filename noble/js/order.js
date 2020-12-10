// var vConsole = new VConsole();
if(EnvCheck() == 'test'){
  var vConsole = new VConsole();
}
var nobleArr = [];
var user = {
  nobleStatus: 300,
  goldNum: 0
};
var browser = checkVersion();
var successUrl = '';
var nobleUser = {};
var info = {};
var locateObj = getQueryString();
var prefix = locateJudge();
$(function () {
  shareInfo();
  if(browser.app){
    if(browser.ios){
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getRoomUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null);
      window.webkit.messageHandlers.loadingStatus.postMessage(null);

    }else if(browser.android){
      if(androidJsObj && typeof androidJsObj === 'object'){
        info.uid = parseInt(window.androidJsObj.getUid());
        info.roomUid = window.androidJsObj.getRoomUid();
        info.ticket = window.androidJsObj.getTicket();
        info.loadingStatus = '0';
      }
    }
  }else{
    info.uid = 90670;
    info.loadingStatus = '0';
  }
  // if(browser.app && browser.ios){
  //   // $('.copyBtn').html('长按微信号复制');
  // }
  var env = EnvCheck();
  if(env == 'test'){
    successUrl = 'http://apibeta.kawayisound.xyz/modules/noble/paySuccess.html';
  }else{
    // successUrl = 'https://www.erbanyy.com/modules/noble/paySuccess.html';
    successUrl = tranUrl + '/modules/noble/paySuccess.html';
  }

  setTimeout(function () {
    var $li = $('.payWayWrapper .middle ul li');
    getAjaxMsg();
    // console.log(info);
    if(info.loadingStatus == '1'){
      // 审核中
      $li.eq(3).css('display','inline-block');
      $li.eq(3).addClass('active');
      $('.tips').addClass('check');
    }else{
      // 不是审核
      $li.eq(0).css('display','inline-block');
      $li.eq(0).addClass('active');
      $li.eq(1).css('display','inline-block');
    }
  },50);
  function getAjaxMsg() {
    var getNobleList = $.ajax({
      url: prefix + '/noble/right/list',
      type: 'get',
      dataType: 'json'
    });

    var getNobleUser = $.ajax({
      url: prefix + '/noble/users/get',
      type: 'get',
      dataType: 'json',
      data: {
        uid: info.uid,
        ticket:info.ticket
      }
    });

    var getUserCoin = $.ajax({
      url: prefix + '/purse/query',
      type: 'get',
      dataType: 'json',
      data: {
        uid: info.uid,
        ticket: info.ticket
      }
    });

    $.when(getNobleList,getNobleUser,getUserCoin).done(function (ajax1,ajax2,ajax3) {
      var res1 = ajax1[0],res2 = ajax2[0],res3 = ajax3[0];
      if(res1.code == 200){
        if(info.loadingStatus == '1'){
          switchNobleArr(res1.data);
          nobleArr = res1.data.reverse();
        }else{
          nobleArr = res1.data.reverse();
        }
      }
      nobleUser = res2.data;
      if(info.loadingStatus == '0'){
        renderNobleList('coin');
        $('.payWayWrapper').show();
      }else if(info.loadingStatus == '1'){
        // 审核中版本
        renderNobleList('money');
        $('.payWayWrapper').hide();
      }

      renderFirstNobleMsg();
      if(res3.code == 200){
        user.goldNum = res3.data.chargeGoldNum;
        $('.payWayWrapper .coin').html('当前余额：'+addComma(user.goldNum)+'金币');
      }
    })
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
    }else if(browser.ios){
      window.webkit.messageHandlers.clipboardToPhone.postMessage(weixinNum);
    }
  }
})


$('.payProWrapper .middle ul').on('click','li',function () {
  var $li = $('.payProWrapper .middle ul li');
  // 贵族产品点击事件
  if($(this).hasClass('active')){
    return;
  }
  var $button = $('.buttonWrapper');
  var index = $(this).index();
  if( nobleUser && nobleArr[index].id < nobleUser.nobleId ){
    return;
  }
  if(nobleUser && nobleUser.nobleId == nobleArr[index].id){
    // 续费
    $(this).addClass('active conFee').siblings('li').removeClass();
    var tipStr = '续费<span>奖励'+formatPrice(nobleArr[index].renewReturn)+'</span>贵族金币 预计到账时间<span>'+getTodayDate()+'</span>';

  }else{
    // 开通
    $(this).addClass('active openFee').siblings('li').removeClass();
    var tipStr = '开通<span>奖励'+formatPrice(nobleArr[index].openReturn)+'</span>贵族金币 预计到账时间<span>'+getTodayDate()+'</span>';
  }
  for(var i = 0;i < nobleArr.length;i++){
    if(nobleUser && nobleArr[i].id < nobleUser.nobleId){

      $li.eq(i).addClass('notActive');
    }
  }
  $button.find('.tips').html(tipStr);
  $button.find('.price').html($(this).find('.partDetail').html());
})


$('.payWayWrapper .middle ul').on('click','li',function () {
  if($(this).hasClass('active')){
    return
  }
  var $button = $('.buttonWrapper');
  var index = $(this).index();
  var $actList = $('.payProWrapper .middle ul .active');
  if(index < 1){
    // 用金币支付的情况下
    renderNobleList('coin');
  }else{
    renderNobleList('money');
  }

  switch (index){
    case 0:
      $('.payWayWrapper .coin').html('当前余额：'+addComma(user.goldNum)+'金币');
      break;
    case 1:
      $('.payWayWrapper .coin').html('单笔最高限额100000元');
      break;
    case 2:
      $('.payWayWrapper .coin').html('单笔最高限额3000元');
      break;
  }

  $(this).addClass('active').siblings('li').removeClass('active');
  $button.find('.price').html($actList.find('.partDetail').html());
})

function renderNobleList(moneyType) {
  // 用于渲染列表
  var $list = $('.payProWrapper .middle ul li');
  if(info.loadingStatus == '1'){
    $list.eq(0).hide();
    $list.eq(1).hide();
    $list.eq(2).hide();
    $list.eq(3).hide();
    $list.eq(4).hide();
    $list.eq(5).hide();
  }else{
    $list.eq(0).show();
    $list.eq(1).show();
    $list.eq(2).show();
    $list.eq(3).show();
    $list.eq(4).show();
    $list.eq(5).show();
  }

  if(moneyType == 'coin') {
    for (var i = 0; i < nobleArr.length; i++) {
      var price = addComma(nobleArr[i].openGold) + '金币';
      if (nobleUser && nobleUser.nobleId == nobleArr[i].id) {
        price = addComma(nobleArr[i].renewGold) + '金币';
      }
      $list.eq(i).find('.partDetail').html(price);
    }
  }else if(moneyType == 'money'){
    for (var i = 0; i < nobleArr.length; i++) {
      var price = '¥' + addComma(nobleArr[i].openGold/10);
      if (nobleUser && nobleUser.nobleId == nobleArr[i].id) {
        price = '¥' + addComma(nobleArr[i].renewGold/10);
      }
      $list.eq(i).find('.partDetail').html(price);
    }
  }
}

function renderFirstNobleMsg() {
  var $list = $('.payProWrapper .middle ul li');
  var $button = $('.buttonWrapper');
  // 此函数用于第一次显示的贵族内容
  if(!locateObj.nobleIndex){
    if(!$.isEmptyObject(nobleUser)){
      // 续费状态，用户之前的爵位被选择，而且爵位添加续费的class
      var index = nobleArr.length - nobleUser.nobleId;
      $list.eq(index).addClass('active conFee');
      $list.eq(index).find('.partTitle span').html('续费');
      var tipStr = '续费<span>奖励'+formatPrice(nobleArr[index].renewReturn)+'</span>贵族金币 预计到账时间<span>'+getTodayDate()+'</span>';
      $button.find('.tips').html(tipStr);
      $button.find('.price').html(addComma(nobleArr[index].renewGold) + '金币');
      if(info.loadingStatus == '1'){
        $button.find('.price').html('¥'+addComma(nobleArr[index].renewGold/10));
      }

    }else{
      // 开通状态
      $list.eq(0).addClass('active openFee');
      var tipStr = '开通<span>奖励'+formatPrice(nobleArr[0].openReturn)+'</span>贵族金币 预计到账时间<span>'+getTodayDate()+'</span>';
      $button.find('.price').html(addComma(nobleArr[0].openGold) + '金币');
      $button.find('.tips').html(tipStr);
      if(info.loadingStatus == '1'){
        $button.find('.price').html('¥'+addComma(nobleArr[0].openGold/10));
      }
    }
  }else{
    var index = 7 - parseInt(locateObj.nobleIndex);
    // 专用于审核
    if(info.loadingStatus == '1' && parseInt(locateObj.nobleIndex) >= 5){
      index = 0;
    }

    if(!$.isEmptyObject(nobleUser) && nobleUser.nobleId == locateObj.nobleIndex){
      $list.eq(index).addClass('active conFee');
      var tipStr = '续费<span>奖励'+formatPrice(nobleArr[index].renewReturn)+'</span>贵族金币 预计到账时间<span>'+getTodayDate()+'</span>';
      $button.find('.tips').html(tipStr);
      $button.find('.price').html(addComma(nobleArr[index].renewGold) + '金币');
      if(info.loadingStatus == '1'){
        $button.find('.price').html('¥'+addComma(nobleArr[index].renewGold/10));
      }
    }else{
      $list.eq(index).addClass('active openFee');
      var tipStr = '开通<span>奖励'+formatPrice(nobleArr[index].openReturn)+'</span>贵族金币 预计到账时间<span>'+getTodayDate()+'</span>';
      $button.find('.tips').html(tipStr);
      $button.find('.price').html(addComma(nobleArr[index].openGold) + '金币');
      if(info.loadingStatus == '1'){
        $button.find('.price').html('¥'+addComma(nobleArr[index].openGold/10));
      }
    }

  }

  if(nobleUser){
    // 灰度显示
    for(var i = 0;i < $list.length;i++){
      if(nobleUser.nobleId > nobleArr[i].id){
        $list.eq(i).addClass('notActive');
      }
    }
  }
}

function switchNobleArr(nobleArr) {
  var arr = [12,588,1998,6498];
  for(var i = 0;i < nobleArr.length;i++){
    if(i <= 3){
      nobleArr[i].openGold = arr[i]*10;
      nobleArr[i].renewGold = arr[i]*10;
    }
    nobleArr[i].openReturn = 0;
    nobleArr[i].renewReturn = 0;
  }
}
$('.payButton').on('click',function () {
  var $payEnsure = $('.payEnsure');
  var text = $(this).find('.price').html();
  $payEnsure.find('.text span').html(text);
  $('.payEnsure').show();
});

function payForCoin() {
  $('#loading').show();
  // isPay = true;
  var $actList = $('.payProWrapper .middle ul .active');
  var nobleId = 7 - ($actList.index());
  var isOpen = $actList.hasClass('openFee');
  // 判断是开通升级还是续费
  if(isOpen){
    payForCoinWay("/noble/pay/open/bygold");
  }else{
    payForCoinWay("/noble/pay/renew/bygold");
  }
  function payForCoinWay(url) {
    $.ajax({
      url: prefix + url,
      type: "get",
      dataType: 'json',
      data: {
        uid: info.uid,
        nobleId: nobleId,
        clientIp: 0,
        roomUid: info.roomUid,
        ticket: info.ticket
      },
      success: function (res) {
        $('#loading').hide();
        // isPay = false;
        if(res.code == 200){
          // $('.paySuccess').show();
          setTimeout(function () {
            window.location.href = successUrl;
          },800)
        }else if(res.code == 2103){
          console.log('余额不足');
          $('.payFail').html('金币余额不足，请充值');
          $('.payFail').show();
          setTimeout(function () {
            $('.payFail').hide();
            //  这里输入跳去充值页
            if(browser.app){
              if(browser.android){
                window.androidJsObj.openChargePage();
              }else if(browser.ios){
                window.webkit.messageHandlers.openChargePage.postMessage(null);
              }
            }
          },1500)
        }
      }
    })
  }
}

function payForMoney(payType) {
  var $actList = $('.payProWrapper .middle ul .active');

  var index = $actList.index();
  var nobleId = 7 - index;
  var isOpen = $actList.hasClass('openFee');
  var $payWeChatQuestion = $('.payWeChatQuestion');
  // if(nobleId >= 7 && payType == "alipay_wap" && isOpen){
  //   //支付宝超额条件
  //   $('.payAlipayQuestion .coinPayButton span').html(addComma(nobleArr[$actList.index()].openGold));
  //   $('.payAlipayQuestion').show();
  //   return
  // }
  if((payType == "alipay_wap" && nobleArr[index].openGold > 1000000 && isOpen)){
    $('.payAlipayQuestion .coinPayButton span').html(addComma(nobleArr[$actList.index()].openGold));
    $('.payAlipayQuestion').show();
    return;
  }
  if((payType == "alipay_wap" && nobleArr[index].renewGold > 1000000 && !isOpen)){
    $('.payAlipayQuestion .coinPayButton span').html(addComma(nobleArr[$actList.index()].renewGold));
    $('.payAlipayQuestion').show();
    return;
  }

  if((payType == "wx_wap") && nobleArr[index].openGold > 30000 && isOpen){
    $payWeChatQuestion.find('.alipayButton span').html(formatPrice(nobleArr[$actList.index()].openGold/10));
    $payWeChatQuestion.find('.coinPayButton span').html(addComma(nobleArr[$actList.index()].openGold));
    $payWeChatQuestion.show();
    return;
  }
  if((payType == "wx_wap") && nobleArr[index].renewGold > 30000 && !isOpen){
    $payWeChatQuestion.find('.alipayButton span').html(formatPrice(nobleArr[$actList.index()].renewGold/10));
    $payWeChatQuestion.find('.coinPayButton span').html(addComma(nobleArr[$actList.index()].renewGold));
    $payWeChatQuestion.show();
    return;
  }
  // if(payType == "wx_wap"){
  //   // 只有续费侯爵或者开通/续费侯爵以下的的段位时微信支付才起效
  //   if(nobleId == 4 && isOpen){
  //     // 如果刚好是开通侯爵段位的临界
  //     $payWeChatQuestion.find('.alipayButton span').html(formatPrice(nobleArr[$actList.index()].openGold/10));
  //     $payWeChatQuestion.find('.coinPayButton span').html(addComma(nobleArr[$actList.index()].openGold));
  //     $payWeChatQuestion.show();
  //     return;
  //   }else if(nobleId > 4){
  //     if(nobleId >= 7 && isOpen){
  //       // 开通皇帝的临界条件
  //       $payWeChatQuestion.find('.alipayButton').hide();
  //       $payWeChatQuestion.find('.coinPayButton span').html(addComma(nobleArr[$actList.index()].openGold));
  //     }else{
  //       // 适用范围：  续费皇帝，开通/续费国王/，开通/续费公爵
  //       if(isOpen){
  //         $payWeChatQuestion.find('.alipayButton span').html(formatPrice(nobleArr[$actList.index()].openGold/10));
  //         $payWeChatQuestion.find('.coinPayButton span').html(addComma(nobleArr[$actList.index()].openGold));
  //       }else{
  //         $payWeChatQuestion.find('.alipayButton span').html(formatPrice(nobleArr[$actList.index()].renewGold/10));
  //         $payWeChatQuestion.find('.coinPayButton span').html(addComma(nobleArr[$actList.index()].renewGold));
  //       }
  //     }
  //     $payWeChatQuestion.show();
  //     return;
  //   }
  // }

  $('#loading').show();
  if(isOpen){
    payForMoneyWay('/noble/pay/open/bymoney');
  }else{
    console.log('续费进入');
    payForMoneyWay('/noble/pay/renew/bymoney');
  }

  function payForMoneyWay(url) {
    // isPay = true;
    $.ajax({
      url:prefix + url,
      type: "get",
      dataType: 'json',
      data:{
        uid: info.uid,
        nobleId: nobleId,
        clientIp: 0,
        payChannel: payType,
        successUrl: successUrl,
        roomUid: info.roomUid,
        ticket: info.ticket
      },
      success:function (res) {
        $('#loading').hide();
        // isPay = false;
        if(res.code == 200){
          pingpp.createPayment(res.data, function(result, err){
            console.log(result);
            console.log(err.msg);
            console.log(err.extra);
            if (result == "success") {
              // 只有微信公众号 (wx_pub)、QQ 公众号 (qpay_pub)支付成功的结果会在这里返回，其他的支付结果都会跳转到 extra 中对应的 URL
            } else if (result == "fail") {
              // Charge 不正确或者微信公众号 / QQ公众号支付失败时会在此处返回
            } else if (result == "cancel") {
              // 微信公众号支付取消支付
            }
          });
        }
      }
    })
  }
}

function payForIos() {
  // 苹果内购专用

  var $actList = $('.payProWrapper .middle ul .active');
  var nobleId = 7 - ($actList.index());
  // var isOpen = $actList.hasClass('openFee');
  var nobleOptType = $actList.hasClass('openFee')?1:2;

  if(nobleId >= 5 && info.loadingStatus == '1'){
    $('.copySucess').html('暂未开放，尽请期待');
    $('.copySucess').show();
    setTimeout(function () {
      $('.copySucess').hide();
    },1000);
    return;
  }
  $('#loading').show();

  var obj = {
    nobleId: nobleId,
    nobleOptType: nobleOptType,
    iosNobleId: exchangeIosNobleId(nobleId)
  };
  window.webkit.messageHandlers.orderNoble.postMessage(obj);
}
function exchangeIosNobleId(nobleId) {
  var iosNobleId = '';
  switch (nobleId){
    case 1:
      iosNobleId = 'com.wujie.tuplay.iap.noble.01';
      break;
    case 2:
      iosNobleId = 'com.tongdaxing.erban.noble.iap.2';
      break;
    case 3:
      iosNobleId = 'com.tongdaxing.erban.noble.iap.3';
      break;
    case 4:
      iosNobleId = 'com.tongdaxing.erban.noble.iap.4';
      break;
  }
  return iosNobleId;
}

$('.paySuccess').on('click',function (e) {
  $(this).hide();
})
$('.paySuccess .win').on('click',function (e) {
  if($(e.target).hasClass('iconClose')){
    $(this).parent().hide();
  }
  e.stopPropagation();
})
$('.payAlipayQuestion').on('click',function (e) {
  $(this).hide();
})
$('.payAlipayQuestion .win').on('click',function (e) {
  if($(e.target).hasClass('iconClose')){
    $(this).parent().hide();
  }
  if($(e.target).hasClass('coinPayButton')){
    payForCoin();
    $(this).parent().hide();
  }
  e.stopPropagation();
})
$('.payWeChatQuestion').on('click',function (e) {
  $(this).hide();
})
$('.payWeChatQuestion .win').on('click',function (e) {
  if($(e.target).hasClass('iconClose')){
    $(this).parent().hide();
  }
  if($(e.target).hasClass('coinPayButton')){
    payForCoin();
    $(this).parent().hide();
  }
  if($(e.target).hasClass('alipayButton')){
    payForMoney('alipay_wap');
    $(this).parent().hide();
  }
  e.stopPropagation();
})
$('.payEnsure').on('click',function () {
  $(this).hide();
})
$('.payEnsure .win').on('click',function (e) {
  if($(e.target).hasClass('iconClose') || $(e.target).hasClass('cancel')){
    $(this).parent().hide();
  }
  // if($(e.target).hasClass('sure')){
  //   $(this).parent().hide();
  //
  // }
  e.stopPropagation();
})
$('.payEnsure .win .sure').on('click',function () {
  $('.payEnsure').hide();
  var payWay = $('.payWayWrapper .middle .active').index();
  switch (payWay){
    case 0:
      payForCoin();
      break;
    case 1:
      payForMoney("alipay_wap");
      break;
    case 2:
      payForMoney("wx_wap");
      break;
    case 3:
      payForIos();
  }
})

function addComma(num) {
  if(num < 15000) {
    return num;
  }
  var res = (num+"").split('').reverse().join('').replace(/(\d{3})\B/g,'$1,').split('').reverse().join('');
  return res;
}
function formatPrice(num) {
  if(num < 15000){
    return num;
  }
  var res = (num/10000) + '万';
  return res;
}
function getTodayDate() {
  var date = new Date();
  return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
}

function shareInfo() {}
function showTitleRightNoticeFuck() {
  
}
function getMessage(key,value){
  info[key] = value;
}
// function refreshWeb() {
//   if(EnvCheck() == 'test'){
//     window.location.href = 'http://apibeta.kawayisound.xyz/modules/noble/order.html';
//   }else{
//     window.location.href = 'https://www.erbanyy.com/modules/noble/order.html';
//   }
// }
function showCopySuccess() {
  $('.copySucess').show();
  setTimeout(function () {
    $('.copySucess').hide();
  },800)
}
