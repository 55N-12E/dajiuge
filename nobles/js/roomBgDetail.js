var info = {};
if(EnvCheck() == 'test'){
  var vConsole = new VConsole();
}
$(function () {
  $('.swiper-container').height($('body').height()*0.55);
  if($('body').height() > 600){
    $('.swiper-container').height($('body').height()*0.5);
  }else{
    $('.swiper-container').height($('body').height()*0.55);
  }

  var locateObj = getQueryString();
  var browser = checkVersion();
  var env = EnvCheck();
  var api = locateJudge();
  var startX,startY,endX,endY = 0;
  var totalArr = [];
  var mySwiper = null;
  var isScroll = false;
  var nobleUser = {};
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
    info.uid = 901713;
  }

  setTimeout(function () {
    getMsg();
  },100)

  function getMsg() {
    var ajaxUser = $.get(api+"/noble/users/get",{uid:info.uid,ticket:info.ticket},function (res) {
      nobleUser = res.data;
      var nobleId = 0;
      if(res.code == 200){
        if(browser.ios){
          nobleId = res.data.nobleId;
        }
      }
      $.ajax({
        type: "get",
        url: api+"/noble/res/list",
        data: {type:1,page:locateObj.page,uid:info.uid,ticket:info.ticket,nobleId:nobleId},
        headers: {
          "pub_ticket": info.ticket
        },
        success:function (res) {
          var resData = res.data;
          renderList(resData,true,locateObj.page);
          initSwiper();
        }
      })
    });
    // var ajaxRes = $.get(api+"/noble/res/list",{type:1,page:locateObj.page,uid:info.uid,ticket:info.ticket});
    // $.when(ajaxUser,ajaxRes).done(function (ajax1,ajax2) {
    //   console.log(ajax1,ajax2);
    //   var res1 = ajax1[0],res2 = ajax2[0];
    //   var resData = res2.data;
    //   nobleUser = res1.data;
    //   // totalArr = res2.data;
    //   renderList(resData,true,locateObj.page);
    //
    //   initSwiper();
    // })

    function initSwiper() {
      mySwiper = new Swiper('.swiper-container',{
        initialSlide : locateObj.index,
        effect : 'coverflow',
        slidesPerView: 2,
        centeredSlides: true,
        calculateHeight : true,
        // spaceBetween: 20,
        coverflow: {
          rotate: 0,
          stretch: -20,
          depth: 100,
          modifier: 5,
          slideShadows : false
        },
        observer:true,
        observeParents:true,
        onTransitionEnd: function(swiper){
          var index = swiper.activeIndex;
          $('.title p').html(totalArr[index].name);
          var $slide = $('.swiper-slide').eq(index);
          var $svgaWrapper = $slide.find('.svgaWrapper');
          if(totalArr[index].isDyn){
            $('.title').addClass('hasAni');

            if(!$svgaWrapper.hasClass('svgaWrapper'+totalArr[index].id)){
              $slide.addClass('hasAni');
              var svgaId = '.svgaWrapper' + totalArr[index].id;
              $svgaWrapper.addClass('svgaWrapper'+totalArr[index].id);
              var player = new SVGA.Player(svgaId);
              var parser = new SVGA.Parser(svgaId); // 如果你需要支持 IE6+，那么必须把同样的选择器传给 Parser。
              parser.load(totalArr[index].value, function(videoItem) {
                player.setVideoItem(videoItem);
                player.startAnimation();
                player.setContentMode("AspectFit");
              })
            }
          }else{
            $('.title').removeClass('hasAni');
          }
          if(totalArr[index].nobleId > 0){
            $('.title').addClass('hasNoble');
            $('.title .noble').attr('class','noble noble-'+totalArr[index].nobleId);
            if(totalArr[index].nobleId == 7){
              $('.tips').html('*<span></span>可设置');
            }else{
              $('.tips').html('*<span></span>以及以上贵族可设置');
            }
            $('.tips span').html(totalArr[index].nobleName);
            $('.tips').show();
          }else{
            $('.title').removeClass('hasNoble');
            $('.title .noble').attr('class','noble');
            $('.tips').hide();
          }
          if(nobleUser && nobleUser.roomBackgroundId == totalArr[index].id ){
            $('.save').hide();
            $('.done').show();
          }else{
            $('.save').show();
            $('.done').hide();
          }
          $('.container .blur-box').css({
            backgroundImage: 'url(' + totalArr[index].preview + '|imageView2/1/w/320/h/569)'
          })
        },

        onTouchStart: function(swiper,event){
          if(swiper.activeIndex == 0 || swiper.activeIndex == totalArr.length-1){
            var touch = event.touches[0];
            startY = touch.pageY;
            startX = touch.pageX;
          }
        },
        onTouchMove: function(swiper,event){
          if(swiper.activeIndex == 0 || swiper.activeIndex == totalArr.length-1){
            var touch = event.touches[0];
            endX = touch.pageX-startX;
            endY = touch.pageY-startY;
          }

        },
        onTouchEnd: function(swiper){
          var page = $('.content .swiper-wrapper .swiper-slide').eq(swiper.activeIndex).data('page');
          var nobleId = 0;
          if(nobleUser && browser.ios){
            nobleId = nobleUser.nobleId;
          }
          if(endX>100 && swiper.activeIndex == 0){
            page--;
            if(page <= 0){
              return;
            }else{
              $.ajax({
                url: api+"/noble/res/list",
                headers: {
                  "pub_ticket":info.ticket
                },
                data:{type:1,page:page,uid:info.uid,ticket:info.ticket,nobleId:nobleId},
                success: function (res) {
                  renderList(res.data,true,page);
                  mySwiper.slideTo(res.data.length-1,0);
                }
              })
            }
          }else if(endX<-100 && swiper.activeIndex == totalArr.length-1){
            page++;
            if(isScroll){
              return;
            }
            $.ajax({
              url: api+"/noble/res/list",
              headers: {
                "pub_ticket":info.ticket
              },
              data:{type:1,page:page,uid:info.uid,ticket:info.ticket,nobleId:nobleId},
              success: function (res) {
                if(res.data.length > 0){
                  renderList(res.data,false,page);
                  mySwiper.slideTo(totalArr.length-res.data.length-1,0);
                }else{
                  isScroll = true;
                }
              }
            });
          }
        }
      })
    }
  }


  function renderList(data,direction,pageIndex) {
    // true为左，false为右
    var $swiperWrapper = $('.content .swiper-wrapper');
    if(direction){
      for(var i = data.length - 1;i > -1;i--){
        var $div = $('<div class="swiper-slide" />');
        // var imgSrc = data[i].preview + '|imageView2/1/w/540/h/960';
        var imgSrc = data[i].preview + '|imageView2/1/w/320/h/569';
        // var imgSrc = data[i].preview + '|imageView2/1/w/427/h/569';
        var htmlStr = '<div class="imgWrapper"><img src="'+imgSrc+'" alt=""></div>';

        $div.data('page',pageIndex);
        $div.html(htmlStr);
        $swiperWrapper.prepend($div);
        if(data[i].isDyn){
          // 为动态
          // $div.addClass('hasAni');
          var $svgaWrapper = $('<div class="svgaWrapper" />');
          // var svgaId = '.svgaWrapper' + data[i].id;
          // $svgaWrapper.addClass('svgaWrapper'+data[i].id);
          $svgaWrapper.css({
            width: $div.width()/2,
            height: $div.height()
          })
          $div.append($svgaWrapper);
        }
        totalArr.unshift(data[i]);
      }
    }else{
      for(var i = 0;i < data.length;i++) {
        var $div = $('<div class="swiper-slide" />');
        var imgSrc = data[i].preview + '|imageView2/1/w/320/h/569';
        var htmlStr = '<div class="imgWrapper"><img src="'+imgSrc+'" alt=""></div>';
        $div.data('page',pageIndex);
        $div.html(htmlStr);
        $swiperWrapper.append($div);
        if(data[i].isDyn){
          // 为动态
          var $svgaWrapper = $('<div class="svgaWrapper" />');
          $svgaWrapper.css({
            width: $div.width()/2,
            height: $div.height()
          })
          $div.append($svgaWrapper);
        }
        totalArr.push(data[i]);
      }
    }
  }

  $('.save').on('click',function () {
    $('#loading').show();
    $.ajax({
      url: "/noble/res/select/roombg",
      data: {uid:info.uid,id:totalArr[mySwiper.activeIndex].id,ticket:info.ticket},
      headers: {
        "pub_ticket": info.ticket
      },
      success: function (res) {
        if(res.code == 200){
          // 设置成功
          $.ajax({
            url: "/noble/users/get",
            data: {uid:info.uid,ticket:info.ticket},
            headers: {
              "pub_ticket": info.ticket
            },
            success: function (res) {
              nobleUser = res.data;
              $('#loading').hide();
              $('.save').hide();
              $('.done').show();
            }
          })
        }else if(res.code == 401){
          // 设置不成功
          $('#loading').hide();
          if($.isEmptyObject(nobleUser)){
            // 不是贵族
            var noble = totalArr[mySwiper.activeIndex];
            var $win = $('.mask .confirm-win');
            $win.find('.second span').html(noble.nobleName);
            $('.mask').show();
          }else{
            // 是贵族
            var noble = totalArr[mySwiper.activeIndex];
            var $win = $('.mask .confirm-win');
            $win.find('.first span').html(nobleUser.nobleName);
            $win.find('.second span').html(noble.nobleName);
            $('.mask').show();
          }
        }
      }
    })
  })
  $('.mask').on('click',function (e) {
    $(this).hide();
  })
  $('.mask .confirm-win').on('click',function (e) {
    if($(e.target).hasClass('cancel')){
      $(this).parent().hide();
    }
    e.stopPropagation();
  })
  $('.mask .confirm-win .open').on('click',function () {
    var index = totalArr[mySwiper.activeIndex].nobleId;
    var str = '?nobleIndex=' + index;
    // window.location.href = 'http://apibeta.kawayisound.xyz/modules/noble/order.html' + str;
    if(env == 'test'){
      window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html' + str;
    }else{
      // window.location.href = 'https://www.erbanyy.com/modules/noble/order.html' + str;
      window.location.href = 'https://api.99date.hudongco.com/modules/nobles/order.html';
    }
  })
})
function getMessage(key,value){
  info[key] = value;
}
function shareInfo() {}
function showTitleRightNoticeFuck () {}
