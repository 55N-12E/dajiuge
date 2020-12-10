if(EnvCheck() == 'test'){
  if(locateJudge().match(/preview/)){
    window.location.replace("https://preview.api.99date.hudongco.com/modules/nobles/homepage.html")
  }else{
    window.location.replace("https://api.99date.hudongco.com/modules/nobles/homepage.html")
  }
}else{
  window.location.replace("https://prod.api.99date.hudongco.com/modules/nobles/homepage.html")
}

var info = {}
var locateObj = getQueryString()
var api = locateJudge()
var browser = checkVersion()
var autoLb = false //autoLb=true为开启自动轮播
var autoLbtime = 1 //autoLbtime为轮播间隔时间（单位秒）
var touch = false //touch=true为开启触摸滑动
var slideBt = true //slideBt=true为开启滚动按钮
var slideNub //轮播图片数量
var nobleArr = []
var nobilityId = 0
var swIndex = 0
var env = EnvCheck()
if (EnvCheck() == "test") {
  var vConsole = new VConsole()
}
if (locateObj.nobleId) {
  swIndex = locateObj.nobleId - 1
}

showTable(0)
$(function () {
  var noblePower = []
  var nobleUser = {}
  if (browser.app) {
    if (browser.ios) {
      info.uid = tools.cookieUtils.get("uid")
      window.webkit.messageHandlers.getUid.postMessage(null)
      window.webkit.messageHandlers.getTicket.postMessage(null)
      info.loadingStatus = "1"
      
      for(var i=0; i<5; i++){
        $(".swiper-slide").eq(2).remove();
      }
      // swiper 配置项
      var mySwiper = new Swiper(".swiper-container", {
        initialSlide: swIndex,
        effect: "coverflow",
        slidesPerView: 3,
        centeredSlides: true,
        coverflow: {
          rotate: 0,
          stretch: -10,
          depth: 85,
          modifier: 4,
          slideShadows: false
        },
        onTransitionEnd: function (swiper) {
          // console.log(swiper.activeIndex)
          nobilityId = swiper.activeIndex
          showTable(swiper.activeIndex)
          renderButtonText(swiper.activeIndex)
        }
      })

      for(var i=5; i<$(".privilege-list ul li").length; i++){
        $(".privilege-list ul li").eq(i).hide();
      }
    } else if (browser.android) {
      if (androidJsObj && typeof androidJsObj === "object") {
        info.uid = parseInt(window.androidJsObj.getUid())
        info.ticket = window.androidJsObj.getTicket()
        info.loadingStatus = "0"
        
        // swiper 配置项
        var mySwiper = new Swiper(".swiper-container", {
          initialSlide: swIndex,
          effect: "coverflow",
          slidesPerView: 3,
          centeredSlides: true,
          coverflow: {
            rotate: 0,
            stretch: -10,
            depth: 85,
            modifier: 4,
            slideShadows: false
          },
          onTransitionEnd: function (swiper) {
            // console.log(swiper.activeIndex)
            nobilityId = swiper.activeIndex
            showTable(swiper.activeIndex)
            renderButtonText(swiper.activeIndex)
          }
        })
      }
    }
  } else {
    info.uid = 924133
    info.loadingStatus = "1"

    for(var i=0; i<5; i++){
      $(".swiper-slide").eq(2).remove();
    }
    for(var i=5; i<$(".privilege-list ul li").length; i++){
      $(".privilege-list ul li").eq(i).hide();
    }
    // swiper 配置项
    var mySwiper = new Swiper(".swiper-container", {
      initialSlide: swIndex,
      effect: "coverflow",
      slidesPerView: 3,
      centeredSlides: true,
      coverflow: {
        rotate: 0,
        stretch: -10,
        depth: 85,
        modifier: 4,
        slideShadows: false
      },
      onTransitionEnd: function (swiper) {
        // console.log(swiper.activeIndex)
        nobilityId = swiper.activeIndex
        showTable(swiper.activeIndex)
        renderButtonText(swiper.activeIndex)
      }
    })
  }

  setTimeout(function () {
    $(".slide .img ").show()
    getNobleMsg()
  }, 150)

  var index = ""
  var ajaxUser = $.ajax({
    url: api + "/noble/users/get",
    type: "get",
    dataType: "json",
    data: {
      uid: info.uid,
      ticket: info.ticket
    },
    success: function (res) {
      if (res.code == 200) {
        // showTable()
        var nobleId = res.data.nobleId
        if (parseInt(locateObj.nobleId)) {
          getBgcolor(parseInt(locateObj.nobleId))
        } else getBgcolor(nobleId)
      } else if (res.code == 404) {
        var nobleId = 0
        if (parseInt(locateObj.nobleId)) {
          getBgcolor(parseInt(locateObj.nobleId))
        } else getBgcolor(nobleId)
      }
    }
  })

  function getBgcolor(nobleId) {
    //   if (nobleId == 7) {
    //     left()
    //     left()
    //     left()
    //   } else if (nobleId == 1) {
    //     left()
    //     left()
    //   } else if (nobleId == 2) {
    //     left()
    //   } else if (nobleId == 4) {
    //     right()
    //   } else if (nobleId == 5) {
    //     right()
    //     right()
    //   } else if (nobleId == 6) {
    //     right()
    //     right()
    //     right()
    //   } else if (nobleId == 0) {
    //     left()
    //     left()
    //   }
  }

  function getNobleMsg() {
    var $openWin = $(".open-win")
    // 审核专用
    if (info.loadingStatus == "1") {
      $(".nav div ").eq(0).show()
      $(".nav div ").eq(0).siblings("div").hide()
      $(".slide .img").eq(0).siblings(".img").hide().addClass("img3").removeClass("img1").off("click")
      $openWin.find(".present").hide()
      $openWin.find(".renewReturn").hide()
      $(".top-msk").show()
    } else {
      $(".nav div ").show()
    }
    var ajaxList = $.ajax({
      url: api + "/noble/right/list",
      type: "get",
      dataType: "json",
      success: function (res) {
        if (res.code == 200) {
          console.log(res)
          nobleArr = res.data
          renderPowerList(nobleArr[0])
          if (info.loadingStatus == "1") {
            nobleArr = res.data
          } else {
            nobleArr = res.data
            renderPowerList(index, nobleArr)
          }
        }
      }
    })

    $.when(ajaxList, ajaxUser).done(function (ajax1, ajax2) {
      var nobleUserData = ajax2[0]
      nobleUser = nobleUserData.data
      // touchPin(nobleUser)

      if (parseInt(locateObj.nobleId)) {
        renderPowerList(nobleArr[locateObj.nobleId - 1])
        $(".open-win .open").show()
        renderButtonText(locateObj.nobleId - 1)
      } else {
        if (nobleUserData.code == 200) {
          var nobleId = nobleUserData.data.nobleId
          renderPowerList(nobleArr[nobleId - 1])
          if (!browser.ios) {
            $(".open-win .con").show()
          }
          renderButtonText(nobleId - 1)
        } else if (nobleUserData.code == 404) {
          renderPowerList(nobleArr[0])
          $(".open-win .open").show()
          renderButtonText(0)
        }
      }
      $(".open-win").css("display", "flex")
    })
  }

  function renderPowerList(obj) {
    noblePower = []
    noblePower.push(obj.userPage)
    noblePower.push(obj.userMedal)
    noblePower.push(obj.nobleGift)
    noblePower.push(obj.specialFace)
    noblePower.push(obj.enterNotice)
    noblePower.push(obj.roomBackground)
    noblePower.push(obj.micDecorate)
    noblePower.push(obj.chatBubble)
    noblePower.push(obj.micHalo)
    noblePower.push(obj.enterHide)
    noblePower.push(obj.rankHide)
    noblePower.push(obj.specialService)
    noblePower.push(obj.goodNum)
    noblePower.push(obj.recomRoom)
    noblePower.push(obj.prevent)

    // var $li = $(".privilege-list li")
    // for (var i = 0; i < noblePower.length; i++) {
    //   if (noblePower[i]) {
    //     $li.eq(i).addClass("active")
    //   } else {
    //     $li.eq(i).removeClass("active")
    //   }
    // }

    $(".noble-wrapper").attr("class", "noble-wrapper noble-" + obj.id)
    $(".noble-title .title span").html(obj.name)
  }

  $(".container .nav div").on("click", function () {
    var index = $(this).index()
    isguizu(index, nobleUser)
  })
  $(".slide .img").on("click", function () {
    var index = $(this).index()
    isguizu(index, nobleUser)
  })
  $(".open-win .open").on("click", function () {
    // if(browser.ios && browser.loadingStatus){
    //   // 1审核中，0未审核
    //   $('.toast').html('该功能还在开发中');
    //   $('.toast').show();
    //   setTimeout(function () {
    //     $('.toast').hide();
    //   },1200);
    //   return;
    // }
    // window.location.href ='https://api.99date.hudongco.com/modules/nobles/order.html'
    var index = nobilityId + 1
    if (index === 7) {
      return
    }
    var str = "?nobleIndex=" + index
    
    if (env == "test") {
      // window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html' + str;
      if (locateObj.platform == "planet") {
        window.location.href = "https://api.99date.hudongco.com/modules/nobles/order.html" + str + "&platform=planet"
      } else {
        window.location.href = "https://api.99date.hudongco.com/modules/nobles/order.html" + str
      }
    } else {
      // window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html' + str;
      if (locateObj.platform == "planet") {
        window.location.href = "https://prod.api.99date.hudongco.com/modules/nobles/order.html" + str + "&platform=planet"
      } else {
        window.location.href = "https://prod.api.99date.hudongco.com/modules/nobles/order.html" + str
      }
    }
  })
  $(".open-win .con").on("click", function () {
    // if(browser.ios && browser.loadingStatus){
    //   // 1审核中，0未审核
    //   $('.toast').html('该功能还在开发中');
    //   $('.toast').show();
    //   setTimeout(function () {
    //     $('.toast').hide();
    //   },1200);
    //   return;
    // }
    if (env == "test") {
      // window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html';
      if (locateObj.platform == "planet") {
        window.location.href =
          "https://api.99date.hudongco.com/modules/nobles/order.html?platform=planet"
      } else {
        window.location.href =
          "https://api.99date.hudongco.com/modules/nobles/order.html"
      }
    } else {
      if (locateObj.platform == "planet") {
        window.location.href =
          "https://prod.api.99date.hudongco.com/modules/nobles/order.html?platform=planet"
      } else {
        window.location.href =
          "https://prod.api.99date.hudongco.com/modules/nobles/order.html"
      }
    }
  })

  //initNav(showTitleRightNoticeFuck());
  // $(window).resize(function() {
  //   $(".slide").height($(".slide").width() * 0.56)
  // })

  // $(".slide").height($(".slide").width() * 0.56)
  // slideNub = $(".slide .img").size() //获取轮播图片数量
  // for (i = 0; i < slideNub; i++) {
  //   $(".slide .img:eq(" + i + ")").attr("data-slide-imgId", i)
  // }

  //根据轮播图片数量设定图片位置对应的class
  // if (slideNub == 1) {
  //   for (i = 0; i < slideNub; i++) {
  //     $(".slide .img:eq(" + i + ")").addClass("img3")
  //   }
  // }
  // if (slideNub == 2) {
  //   for (i = 0; i < slideNub; i++) {
  //     $(".slide .img:eq(" + i + ")").addClass("img" + i)
  //   }
  // }
  // if (slideNub == 3) {
  //   for (i = 0; i < slideNub; i++) {
  //     $(".slide .img:eq(" + i + ")").addClass("img" + i)
  //   }
  // }
  // if (slideNub > 3 && slideNub < 6) {
  //   for (i = 0; i < slideNub; i++) {
  //     $(".slide .img:eq(" + i + ")").addClass("img" + i)
  //   }
  // }
  // if (slideNub >= 6) {
  //   for (i = 0; i < slideNub; i++) {
  //     if (i < 5) {
  //       $(".slide .img:eq(" + i + ")").addClass("img" + (i + 1))
  //     } else {
  //       $(".slide .img:eq(" + i + ")").addClass("img5")
  //     }
  //   }
  // }
  //自动轮播
  // if (autoLb) {
  //   setInterval(function () {
  //     right();
  //   }, autoLbtime * 1000);
  // }
  // slideLi()
  // imgClickFy()
  //轮播图片左右图片点击翻页
})

// function switchNobleArr(nobleArr) {
//   var arr = [73, 588, 1998, 6498]
//   for (var i = 0; i < 3; i++) {
//     nobleArr[i].openGold = arr[i] * 10
//     nobleArr[i].renewGold = arr[i] * 10
//     nobleArr[i].openReturn = 0
//     nobleArr[i].renewReturn = 0
//   }
//   return nobleArr
// }

// function imgClickFy() {
//   var index = $("#slide .img3").index()
//   // $(".nav div span")
//   //   .eq(index)
//   //   .addClass(" add")
//   //   .parent("div")
//   //   .siblings()
//   //   .find("span")
//   //   .removeClass(" add")
//   // showTable(index)
//   // $(".slide .img").removeAttr("onclick")
//   // $(".slide .img2").attr("onclick", "left()")
//   // $(".slide .img4").attr("onclick", "right()")
// }

function getMessage(key, value) {
  info[key] = value
}

function formatPrice(num) {
  if (num < 10000) {
    return num
  }
  var res = num / 10000 + "万"
  return res
}

function shareInfo() {}

function showTitleRightNoticeFuck() {
  var linkUrl = ""
  if (EnvCheck() == "test") {
    linkUrl = "https://api.99date.hudongco.com/modules/nobles/faq.html"
  } else {
    linkUrl = "https://prod.api.99date.hudongco.com/modules/nobles/faq.html"
  }
  var obj = {
    type: 1,
    data: {
      msg: "wewawa",
      title: "规则说明",
      link: linkUrl
    }
  }
  return obj
}
console.log("tes")
//跳转贵族特权页面
// $(".open-win .question").on("click", function() {
//   if (env == "test") {
//     window.location.href =
//       "https://api.99date.hudongco.com/modules/nobles/faq.html"
//   } else {
//     // window.location.href = 'https://www.erbanyy.com/modules/noble/faq.html';
//     window.location.href = "https://api.99date.hudongco.com/modules/nobles/faq.html"
//   }
// })
//判断贵族特权
function showTable(index) {
  var priArray1 = $(".privilege")
  console.log(index)
  if (index === 0) {
    for (var i = 0; i <= priArray1.length; i++) {
      priArray1.show().siblings("img").hide()
    }
  } else {
    priArray1.each(function (i) {
      if (2 < i && i < 5) {
        $(this).hide().siblings("img").show()
        $(priArray1[5]).show().siblings("img").hide()
        $(priArray1[6]).show().siblings("img").hide()
        $(priArray1[7]).show().siblings("img").hide()
        $(priArray1[8]).show().siblings("img").hide()
        $(priArray1[9]).show().siblings("img").hide()
        $(priArray1[10]).show().siblings("img").hide()
        $(priArray1[11]).show().siblings("img").hide()
        $(priArray1[12]).show().siblings("img").hide()
        $(priArray1[13]).show().siblings("img").hide()
      } else if (2 < i && i < 7 && index === 3) {
        $(this).hide().siblings("img").show()
        $(priArray1[8]).show().siblings("img").hide()
        $(priArray1[9]).show().siblings("img").hide()
        $(priArray1[10]).show().siblings("img").hide()
        $(priArray1[11]).show().siblings("img").hide()
        $(priArray1[12]).show().siblings("img").hide()
        $(priArray1[13]).show().siblings("img").hide()
      } else if (2 < i && i < 9 && index === 4) {
        $(this).hide().siblings("img").show()
        $(priArray1[10]).show().siblings("img").hide()
        $(priArray1[11]).show().siblings("img").hide()
        $(priArray1[12]).show().siblings("img").hide()
        $(priArray1[13]).show().siblings("img").hide()
      } else if (2 < i && i < 12 && index === 5) {
        $(this).hide().siblings("img").show()
        $(priArray1[12]).show().siblings("img").hide()
        $(priArray1[13]).show().siblings("img").hide()
      } else if (2 < i && index === 6) {
        $(this).hide().siblings("img").show()
      }
    })
  }
  // if(index == 0){
  //   $('.privilege-4-ccc,.privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc,.privilege-8-ccc,.privilege-9-ccc,.privilege-10-ccc')
  // }else if (index == 1) {
  //   $(".privilege-4-ccc,.privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc")
  //     .show()
  //     .siblings("img")
  //     .hide()
  //   $(".privilege-1,.privilege-2")
  //     .show()
  //     .siblings("img")
  //     .hide()
  //     .siblings("div")
  //     .removeClass("textccc")
  // } else if (index == 2) {
  //   $(".privilege-4-ccc,.privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc")
  //     .show()
  //     .siblings("img")
  //     .hide()
  //     .siblings("div")
  //     .addClass("textccc")
  //   $(".privilege-1,.privilege-2")
  //     .show()
  //     .siblings("img")
  //     .hide()
  //     .siblings("div")
  //     .removeClass("textccc")
  // } else if (index == 3) {
  //   $(".privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc")
  //     .show()
  //     .siblings("img")
  //     .hide()
  //     .siblings("div")
  //     .addClass("textccc")
  //   $(".privilege-1,.privilege-2,.privilege-4")
  //     .show()
  //     .siblings("img")
  //     .hide()
  //     .siblings("div")
  //     .removeClass("textccc")
  // } else if (index == 4) {
  //   $(".privilege-6-ccc,.privilege-7-ccc")
  //     .show()
  //     .siblings("img")
  //     .hide()
  //     .siblings("div")
  //     .addClass("textccc")
  //   $(".privilege-1,.privilege-2,.privilege-4,.privilege-5")
  //     .show()
  //     .siblings("img")
  //     .hide()
  //     .siblings("div")
  //     .removeClass("textccc")
  // } else if (index == 5) {
  //   $(".privilege-7-ccc")
  //     .show()
  //     .siblings("img")
  //     .hide()
  //     .siblings("div")
  //     .addClass("textccc")
  //   $(".privilege-1,.privilege-2,.privilege-4,.privilege-5,.privilege-6")
  //     .show()
  //     .siblings("img")
  //     .hide()
  //     .siblings("div")
  //     .removeClass("textccc")
  // } else if (index == 6) {
  //   $(
  //     ".privilege-1-ccc,.privilege-2-ccc,.privilege-4-ccc,.privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc"
  //   )
  //     .hide()
  //     .siblings("img")
  //     .show()
  //     .siblings("div")
  //     .removeClass("textccc")
  //   $(
  //     ".privilege-1,.privilege-2,.privilege-4,.privilege-5.privilege-6,.privilege-7"
  //   )
  //     .show()
  //     .siblings("img")
  //     .hide()
  // } else {
  //   $(
  //     ".privilege-2-ccc,.privilege-4-ccc,.privilege-5-ccc,.privilege-6-ccc,.privilege-7-ccc"
  //   )
  //     .show()
  //     .siblings("img")
  //     .hide()
  //     .siblings("div")
  //     .addClass("textccc")
  //   $(".privilege-1")
  //     .show()
  //     .siblings("img")
  //     .hide()
  // }
}
//右滑动
// function right() {
//   var index = $("#slide .img3").index()
//   var fy = new Array()
//   for (i = 0; i < slideNub; i++) {
//     fy[i] = $(".slide .img[data-slide-imgId=" + i + "]").attr("class")
//   }
//   for (i = 0; i < slideNub; i++) {
//     if (i == 0) {
//       $(".slide .img[data-slide-imgId=" + i + "]").attr(
//         "class",
//         fy[slideNub - 1]
//       )
//     } else {
//       $(".slide .img[data-slide-imgId=" + i + "]").attr("class", fy[i - 1])
//     }
//   }
//   imgClickFy()
//   // renderButtonText(index)
//   slideLi()
// }

// //左滑动
// function left(nobleUser) {
//   var index = $("#slide .img3").index()
//   var fy = new Array()

//   for (i = 0; i < slideNub; i++) {
//     fy[i] = $(".slide .img[data-slide-imgId=" + i + "]").attr("class")
//   }
//   for (i = 0; i < slideNub; i++) {
//     if (i == slideNub - 1) {
//       $(".slide .img[data-slide-imgId=" + i + "]").attr("class", fy[0])
//     } else {
//       $(".slide .img[data-slide-imgId=" + i + "]").attr("class", fy[i + 1])
//     }
//   }
//   imgClickFy()
//   slideLi()
//   // renderButtonText(index)
// }

function renderButtonText(nobleId) {
  var nobleMsg = nobleArr[nobleId]
  // console.log(nobleMsg,nobleId)
  var $openWin = $(".open-win")
  if (nobleArr.length != 0) {
    if (nobleId === 6) {
      $openWin.find('.first').hide()
      $openWin.find('.second').hide()
      $openWin.find('.three').show()
      $openWin.find('.button-wrapper').hide()
      return
    }
    $openWin.find('.first').show()
    $openWin.find('.second').show()
    $openWin.find('.three').hide()
    $openWin.find('.button-wrapper').show()
    $openWin.find(".price span").html(formatPrice(nobleMsg.openGold))
    $openWin.find(".renew span").html(formatPrice(nobleMsg.renewGold))
    $openWin.find(".renewReturn span").html(formatPrice(nobleMsg.renewReturn))
  }

  if(browser.ios){
    $(".second").hide();
    switch(nobleId){
      case 0:
        $openWin.find(".price").html("价格: 18");
        $openWin.find(".unit").text("元")
        $openWin.find(".renew span").html("10元")
        break;
      case 1:
        $openWin.find(".price").html("价格: 30");
        $openWin.find(".unit").text("元");
        $openWin.find(".renew span").html("28元")
        break;
    }
  }
}

//点击权益图标 弹出说明框

$(".privilege-list li").on("click", function () {
  // console.log($(this))
  $(".privilege-box").show()
  var titleImg = $(".explain-title img")
  var titleName = $(".explain-title p")
  var conten = $(".conten-title .conten")
  var contenShow = $(".conten-img")
  var contenImg = $(".conten-img img")
  if ($(this)[0].innerText == "贵族勋章") {
    titleImg.attr("src", "./images/item-1-2.png")
    titleName.html("特权勋章")
    conten.html(
      " 用于个人住也、社区、聊天室发言、消息列表、榜单 等模块展示您的Vip身份。"
    )
    contenShow.show()
    contenImg.attr("src", "./images/item-1-1.png")
  } else if ($(this)[0].innerText == "贵族礼物") {
    titleImg.attr("src", "./images/item-2-1.png")
    titleName.html("特权礼物")
    conten.html(" 在聊天室、社区、私聊等模块可打赏特权专属礼物。")
    contenShow.show()
    contenImg.attr("src", "./images/item-2-2.png")
  } else if ($(this)[0].innerText == "贵族表情") {
    titleImg.attr("src", "./images/item-3-1.png")
    titleName.html("特权表情")
    conten.html(" 在聊天室中上麦时可使用特权专属表情。 ")
    contenShow.show()
    contenImg.attr("src", "./images/item-3-2.png")
  } else if ($(this)[0].innerText == "进场特效") {
    titleImg.attr("src", "./images/item-4-1.png")
    titleName.html("进场特效")
    conten.html(" 进入聊天室时，出现Vip专属进场特效。 ")
    contenShow.show()
    contenImg.attr("src", "./images/item-4-2.png")
  } else if ($(this)[0].innerText == "贵族背景") {
    titleImg.attr("src", "./images/item-5-1.png")
    titleName.html("特权背景")
    conten.html(
      "Vip用户创建的聊天室，在“房间设置”中可使用更多 专属华丽的聊天室背景。"
    )
    contenShow.hide()
  } else if ($(this)[0].innerText == "头像勋章") {
    titleImg.attr("src", "./images/item-6-1.png")
    titleName.html("特权勋章")
    conten.html(
      "用于个人住也、社区、聊天室发言、消息列表、榜单等模块展示您的Vip身份"
    )
    contenShow.show()
    contenImg.attr("src", "./images/item-6-2.png")
  } else if ($(this)[0].innerText == "特殊气泡") {
    titleImg.attr("src", "./images/item-7-1.png")
    titleName.html("特殊气泡")
    conten.html("在聊天室内，公屏发言时发言背景按Nio专属效果展示。")
    contenShow.show()
    contenImg.attr("src", "./images/item-7-2.png")
  } else if ($(this)[0].innerText == "特殊说话光晕") {
    titleImg.attr("src", "./images/item-8-1.png")
    titleName.html("特殊光晕")
    conten.html("在聊天室内上麦说话，将会显示Vip专属颜色的光晕效果。")
    contenShow.hide()
  } else if ($(this)[0].innerText == "进场隐身") {
    titleImg.attr("src", "./images/item-9-1.png")
    titleName.html("进房隐身")
    conten.html(
      "Vip用户进入聊天室时，公屏不会显示您的进场提醒;进入聊天室后，在线列表将以“神秘人”身份显示。"
    )
    contenShow.hide()
  } else if ($(this)[0].innerText == "榜单隐身") {
    titleImg.attr("src", "./images/item-10-1.png")
    titleName.html("榜单隐身")
    conten.html("在排行榜中将以“神秘人”身份展示，让人无法查看您的隐私信息。")
    contenShow.show()
    contenImg.attr("src", "./images/item-10-2.png")
  } else if ($(this)[0].innerText == "专属客服") {
    titleImg.attr("src", "./images/item-11-1.png")
    titleName.html("专属客服")
    conten.html(" 钻石、星耀Vip用户将会配备专属客服，对其一对一服务。")
    contenShow.hide()
  } else if ($(this)[0].innerText == "专属靓号") {
    titleImg.attr("src", "./images/item-12-1.png")
    titleName.html("专属靓号")
    conten.html(" 钻石、星耀Vip用户将会配备专属靓号，彰显尊贵身 份。")
    contenShow.hide()
  } else if ($(this)[0].innerText == "推荐上热门") {
    titleImg.attr("src", "./images/item-13-1.png")
    titleName.html("推房间上热门")
    conten.html(
      " 星耀贵族用户可将任意聊天室推荐为热门房间，在首页展示提高曝光量。"
    )
    contenShow.hide()
  } else if ($(this)[0].innerText == "防禁言/踢麦") {
    titleImg.attr("src", "./images/item-14-1.png")
    titleName.html("防禁言/踢麦")
    conten.html(
      " 星耀贵族用户在聊天室内发言或上麦，房主无权将其禁言或踢下麦位。"
    )
    contenShow.hide()
  }
})

//点击空白区域隐藏弹窗
$(".privilege-box").on("click", function () {
  $(".privilege-box").hide()
})

function isguizu(index, nobleUser) {
  var $openWin = $(".open-win")
  var $notOpenWin = $(".notOpen-win")
  if (!$.isEmptyObject(nobleUser)) {
    // 是贵族
    if (nobleUser.nobleId - 1 > index) {
      // 点击比当前贵族低的档次
      $notOpenWin.find(".cur").html(nobleUser.nobleName)
      $notOpenWin.find(".next").html(nobleArr[index].name)
      $openWin.hide()
      $notOpenWin.show()
    } else if (nobleUser.nobleId - 1 < index) {
      // 点击比当前贵族高的档次
      renderButtonText(index)
      $openWin
        .find(".open")
        .html("升级")
        .addClass("shengji")
        .show()
      $openWin.find(".con").hide()
      $openWin.css("display", "flex")
      $notOpenWin.hide()
    } else {
      // 点击贵族与当前贵族一样
      renderButtonText(index)
      $openWin.find(".con").show()
      $openWin.find(".open").hide()
      $openWin.css("display", "flex")
      $notOpenWin.hide()
    }
  } else {
    // 不是贵族
    renderButtonText(index)
    $openWin.find(".open").show()
    $openWin.find(".con").hide()
    $openWin.css("display", "flex")
    $notOpenWin.hide()
  }
}