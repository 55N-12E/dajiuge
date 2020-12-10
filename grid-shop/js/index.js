var prefix = locateJudge();
if (EnvCheck() == 'test') {
	var vConsole = new VConsole();
}
var listloading = false;
var browser = checkVersion();
var $toast = $('.toast');
var info = {};
var timer = null
var bReady = true; //定义一个抽奖开关
var userAmount = '' //用户银豆余额
var prize = [0, 1, 2, 4, 7, 6, 5, 3]; //奖品li标签滚动的顺序
var query ={}

$(function () {
	$('.lucky-draw').addClass('active')
	if (browser.app) {
		if (browser.ios) {
			window.webkit.messageHandlers.getUid.postMessage(null);
			window.webkit.messageHandlers.getTicket.postMessage(null);
			window.webkit.messageHandlers.getDeviceId.postMessage(null);
			window.webkit.messageHandlers.getRoomUid.postMessage(null)
			window.webkit.messageHandlers.getAppVersion.postMessage(null);
		} else if (browser.android) {
			if (androidJsObj && typeof androidJsObj === 'object') {
				info.uid = parseInt(window.androidJsObj.getUid());
				info.roomUid = parseInt(window.androidJsObj.getRoomUid());
				info.deviceId = window.androidJsObj.getDeviceId();
				info.ticket = window.androidJsObj.getTicket();
				info.appVersion = window.androidJsObj.getAppVersion();
			}
		}
	} else {
		info.appVersion = "1.5.5"
	}
	// getData();
	query = {
		page: 1,
		pageSize: 20,
		ticket: info.ticket
	}

	setTimeout(function(){
    info.useNew = Number(info.appVersion[0] + info.appVersion[2] + info.appVersion[4]) >= 155 ? true : false;
		getPrizesList()
  }, 100)

	// renderDrawRecord(query, function (curPageData) {
	// 	renderDrawRecordList(curPageData)
	// }, function () {
	// 	console.log('出错了')
	// })
	
	//请求下一页数据
	function loadMoreList() {
		var listData = $('.content-list');
		var top = $('.record-content').scrollTop();
		var height = $('.record-content').height();
		var scrollHeight = $('.record-content').get(0).scrollHeight;

		if (scrollHeight <= top + height + 1) {
			listloading = true
			//请求完数据在更改为false
			// console.log(132)
			query.page = query.page + 1
			renderDrawRecord(query, function (curPageData) {
				renderDrawRecordList(curPageData)
			}, function () {
				console.log('出错了')
			})
		}
	}
	//点击中奖纪录显示纪录弹窗
	$('.winning-record').on('click', function () {
		var ul = $('.content .content-list').html('')
		$('.draw-record-box').show()
		$('.content .foot-hint').hide()
		query.page = 1
		renderDrawRecord(query, function (curPageData) {
			// console.log(ul)
			renderDrawRecordList(curPageData)
		}, function () {
			console.log('出错了')
		})
	})
	//内容区域滚动事件
	$('.record-content').on('scroll', function () {
		if (!listloading) {
			loadMoreList()
		}
	})
	//点击调用app关闭页面方法
	$('.click-hide-box').on('click', function () {
		console.log(857)
		if (browser.app) {
			if (browser.ios) {

			} else if (browser.android) {
				if (androidJsObj && typeof androidJsObj === 'object') {
					window.androidJsObj.closePage();
				}
			}
		}
	})


	// 刷新银豆
	document.addEventListener('visibilitychange', function () {
		getUserAmount()
	});
})

function getUserAmount() {
	if(browser.app && info.useNew){
		var obj = {
			method: 1,
			path: 'wallet/get',
			params: {
				currencyType: 1
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
			type: 'GET',
			url: prefix + '/wallet/get',
			data: {
				currencyType: 1
      },
      headers: {
        "pub_ticket": info.ticket
      },
			success: function (res) {
				if (res.code == 200) {
					console.log(res)
					userAmount = res.data.amount
					$('.money-balancc span').find('span').html(userAmount)
				}
			},
		})
	}
}

function getPrizesList() {
	if(browser.app && info.useNew){
		var obj = {
			method: 1,
			path: 'box/prizes/lucky'
		}

		if(browser.android){
			window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
		}else if(browser.ios){
			var data = JSON.stringify(obj)
			window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
		}
	}else{
		setTimeout(function () {
			$.ajax({
				type: 'GET',
				url: prefix + '/box/prizes/lucky',
				headers: {
					"pub_ticket": info.ticket
        },
				dataType: 'json',
				success: function (res) {
					// console.log(res)
					if (res.code == 200) {
						$('.money-balancc span').find('span').html(res.data.amount)
						userAmount = res.data.amount
						getUserAmount()
						$('.draw-btn').find('.moeny').html(res.data.needAmount + "银豆/次")
						renderDrawList(res.data.prizeLuckyList)
					}
				}
			})
		}, 50)
	}
}
//渲染中奖纪录列表
function renderDrawRecordList(curPageData) {
	var $ul = $('.content .content-list')
	if (curPageData.length !== 0) {
		for (var i = 0; i < curPageData.length; i++) {
			var item = curPageData[i]
			var $li = $('<li />')
			var str = '<span class="time">' + item.createTime + '</span> <span class="award">' + item.prizeName + '</span>'
			$li.html(str)
			$ul.append($li)
		}
	} else {
		// console.log(789)
		$('.content .foot-hint').show()
	}
}
//渲染抽奖列表
function renderDrawList(data) {
	// console.log(data)
	var $ul = $('.draw-content ul')
	for (var i = 0; i < data.length; i++) {
		if(data[i].prizeId == 122){
			var $li = $('<li />')
			var str = '<div class="gift-img"><img src="' + data[i].prizeImgUrl + '" alt=""></div><span>' + nickFormat(data[i].prizeName) + '</span><div class="mask"></div><span class="rest">余<i style="font-style: normal;">'+ (data[i].remainNum) +'</i></span>'
			$li.html(str)
			$li.attr('data-id', data[i].prizeId)
			$ul.append($li)
		}else{
			var $li = $('<li />')
			var str = '<div class="gift-img"><img src="' + data[i].prizeImgUrl + '" alt=""></div><span>' + nickFormat(data[i].prizeName) + '</span><div class="mask"></div>'
			$li.html(str)
			$li.attr('data-id', data[i].prizeId)
			$ul.append($li)
		}
	}
}
//开始抽奖
function startlottery() {
	if (bReady) { //当抽奖开关为true的时候，可点击抽奖
		// message.style.display = "none"; //将获奖信息div隐藏（以防止上次抽奖信息还显示）
		// span.style.background = "#ada7a8";
		bReady = false; //抽奖开关设为false 处于抽奖中 即不能点击抽奖

		if(browser.app && info.useNew){
			var obj = {
				method: 2,
				path: 'box/drawlucky',
				params: {
					roomUid: info.roomUid,
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
				type: 'POST',
				url: prefix + '/box/drawlucky',
				headers: {
					"pub_ticket": info.ticket
        },
				data: {
					roomUid: info.roomUid,
					deviceId: info.deviceId,
					ticket: info.ticket
				},
				beforeSend(xhr){
					xhr.setRequestHeader("pub_ticket", info.ticket)
				},
				// dataType: 'json',
				success: function (res) {
					$('.draw-btn .draw-mask').hide()
					if (res.code == 200) {
						userAmount = userAmount - 30
						$('.money-balancc span').find('span').html(userAmount)
						var prizeId = res.data.prizeItem.prizeId
						var $liList = $('.draw-content li')
						var index = ''
						var num = null
						for (i = 0; i < $liList.length; i++) {
							if (prizeId == $liList[i].dataset.id) {
								index = i + 1
								break
							}
						}
						if (index === 5) {
							num = 4
						} else if (index === 8) {
							num = 5
						} else if (index === 7) {
							num = 6
						} else if (index === 6) {
							num = 7
						} else if (index === 4) {
							num = 8
						} else {
							num = index
						}
						startInit(num, res.data); //执行抽奖初始化
						console.log(res.data)
					} else if (res.code == 10005) {
						$('.sufficient-box').show()
						var timer4 = setTimeout(function () {
							$('.draw-mask').hide()
							$('.sufficient-box').hide()
							bReady = true;
							clearTimeout(timer4)
						}, 5000)
					}else if(res.code ==500){
						toastShow("服务器繁忙，请稍后再试")
					}else{
						toastShow(res.message)
					}
				},
				error(err){
					console.log(err)
					bReady = true;
					$('.draw-btn .draw-mask').hide()
					console.log(401)
					bReady = true;
					if(err.status == 401){
						var obj = JSON.parse(err.responseText);
						if(obj.code == 1413){
							if(browser.ios){
								window.webkit.messageHandlers.showPasswordDialog.postMessage(null);
							}else if(browser.android){
								window.androidJsObj.showPasswordDialog();
							}
						}else if(obj.code == 1414){
							$(".toast").text("请前往我的-设置-支付密码页面设置密码").fadeTo(400, 1)
							setTimeout(function(){
								$(".toast").fadeTo(400, 0)
							}, 1500)
						}
					}
				}
			})
		}
	}
}
//抽奖初始化
function startInit(num, data) {
	var $li = $('.draw-content li')
	var $message = $('.win-mask')
	var i = 0 //计算抽奖跑动的总次数
	var t = 150 //抽奖跑动的速度
	// var t = 1 //抽奖跑动的速度
	var rounds = 5; //抽奖转动的圈数
	// var rounds = 1; //抽奖转动的圈数
	var rNum = rounds * 8; //标记跑动的次数（这是一个条件判断分界线）
	timer = setTimeout(startscroll, t); //每t毫秒执行startscroll函数
	//抽奖滚动的函数
	function startscroll() {
		//每次滚动抽奖将所有li的class都设为空
		for (var j = 0; j < $li.length; j++) {
			$li[j].className = '';
		}
		var prizenum = prize[i % $li.length]; //通过i余8得到此刻在prize数组中的数字，该数字就是mask标记出现的位置
		// console.log(prizenum, "++++++")
		$($li[prizenum]).removeClass('active').siblings('li').addClass('active')
		i++;
		if (i < rNum - 8) { //当i小于转(rNum-8次)的数量，t不变还是200毫秒
			timer = setTimeout(startscroll, t); //继续执行抽奖滚动
		} else if (i >= rNum - 8 && i < rNum + num) {
			//t时间变长，此时计时器运行速度降低，同时标签刷新速度也降低
			t += (i - rNum + 8) * 5;
			timer = setTimeout(startscroll, t); //继续执行抽奖滚动
		}
		if (i >= rNum + num) { //当i大于转rNum加随机数字num次计时器结束，出现提示框提示中奖信息
			console.log(data, "+++")
			$message.find('.draw').html(data.prizeItem.prizeName)
			$message.find('img').attr('src', data.prizeItem.prizeImgUrl)
			
			setTimeout(function(){
				$message.show()
			}, 500)
			
			if(data.prizeItem.prizeType == 12){
				userAmount += data.prizeItem.platformValue
			}
			$('.money-balancc span').find('span').html(userAmount)
			var timer2 = null;
			timer2 = setTimeout(function () {
				$message.hide()
				clearTimeout(timer2);
				$($li[prizenum]).removeClass('active').siblings('li').removeClass('active')
			}, 4000);
			bReady = true; //当计时器结束后变为抽奖状态
			clearTimeout(timer);
		}
	}
}

//中奖纪录
function renderDrawRecord(query, successCallback, errorCallback) {
	if(browser.app && info.useNew){
		var obj = {
			method: 1,
			path: 'box/drawluckyrecord',
			params: query
		}

		if(browser.android){
			window.androidJsObj.frontHttpRequest(JSON.stringify(obj))
		}else if(browser.ios){
			var data = JSON.stringify(obj)
			window.webkit.messageHandlers.frontHttpRequest.postMessage(data);
		}

	}else{
		console.log(query,"++")
		query.uid = info.uid;
		console.log(query,"%%")
		
		$.ajax({
			type: 'GET',
			url: prefix + '/box/drawluckyrecord',
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"pub_ticket": info.ticket
			},
			data: query,
			success: function (res) {
				if (res.code == 200) {
					if (res.data.length !== 0) {
						listloading = false
					}
					$('.money-balancc span').find('span').html(res.data.amount)
					var data = res.data
					// console.log(data)
					var listData = []
					for (var i = 0; i < data.length; i++) {
						var item = data[i]
						item.createTime = dateFormat(data[i].createTime, "yyyy-MM-dd hh:mm")
						listData.push(item)
					}
					successCallback(listData)
				}
			},
			error: errorCallback
		})
	}

}
function toastShow(text) {
	$toast.html(text);
	$toast.show().css("opacity", 1);
	setTimeout(function () {
	  $toast.hide().css("opacity", 0);
	  bReady = true;
	}, 2000);
}
//点击抽奖按钮
$('.draw-btn').on('click', function () {
	// console.log(userAmount)
	// return
	if(bReady){
		$('.draw-mask').show()
		startlottery()
	}
})
//点击规则显示规则弹窗
$('.draw-rule').on('click', function () {
	$('.draw-rule-box').show()
})
//点击左边按钮隐藏弹窗
$('.hide-box').on('click', function () {
	$('.draw-rule-box').hide()
	$('.draw-record-box').hide()
})
//余额不足跳转每日任务 调用app方法在跳转
$('.not-sufficient-funds').on('click', function () {
	if (EnvCheck() == 'test') {
		var url = 'https://api.99date.hudongco.com/modules/day-sign-in/day-sign-in.html'
	}else{
		var url = 'https://prod.api.99date.hudongco.com/modules/day-sign-in/day-sign-in.html'
	}
	
	if (browser.app) {
		if (browser.ios) {
			window.webkit.messageHandlers.closeAndJumpNewWebPage.postMessage(url);
		} else if (browser.android) {
			if (androidJsObj && typeof androidJsObj === 'object') {
				window.androidJsObj.jumpNewWebPage(url);
			}
		}
	}
})

function getMessage(key, value) {
	info[key] = value;
	// console.log(info)
	query = {
		uid: info.uid,
		page: 1,
		pageSize: 20,
		ticket: info.ticket
	}
}
// 昵称长度判断
function nickFormat(data) {
	var nick
	if (data.length > 5) {
		nick = data.substring(0, 5)
	} else {
		nick = data
	}
	return nick
}

// app -> js
function frontHttpResponse(res){
	console.log(res)
  if(res.resCode == 0){

    if(res.path == 'wallet/get'){
			userAmount = res.data.amount
			$('.money-balancc span').find('span').html(userAmount)
		}else if(res.path == 'box/prizes/lucky'){
			$('.money-balancc span').find('span').html(res.data.amount)
			userAmount = res.data.amount
			getUserAmount()
			$('.draw-btn').find('.moeny').html(res.data.needAmount + "银豆/次")
			renderDrawList(res.data.prizeLuckyList)
		}else if(res.path == 'box/drawlucky'){
			$('.draw-btn .draw-mask').hide()
			userAmount = userAmount - 30
			$('.money-balancc span').find('span').html(userAmount)
			var prizeId = res.data.prizeItem.prizeId
			var $liList = $('.draw-content li')
			var index = ''
			var num = null
			for (i = 0; i < $liList.length; i++) {
				if (prizeId == $liList[i].dataset.id) {
					index = i + 1
					break
				}
			}
			if (index === 5) {
				num = 4
			} else if (index === 8) {
				num = 5
			} else if (index === 7) {
				num = 6
			} else if (index === 6) {
				num = 7
			} else if (index === 4) {
				num = 8
			} else {
				num = index
			}
			startInit(num, res.data); //执行抽奖初始化
		}else if(res.path == 'box/drawluckyrecord'){
			if (res.data.length !== 0) {
				listloading = false
			}
			$('.money-balancc span').find('span').html(res.data.amount)
			var data = res.data
			var listData = []
			for (var i = 0; i < data.length; i++) {
				var item = data[i]
				item.createTime = dateFormat(data[i].createTime, "yyyy-MM-dd hh:mm")
				listData.push(item)
			}
			renderDrawRecordList(listData)
		}

  }else if (res.path == 'box/drawlucky' && res.resCode == 10005) {
		$('.sufficient-box').show()
		var timer4 = setTimeout(function () {
			$('.draw-mask').hide()
			$('.sufficient-box').hide()
			bReady = true;
			clearTimeout(timer4)
		}, 5000)
	}else if (res.resCode == 500) {
		toastShow("服务器错误，请稍后再试")
		$('.draw-btn .draw-mask').hide()
		bReady = true;
	}else if(res.resCode == 1413){
		$('.draw-btn .draw-mask').hide()
		bReady = true;
	}else if(res.resCode == 1414){
		$('.draw-btn .draw-mask').hide()
		bReady = true;
		$(".toast").text("请前往我的-设置-支付密码页面设置密码").fadeTo(400, 1)
		setTimeout(function(){
			$(".toast").fadeTo(400, 0)
		}, 1500)
	}else{
		toastShow(res.message)
		$('.draw-btn .draw-mask').hide()
  }
}
