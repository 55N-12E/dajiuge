/**
 * Created by raymondjack on 2019/1/18.
 * jQuery extends function
 */
(function ($) {
  jQuery.fn.extend({
    addEvent: function (type, handle, bool) {
      var el,thisLen = this.length;
      bool = bool ? bool : false;
      if(thisLen == 1){
        el = this[0];
        el.addEventListener ? el.addEventListener(type,handle,bool):el.attachEvent('on' + type,handle);
      }else{
        for(var i = 0;i < thisLen;i++){
          el = this[i];
          el.addEventListener ? el.addEventListener(type, handle, bool ):
            el.attachEvent('on'+type, handle);
        }
      }
    }
  });
})(jQuery);