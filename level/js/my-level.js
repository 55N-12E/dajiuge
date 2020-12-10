var info = {};
var browser = checkVersion();
var env = EnvCheck();
var api = locateJudge();

if(EnvCheck() == 'test'){
  var vConsole = new VConsole;
}

var locateObj = getQueryString();

$(function () {
  //type=user  用户等级   type = charm    魅力等级
  if(locateObj.type == 'user'){
    $('.level').eq(0).addClass('active').siblings().removeClass('active');
    $('.user-content').eq(0).show().siblings('.user-content').hide();
    console.log("user")
  }else if (locateObj.type == 'charm'){
    $('.level').eq(1).addClass('active').siblings().removeClass('active');
    $('.user-content').eq(1).show().siblings('.user-content').hide();
    console.log("charm")
  }


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
    info.appverSion = "1.5.5"
  }

  setTimeout(function () {
    info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
    getMsg();
  },100)

  function getMsg() {
    if(browser.app && info.useNew){
      var obj = {
        method: 1,
        path: "userLevel/getUserExper",
        params: {
          ticket: info.ticket
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
        url: api + '/userLevel/getUserExper',
        type: 'GET',
        data: {
          ticket:info.ticket
        },
        headers: {
          "pub_ticket": info.ticket
        },
        success(res){
          if(res.code == 200){
            console.log(res);
            renderUser(res.data);
          }
        }
      })
    }
  }

  // 挂载 等级列表
  var str = "";
  for(var i=1; i<100; i+=10){
    str += "<li class='d-flex'>" +
              "<div class='d-flex'>Lv." + (i>10?i - 1:i) + "- Lv."+ (i+8) +"</div>" +
              "<div class='d-flex'>" +
                "<img src='./images/level_"+ (i>10?i - 1:i) +".png'/>" +
              "</div>" +
            "</li>"
  }
  $(".level-list").append(str)
  
})
function getMessage(key,value){
  info[key] = value;
}

//等级数据渲染
function renderUser(data) {
  var $user = $('.user-content').eq(0);
  $user.find('.user-head .people').attr('src',data.avatar);
  $user.find('.user-level').html('Lv ' + data.userLevelExperience.levelExperience.levelSeq);
  $user.find('.user-name').html(data.nick);
  $(".n-user-level span").text('Lv' + data.userLevelExperience.levelExperience.levelSeq);
  // $user.find('.experience span').eq(1).html(data.userLevelExperience.amount);
  $(".now-level").text('Lv' + data.userLevelExperience.levelExperience.levelSeq);
  $(".next-level").text('Lv' + (data.userLevelExperience.levelExperience.levelSeq + 1));
  $(".badge-inf img").attr("src", data.userLevelExperience.levelExperience.url);
  var barWidth = (data.userLevelExperience.amount/data.userLevelExperience.nextLevelExperience.amount)*100;
  $user.find('.schedule .schedule-box').css({
    width: barWidth + '%'
  })
  var dis = data.userLevelExperience.nextLevelExperience.amount - data.userLevelExperience.amount;
  if(dis <= 0){
    dis = '∞';
  }
  $user.find('.experience span').eq(1).html(dis);
}

function frontHttpResponse(res){
  console.log(res)
  if(res.resCode == 0){
    renderUser(res.data)
  }else{
    showToast("网络错误，请稍后再试")
  }
}