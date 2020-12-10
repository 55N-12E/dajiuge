var info = {};
var locateObj = getQueryString();
var api = locateJudge();
var autoLb = false; //autoLb=true为开启自动轮播
var autoLbtime = 1; //autoLbtime为轮播间隔时间（单位秒）
var touch = false; //touch=true为开启触摸滑动
var slideBt = true; //slideBt=true为开启滚动按钮
var slideNub; //轮播图片数量
var nobleArr = [];
var env = EnvCheck();
if (EnvCheck() == 'test') {
  var vConsole = new VConsole();
}
$(function () {
  var noblePower = [];
  var browser = checkVersion();
  var nobleUser = {};
  if (browser.app) {
    if (browser.ios) {
      info.uid = tools.cookieUtils.get("uid");
      window.webkit.messageHandlers.getUid.postMessage(null);
      window.webkit.messageHandlers.getTicket.postMessage(null);
      info.loadingStatus = '1';
    } else if (browser.android) {
      if (androidJsObj && typeof androidJsObj === 'object') {
        info.uid = parseInt(window.androidJsObj.getUid());
        info.ticket = window.androidJsObj.getTicket();
        info.loadingStatus = '0';
      }
    }
  } else {
    info.uid = 923914;
    info.loadingStatus = '0';
  }

  setTimeout(function () {
    $(".slide .img ").show()
    getNobleMsg();
  }, 150)

  var index = '';
  var ajaxUser = $.ajax({
    url: api + '/noble/users/get',
    type: 'get',
    dataType: 'json',
    data: {
      uid: info.uid,
      ticket: info.ticket
    },
    success: function (res) {
      if (res.code == 200) {
        showTable();
        var nobleId = res.data.nobleId;
        if (parseInt(locateObj.nobleId)) {
          getBgcolor(parseInt(locateObj.nobleId))
        } else(
          getBgcolor(nobleId)
        )
      } else if (res.code == 404) {
        var nobleId = 0;
        if (parseInt(locateObj.nobleId)) {
          getBgcolor(parseInt(locateObj.nobleId))
        } else(
          getBgcolor(nobleId)
        )
      }
    }
  })

  function getBgcolor(nobleId) {
    if (nobleId == 7) {
      left();
      left();
      left();
    } else if (nobleId == 1) {
      left();
      left();
    } else if (nobleId == 2) {
      left();
    } else if (nobleId == 4) {
      right();
    } else if (nobleId == 5) {
      right();
      right();
    } else if (nobleId == 6) {
      right();
      right();
      right();
    } else if (nobleId == 0) {
      left();
      left();
    }
  }




  function getNobleMsg() {
    var $openWin = $('.open-win');
    // 审核专用
    if (info.loadingStatus == '1') {
      $('.nav div ').eq(0).show();
      $('.nav div ').eq(0).siblings('div').hide();
      $('.slide .img').eq(0).siblings('.img').hide().addClass("img3").removeClass("img1").off('click');
      $openWin.find('.present').hide();
      $openWin.find('.renewReturn').hide();
      $(".top-msk").show();
    } else {
      $('.nav div ').show();
    }
    var ajaxList = $.ajax({
      url: api + '/noble/right/list',
      type: 'get',
      dataType: 'json',
      success: function (res) {
        if (res.code == 200) {
          nobleArr = res.data;
          renderPowerList(nobleArr[0]);
          if (info.loadingStatus == '1') {
            nobleArr = switchNobleArr(res.data);
          } else {
            nobleArr = res.data;
            renderPowerList(index, nobleArr);
          }
        }
      }
    })

    $.when(ajaxList, ajaxUser).done(function (ajax1, ajax2) {
      var nobleUserData = ajax2[0];
      nobleUser = nobleUserData.data;
      touchPin(nobleUser)

      if (parseInt(locateObj.nobleId)) {
        renderPowerList(nobleArr[locateObj.nobleId - 1]);
        $('.open-win .open').show();
        renderButtonText(locateObj.nobleId - 1);
      } else {
        if (nobleUserData.code == 200) {
          var nobleId = nobleUserData.data.nobleId;
          renderPowerList(nobleArr[nobleId - 1]);
          if (!browser.ios) {
            $('.open-win .con').show();
          }
          renderButtonText(nobleId - 1);
        } else if (nobleUserData.code == 404) {
          renderPowerList(nobleArr[0]);
          $('.open-win .open').show();
          renderButtonText(0);
        }
      }
      $('.open-win').css('display', 'flex');
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
    for (var i = 0; i < noblePower.length; i++) {
      if (noblePower[i]) {
        $li.eq(i).addClass('active');
      } else {
        $li.eq(i).removeClass('active');
      }
    }

    $('.noble-wrapper').attr('class', 'noble-wrapper noble-' + obj.id);
    $('.noble-title .title span').html(obj.name);
  }

  $('.container .nav div').on('click', function () {

    var index = $(this).index();
    isguizu(index, nobleUser)


  })
  $('.slide .img').on('click', function () {
    var index = $(this).index();
    isguizu(index, nobleUser)
  })
  $('.open-win .open').on('click', function () {
    // if(browser.ios && browser.loadingStatus){
    //   // 1审核中，0未审核
    //   $('.toast').html('该功能还在开发中');
    //   $('.toast').show();
    //   setTimeout(function () {
    //     $('.toast').hide();
    //   },1200);
    //   return;
    // }
    var index = $(".nav div .add").parent("div").index() + 1;
    var str = '?nobleIndex=' + index;
    window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html' + str;
    if (env == 'test') {
      // window.location.href = 'http://apibeta.kawayisound.xyz/modules/nobles/order.html' + str;
      if (locateObj.platform == "planet") {
        window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html' + str + '&platform=planet';
      } else {
        window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html' + str;
      }
    } else {
      // window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html' + str;
      if (locateObj.platform == "planet") {
        window.location.href = 'https://prod.api.99date.hudongco.com/nobles/order.html' + str + '&platform=planet';
      } else {
        window.location.href = 'https://prod.api.99date.hudongco.com/modules/nobles/order.html' + str;
      }
    }
  });
  $('.open-win .con').on('click', function () {
    // if(browser.ios && browser.loadingStatus){
    //   // 1审核中，0未审核
    //   $('.toast').html('该功能还在开发中');
    //   $('.toast').show();
    //   setTimeout(function () {
    //     $('.toast').hide();
    //   },1200);
    //   return;
    // }
    if (env == 'test') {
      // window.location.href = 'http://apibeta.kawayisound.xyz/modules/nobles/order.html';
      if (locateObj.platform == "planet") {
        window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html?platform=planet';
      } else {
        window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html';
      }
    } else {
      // hello处cp
      // hello处cp的代码
      if (locateObj.platform == "planet") {
        window.location.href = 'https://prod.api.99date.hudongco.com/modules/nobles/order.html?platform=planet';
      } else {
        window.location.href = 'https://prod.api.99date.hudongco.com/modules/nobles/order.html';
      }
     
    }
  });

  //initNav(showTitleRightNoticeFuck());
  $(window).resize(function () {
    $(".slide").height($(".slide").width() * 0.56);
  });

  $(".slide").height($(".slide").width() * 0.56);
  slideNub = $(".slide .img").size(); //获取轮播图片数量
  for (i = 0; i < slideNub; i++) {
    $(".slide .img:eq(" + i + ")").attr("data-slide-imgId", i);
  }

  //根据轮播图片数量设定图片位置对应的class
  if (slideNub == 1) {
    for (i = 0; i < slideNub; i++) {
      $(".slide .img:eq(" + i + ")").addClass("img3");
    }
  }
  if (slideNub == 2) {
    for (i = 0; i < slideNub; i++) {
      $(".slide .img:eq(" + i + ")").addClass("img" + i);
    }
  }
  if (slideNub == 3) {
    for (i = 0; i < slideNub; i++) {
      $(".slide .img:eq(" + i + ")").addClass("img" + i);
    }
  }
  if (slideNub > 3 && slideNub < 6) {
    for (i = 0; i < slideNub; i++) {
      $(".slide .img:eq(" + i + ")").addClass("img" + i);
    }
  }
  if (slideNub >= 6) {
    for (i = 0; i < slideNub; i++) {
      if (i < 5) {
        $(".slide .img:eq(" + i + ")").addClass("img" + (i + 1));
      } else {
        $(".slide .img:eq(" + i + ")").addClass("img5");
      }
    }
  }
  //自动轮播
  // if (autoLb) {
  //   setInterval(function () {
  //     right();
  //   }, autoLbtime * 1000);
  // }
  slideLi();
  imgClickFy();
  //轮播图片左右图片点击翻页

});

function switchNobleArr(nobleArr) {
  var arr = [73, 588, 1998, 6498];
  for (var i = 0; i < 3; i++) {
    nobleArr[i].openGold = arr[i] * 10;
    nobleArr[i].renewGold = arr[i] * 10;
    nobleArr[i].openReturn = 0;
    nobleArr[i].renewReturn = 0;
  }
  return nobleArr;
}

function imgClickFy() {
  var index = $("#slide .img3").index();
  $(".nav div span")
    .eq(index)
    .addClass(" add").parent("div")
    .siblings().find("span")
    .removeClass(" add");
  showTable(index)
  $(".slide .img").removeAttr("onclick");
  $(".slide .img2").attr("onclick", "left()");
  $(".slide .img4").attr("onclick", "right()");
}

function getMessage(key, value) {
  info[key] = value;
}

function formatPrice(num) {
  if (num < 10000) {
    return num;
  }
  var res = (num / 10000) + '万';
  return res;
}

function shareInfo() {}

function showTitleRightNoticeFuck() {
  var linkUrl = '';
  if (EnvCheck() == 'test') {
    linkUrl = 'https://api.99date.hudongco.com/modules/nobles/faq.html';
  } else {
    linkUrl = 'https://api.99date.hudongco.com/modules/nobles/faq.html';
  }
  var obj = {
    type: 1,
    data: {
      msg: 'wewawa',
      title: '规则说明',
      link: linkUrl
    }
  }
  return obj;
}
console.log("tes");
//跳转贵族特权页面
$('.open-win .question').on('click', function () {
  if (env == 'test') {
    window.location.href = 'http://apibeta.kawayisound.xyz/modules/nobles/faq.html';
  } else {
    // window.location.href = 'https://www.erbanyy.com/modules/noble/faq.html';
    window.location.href = 'https://api.99date.hudongco.com/modules/nobles/faq.html';
  }
})
//判断贵族特权
function showTable(index) {
  if (index == 1) {
    $(".privilege-4-ccc,.privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc")
      .show().siblings("img").hide();
    $(".privilege-1,.privilege-2").show().siblings("img").hide().siblings("div").removeClass('textccc');
  } else if (index == 2) {
    $(".privilege-4-ccc,.privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc")
      .show()
      .siblings("img")
      .hide().siblings("div").addClass('textccc');
    $(".privilege-1,.privilege-2")
      .show()
      .siblings("img")
      .hide().siblings("div").removeClass('textccc');
  } else if (index == 3) {
    $(".privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc")
      .show()
      .siblings("img")
      .hide().siblings("div").addClass('textccc');
    $(".privilege-1,.privilege-2,.privilege-4")
      .show()
      .siblings("img")
      .hide().siblings("div").removeClass('textccc');
  } else if (index == 4) {
    $(".privilege-6-ccc,.privilege-7-ccc")
      .show()
      .siblings("img")
      .hide().siblings("div").addClass('textccc');
    $(".privilege-1,.privilege-2,.privilege-4,.privilege-5")
      .show()
      .siblings("img")
      .hide().siblings("div").removeClass('textccc');
  } else if (index == 5) {
    $(".privilege-7-ccc")
      .show()
      .siblings("img")
      .hide().siblings("div").addClass('textccc');
    $(".privilege-1,.privilege-2,.privilege-4,.privilege-5,.privilege-6")
      .show()
      .siblings("img")
      .hide().siblings("div").removeClass('textccc');
  } else if (index == 6) {
    $(
        ".privilege-1-ccc,.privilege-2-ccc,.privilege-4-ccc,.privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc"
      )
      .hide()
      .siblings("img")
      .show().siblings("div").removeClass('textccc');
    $(
        ".privilege-1,.privilege-2,.privilege-4,.privilege-5.privilege-6,.privilege-7"
      )
      .show()
      .siblings("img")
      .hide();
  } else {
    $(
        ".privilege-2-ccc,.privilege-4-ccc,.privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc"
      )
      .show()
      .siblings("img")
      .hide().siblings("div").addClass('textccc');
    $(".privilege-1")
      .show()
      .siblings("img")
      .hide();
  }
}
//右滑动
function right() {
  var index = $("#slide .img3").index();
  var fy = new Array();
  for (i = 0; i < slideNub; i++) {
    fy[i] = $(".slide .img[data-slide-imgId=" + i + "]").attr("class");
  }
  for (i = 0; i < slideNub; i++) {
    if (i == 0) {
      $(".slide .img[data-slide-imgId=" + i + "]").attr(
        "class",
        fy[slideNub - 1]
      );
    } else {
      $(".slide .img[data-slide-imgId=" + i + "]").attr(
        "class",
        fy[i - 1]
      );
    }
  }
  imgClickFy();
  // renderButtonText(index)
  slideLi();
}

//左滑动
function left(nobleUser) {
  var index = $("#slide .img3").index();
  var fy = new Array();

  for (i = 0; i < slideNub; i++) {
    fy[i] = $(".slide .img[data-slide-imgId=" + i + "]").attr("class");
  }
  for (i = 0; i < slideNub; i++) {
    if (i == slideNub - 1) {
      $(".slide .img[data-slide-imgId=" + i + "]").attr("class", fy[0]);
    } else {
      $(".slide .img[data-slide-imgId=" + i + "]").attr(
        "class",
        fy[i + 1]
      );
    }
  }
  imgClickFy();
  slideLi();
  // renderButtonText(index)
}

function renderButtonText(nobleId) {
  var nobleMsg = nobleArr[nobleId];
  var $openWin = $('.open-win');
  $openWin.find('.price span').html(formatPrice(nobleMsg.openGold / 10));
  $openWin.find('.present span').html(formatPrice(nobleMsg.openReturn) + '贵族金币');
  $openWin.find('.renew span').html(formatPrice(nobleMsg.renewGold / 10));
  $openWin.find('.renewReturn span').html(formatPrice(nobleMsg.renewReturn));
}

//修改当前最中间图片对应按钮选中状态

function slideLi() {
  var slideList =
    parseInt($(".slide .img2").attr("data-slide-imgId")) + 1;
}

//轮播按钮点击翻页
//轮播按钮点击翻页
function tz(id) {
  var tzcs = id - (parseInt($(".slide .img3").attr("data-slide-imgId")) + 1) || 1;
  if (tzcs > 0) {
    for (i = 0; i < tzcs; i++) {
      setTimeout(function () {
        right();
      }, 1);
    }
  }
  if (tzcs < 0) {
    tzcs = -tzcs;
    for (i = 0; i < tzcs; i++) {
      setTimeout(function () {
        left();
      }, 1);
    }
  }
  slideLi();
}

//触摸滑动模块
function k_touch(nobleUser) {
  var _start = 0,
    _end = 0,
    _content = document.getElementById("slide");
  _content.addEventListener("touchstart", touchStart, false);
  _content.addEventListener("touchmove", touchMove, false);
  _content.addEventListener("touchend", touchEnd, false);

  function touchStart(event) {
    var touch = event.targetTouches[0];
    _start = touch.pageX;
  }

  function touchMove(event) {
    var touch = event.targetTouches[0];
    _end = _start - touch.pageX;
  }
  //判断滑动事件 index重新赋值
  function touchEnd(event) {
    if (_end < -30) {
      var index = $('.slide .img3').index() - 1
      if (index < 0) {
        index = 6
        isguizu(index)
      }
      left();
      isguizu(index, nobleUser)
      _end = 0;
    } else if (_end > 30) {
      var index = $('.slide .img3').index() + 1
      if (index == 7) {
        index = 0
      }
      right();
      isguizu(index, nobleUser)
      _end = 0;
    }
  }
}
// 屏幕是否滑动
function touchPin(nobleUser) {
  if (touch) {
    k_touch(nobleUser);
  }
}

function isguizu(index, nobleUser) {
  var $openWin = $('.open-win');
  var $notOpenWin = $('.notOpen-win');
  if (!$.isEmptyObject(nobleUser)) {
    // 是贵族
    if (nobleUser.nobleId - 1 > index) {
      // 点击比当前贵族低的档次
      $notOpenWin.find('.cur').html(nobleUser.nobleName);
      $notOpenWin.find('.next').html(nobleArr[index].name);
      $openWin.hide();
      $notOpenWin.show();
    } else if (nobleUser.nobleId - 1 < index) {
      // 点击比当前贵族高的档次
      renderButtonText(index);
      $openWin.find('.open').html('升级').addClass('shengji').show();
      $openWin.find('.con').hide();
      $openWin.css('display', 'flex');
      $notOpenWin.hide();
    } else {
      // 点击贵族与当前贵族一样
      renderButtonText(index);
      $openWin.find('.con').show();
      $openWin.find('.open').hide();
      $openWin.css('display', 'flex');
      $notOpenWin.hide();
    }
  } else {
    // 不是贵族
    renderButtonText(index);
    $openWin.find('.open').show();
    $openWin.find('.con').hide();
    $openWin.css('display', 'flex');
    $notOpenWin.hide();
  }
}
