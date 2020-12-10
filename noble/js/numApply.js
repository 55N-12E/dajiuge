var info = {}
if(EnvCheck() == 'test'){
  var vConsole = new VConsole();
}
$(function () {
  var nobleUser = {};
  var browser = checkVersion();
  var $applyComplete = $('.applyComplete');
  var $applyProgress = $('.applyProcess');
  var $applyBegin = $('.applyBegin');
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
    info.uid = 90670;
  }
  setTimeout(function () {
    getNobleMsg();
  },50)
  
  function getNobleMsg() {
    var ajaxUser = $.get("/noble/users/get",{uid:info.uid,ticket:info.ticket},function (res) {
      if(res.code == 200){
        nobleUser = res.data;
        renderApplyAgain();
      }
    });
    var ajaxList = $.get("/prettyNo/checkStatus",{uid:info.uid,ticket:info.ticket});
    $.when(ajaxUser,ajaxList).done(function (ajax1,ajax2) {
      var res1 = ajax1[0],res2 =ajax2[0];
      showApplyStatus(res2.data);
    })
  }
  function renderApplyAgain() {
    var $input = $('.applyBegin .inputWrapper input');
    if(nobleUser.nobleId <= 6){
      $input.attr('placeholder','请输入您想要的6位靓号');
    }else{
      $input.attr('placeholder','请输入您想要的4位靓号');
    }
  }
  function showApplyStatus(data) {
    console.log(data);

    if(nobleUser.goodNum == 0){
      // 没申请靓号或者正在审核
      if(data && data.approveResult == 1){
        // 正在审核
        $applyProgress.show();
        $applyProgress.find('.erbanNo').html(data.approveErbanNo);
      }else{
        $applyBegin.show();
      }
    }else{
      // 已经有靓号
      $applyComplete.show();
      $applyComplete.find('.erbanNo').html(nobleUser.goodNum);
      $applyComplete.find('.date').html(dateFormat(nobleUser.expire,'yyyy-MM-dd'));
    }


  }
  $('.submit').on('click',function () {
    var $toast = $('.toast');
    var $input = $('.applyBegin .inputWrapper input');
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
      $.get("/prettyNo/checkPrettyNo",{uid:info.uid,prettyNo:val},function (res) {
        if(res.code == 200){
          $applyBegin.hide();
          $applyProgress.show();
          $applyProgress.find('.erbanNo').html(val);
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
      })
    }else{
      $toast.html('信息格式输入有误，请重新输入');
      $toast.show();
      setTimeout(function () {
        $toast.hide();
      },1000)
    }
  })
})
function getMessage(key,value){
  info[key] = value;
}
function showTitleRightNoticeFuck() {

}
