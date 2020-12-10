var info = {};
var nobleUser = {};
var api = locateJudge();
var browser = checkVersion();
var $surf_apply_one = $('.surf-apply-one');
var $surf_apply_two = $('.surf-apply-two');
var $surf_apply_three = $('.surf-apply-three');
if(EnvCheck() == 'test'){
  var vConsole = new VConsole();
}

$(function () {
  var main = {
    init : function () {
      setTimeout(function () {
        info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
      },100)
      this.getMsgFromDevice();
      this.eventRegister();
      this.getDataFromBack();
    },
    getMsgFromDevice: function () {
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
    },
    getDataFromBack: function () {
      setTimeout(function () {
        getNobleMsg();
      },100)
    },
    eventRegister: function () {
      $('.submit').on('click',function () {
        var $toast = $('.toast');
        var $input = $('.surf-apply-one .input-box input');
        var val = parseInt($input.val());
        console.log(val);
        if(!val){
          $input.val('');
          $toast.html('信息输入有误，请重新输入');
          $toast.show();
          setTimeout(function () {
            $toast.hide();
          },1000)
          return;
        }

        if((val >= 1000 && val <= 9999 && nobleUser.nobleId == 7) || (val >= 100000 && val <= 999999 && nobleUser.nobleId == 6)){
          if(browser.app && info.useNew){
            var obj = {
              method: 1,
              path: "prettyNo/checkPrettyNo",
              params: {
                prettyNo:val
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
              url: api + "/prettyNo/checkPrettyNo",
              type: "GET",
              data: {
                prettyNo:val
              },
              headers: {
                "pub_ticket": info.ticket
              },
              success(res){
                if(res.code == 200){
                  $surf_apply_one.hide();
                  $surf_apply_two.show();
                  $surf_apply_two.find('.child-number').html(val);
                }else if(res.code == 1200 ){
                  $toast.html('您提交的靓号已被使用，请重新提交');
                  $toast.show();
                  setTimeout(function () {
                    $toast.hide();
                  },1000)
                }else{
                  $toast.html('信息格式输入有误，请重新输入');
                  $toast.show();
                  setTimeout(function () {
                    $toast.hide();
                  },1000)
                }
              }
            })
          }
        }else{
          $toast.html('信息格式输入有误，请重新输入');
          $toast.show();
          setTimeout(function () {
            $toast.hide();
          },1000)
        }
      })
    },
  };
  main.init();

  initNav(showTitleRightNoticeFuck())
})

function getNobleMsg() {
  if(browser.app && info.useNew){
    var obj1 = {
      method: 1,
      path: "noble/users/get",
      params: {
        ticket:info.ticket
      }
    }
    

    if(browser.android){
      window.androidJsObj.frontHttpRequest(JSON.stringify(obj1))
    }else if(browser.ios){
      var data1 = JSON.stringify(obj1)
      window.webkit.messageHandlers.frontHttpRequest.postMessage(data1);
    }
  }else{
    var ajaxUser = $.ajax({
      url: api + "/noble/users/get",
      type: "GET",
      headers: {
        "pub_ticket": info.ticket
      },
      data: {
        ticket:info.ticket
      },
      success(res){
        if(res.code == 200){
          nobleUser = res.data;
          renderApplyAgain();
        }
      }
    })
    var ajaxList = $.ajax({
      url: api + "/prettyNo/checkStatus",
      data: {ticket:info.ticket},
      headers: {
        "pub_ticket": info.ticket
      }
    })

    $.when(ajaxUser,ajaxList).done(function (ajax1,ajax2) {
      var res1 = ajax1[0],res2 =ajax2[0];
      showApplyStatus(res2.data);
    })
  }
}

function renderApplyAgain() {
  var $input = $('.surf-apply-one .input-box input');
  if(nobleUser.nobleId <= 6){
    $input.attr('placeholder','请输入您想要的6位靓号');
  }else{
    $input.attr('placeholder','请输入您想要的4位靓号');
  }
};

function showApplyStatus(data) {
  console.log(data)
  console.log(nobleUser)
  if(data.approveResult == 3 || data.approveResult == 4 || data.length == 0){
    // 3不通过 4失效
    $surf_apply_one.show()
  }else if(data.approveResult == 1){
    // 审核中
    $surf_apply_two.show()
    $surf_apply_two.find('.child-number').html(data.approveErbanNo);
  }else if(data.approveResult == 2){
    // 通过
    $surf_apply_three.show();
    $surf_apply_three.find('.child-number').html(data.approveErbanNo);
    $surf_apply_three.find('.child-title').html('有效期至'+dateFormat(nobleUser.expire,'yyyy-MM-dd'));
  }
}

function getMessage(key,value){
  info[key] = value;
}

function showTitleRightNoticeFuck() {
  var linkUrl = ""
  if (EnvCheck() == "test") {
    if(locateJudge().match(/preview/)){
      linkUrl = "https://preview.api.99date.hudongco.com/modules/record/index.html?id=1"
    }else{
      linkUrl = "https://api.99date.hudongco.com/modules/record/index.html?id=1"
    }
  } else {
    linkUrl = "https://prod.api.99date.hudongco.com/modules/record/index.html?id=1"
  }
  var obj = {
    type: 1,
    data: {
      msg: "wewawa",
      title: "开通记录",
      link: linkUrl,
    },
  }
  return obj
}


// app -> js
function frontHttpResponse(res){
  console.log(res)
  if(res.resCode == 0 && (res.data)){
    var data
    if(res.data){
      data = res.data
    }
    
    if(res.path == 'prettyNo/checkPrettyNo'){
      $surf_apply_one.hide();
      $surf_apply_two.show();
      $surf_apply_two.find('.child-number').html(data.approveErbanNo);

    }else if(res.path == 'noble/users/get'){
      nobleUser = data;
      renderApplyAgain();

      var obj2 = {
        method: 1,
        path: "prettyNo/checkStatus",
        params: {
          ticket:info.ticket
        }
      }

      if(browser.android){
        window.androidJsObj.frontHttpRequest(JSON.stringify(obj2))
      }else if(browser.ios){
        var data2 = JSON.stringify(obj2)
        window.webkit.messageHandlers.frontHttpRequest.postMessage(data2);
      }
    }else if(res.path == 'prettyNo/checkStatus'){
      showApplyStatus(data);
    
    }
  }else{
    console.log(res)
    if(browser.android){
      $(".toast").text(res.message).fadeTo(400, 1)
      setTimeout(function(){
        $(".toast").fadeTo(400, 0, function(){
          $(".toast").hide()
        })
      }, 1500)
    }
  }
}