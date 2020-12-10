var _hmt = _hmt || [];
(function() {
  var hostObj = hostCheck();

  console.log(hostObj);
  var src = '';
  if(hostObj.isRealTuTu || hostObj.isBetaTuTu){
    src = 'https://hm.baidu.com/hm.js?3d537e5bc5d69ff509bbd31502f0c899';
  }else if(hostObj.isOutside){
    src = 'https://hm.baidu.com/hm.js?a544f687a1fb6602746c3f5700d8484c';
  }else{
    src = '';
  }

  if(src){
    var hm = document.createElement("script");
    hm.src = src;
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
  }
})();


function hostCheck() {
  var host = window.location.host;
  return {
    isRealTuTu: host.match('api.qxjiaoyou'),
    isBetaTuTu: host.match('apibeta.qxjiaoyou'),
    isOutside: host.match('www.18pk')
  }
}
