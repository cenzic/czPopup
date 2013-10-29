/**
* Copyright © Quoc Quach 2013-2014
* Author: Quoc Quach
* Email: quoc_cooc@yahoo.com
* Released under the MIT license
* Date: 10/29/2013
*/
jPopup = {
	base: 10000,	
	wrapperId: "body",
	current: 0,
	isActive:false,
	jObj:{},	
	timer:null,
	lastPos:{},
	lastSize:{},
	noticeTimeout: 1000,
	positionAbsolute:false,
	defaultOptions: {
		showDefaultClose: false,
		showDefaultButton: false,
		textAlign:"center",
		title:"",
		operators : [],				
	},	
	show: function (data, opts) {
		
		var options = $.extend(true,{ }, jPopup.defaultOptions, opts);
		
		if (options.showDefaultButton) {		
			options.operators.push({ name: "Close", handler: jPopup.close });
		}
		
		if (!$(".PopupWindow").length) {
			if((typeof (data)!="string")) {
				jPopup.jObj[this.current]=$(data);	
			}
			jPopup.showFirstPopup(options);
		} else {
			jPopup.current += 2;
			if((typeof (data)!="string")) {
				jPopup.jObj[this.current]=$(data);	
			}
			jPopup.showNextPopup(options);
		}
		
		$("#PopupOverLay").css("z-index", jPopup.base + jPopup.current);
		$("#PopupOverLay").css("height", $(document).height());
		$("#PopupOverLay").show();
		var popupWindow = $("#PopupWindowId_" + jPopup.current);
		popupWindow.css("z-index", jPopup.base + jPopup.current + 1);
		var content =   $("#PopupWindowId_" + jPopup.current + " .PopupContent");
		content.css("text-align", options.textAlign);
		if(typeof(data)=="string") content.html(data);
		
		//update size of window and content
		if (options && options.minWidth) {
			popupWindow.css("min-width", options.minWidth);
		}
		if (options && options.maxWidth) {
			popupWindow.css("max-width", options.maxWidth);
		}
		if (options && options.minHeight) {
			content.css("min-height", options.minHeight);
		}
		if (options && options.maxHeight) {
			content.css("max-height", options.maxHeight);
		}		
		popupWindow.show();		
		if(jPopup.jObj[jPopup.current]) jPopup.jObj[jPopup.current].show();		
		this.setPosition(jPopup.current);
		jPopup.popupWidth = jPopup.popupHeight = 0;
		popupWindow.find(".PopupClose").click(jPopup.close);
		popupWindow.find("input:first").focus();
		//disable all input enter
		popupWindow.find("input:not(:submit,:button,:reset), select").keypress(function(e) {			
			if (e.keyCode == 13) {				
				e.preventDefault();
				return false;
			}
		});
	},
	setPosition: function (windowId, isSticky) {				
		if(jPopup.isActive===false) return;
		var currentWindow = $("#PopupWindowId_" + windowId);
		if(isSticky) {
			var maxHeight = jPopup.lastPos[windowId].top + currentWindow.innerHeight();
			console.log("top: %d, maxHeight: %d, windowHeight: %d", jPopup.lastPos[windowId].top, maxHeight, $(window).height());
			if(maxHeight < $(window).height()) return;			
		}
		var left = ($(window).width() - currentWindow.innerWidth()) / 2;
		left = left < 0 ? 0 : left;		
		currentWindow.css('left', left);
		
		var top = ($(window).height() - currentWindow.innerHeight()) * 0.35;
		if(jPopup.positionAbsolute || $(window).height()<currentWindow.outerHeight()) {					
			var scrollTop = document.documentElement.scrollTop;
			top += scrollTop;
			currentWindow.css("position", "absolute");
			console.log("absolute");
		}
		else {			
			currentWindow.css("position", "fixed");
			console.log("fixed");
		}
		top = top < 0 ? 0 : top;
		currentWindow.css('top', top);
		jPopup.lastPos[windowId] = { top: top, left: left };
		
		$("#PopupOverLay").css("height", $(document).height());
	},	
	alert: function (data,callback) {
		jPopup.show(data, { showDefaultButton: false, minWidth: "300px",
			operators: [{ name: "OK", handler: function () {
					jPopup.close();
					if(callback) callback.call(this,true);
				}
			}]
		});
	},
	confirm: function (data,callback) {		
		jPopup.show(data, {
			showDefaultButton: false, minWidth: "300px",
			operators: [
			{ name: "OK", handler: function () {
				jPopup.close();
				if(callback) callback.call(this,true);
			}
			},
			{ name: "Cancel", handler: function () {
				jPopup.close();
				if(callback) callback.call(this,false);
			}}
			]
		});		
	},
	prompt:function (message,defaultValue,callback) {
		defaultValue = defaultValue || "";
		var data = message + "<br/>";
		var id = "promptId_" + Math.floor(Math.random()*Math.pow(10,9));
		console.log(id);
		data += "<input type='text' style='width:95%' id='" + id + "' value='" + defaultValue + "'/>";
		jPopup.show(data, {
			showDefaultButton: false,
			minWidth: "300px",
			operators: [
				{
					name: "OK",
					handler: function() {
						var val = $("#" + id).val();
						jPopup.close();
						if (callback) callback.call(this,val);
					}
				},
				{
					name: "Cancel",
					handler: function() {
						jPopup.close();
						if (callback) callback.call(this,null);
					}
				}
			]
		});
	},
	notice:function (message) {
		jPopup.show(message, { minWidth: "300px" });
		setTimeout(jPopup.close, jPopup.noticeTimeout);
	},
	close: function () {		
		if(jPopup.jObj[jPopup.current]) {
			jPopup.jObj[jPopup.current].unwrap();
			jPopup.jObj[jPopup.current].siblings().remove();
			jPopup.jObj[jPopup.current].unwrap();			
			jPopup.jObj[jPopup.current].hide();
			jPopup.jObj[jPopup.current].find(".operation_buttons").remove();
			delete jPopup.jObj[jPopup.current];
		}
		else {			
			$("#PopupWindowId_" + jPopup.current).remove();			
		}		
		if (jPopup.current == 0) {
			$("#PopupOverLay").remove();
			jPopup.isActive = false;
		} else {
			jPopup.current -= 2;
			$("#PopupOverLay").css("z-index", jPopup.base + jPopup.current);
		}	
		jPopup.popupWidth = jPopup.popupHeight = 0;
	},
	showFirstPopup: function (options) {
		jPopup.isActive = true;
		$(this.wrapperId).append('<div id="PopupOverLay"></div>');		
		jPopup.showNextPopup(options);		
	},
	showNextPopup: function (options) {		
		if(jPopup.jObj[jPopup.current]) {
			nextPopup = jPopup.jObj[jPopup.current];						
			nextPopup.wrap('<div id="PopupWindowId_' + jPopup.current + '" class="PopupWindow hidden">');									
			if (options.showDefaultClose) nextPopup.before('<div class="PopupClose DefaultClose">X</div>');
			if(options.title) nextPopup.before('<div class="PopupTitle">'+options.title+'</div>');
			nextPopup.wrap('<div class="PopupContent"></div>');
			if (options.operators.length>0) jPopup.show_operators(nextPopup.parent(), options.operators);
		}else {
			var nextPopup = $('<div id="PopupWindowId_' + jPopup.current + '" class="PopupWindow hidden">');			
			if (options.showDefaultClose) nextPopup.append('<div class="PopupClose DefaultClose">X</div>');
			if(options.title) nextPopup.append('<div class="PopupTitle">'+options.title+'</div>');
			nextPopup.append('<div class="PopupContent"></div>');
			if (options.operators.length>0) jPopup.show_operators(nextPopup, options.operators);
			$(this.wrapperId).append(nextPopup);
		}				
	},
	show_operators: function (popupWindow, operators) {
		var operationButtons = $('<div class="operation_buttons">');
		//show default close button        
		for (var i = 0 in operators) {
			var button = $('<input type="button" class="button-small" value="' + operators[i]["name"] + '">');
			button.click(operators[i]["handler"]);
			operationButtons.append(button);
		}
		popupWindow.append(operationButtons);
	},
	resizeHandler:function () {
		if(!jPopup.isActive) return;
		var currentWindow = $("#PopupWindowId_" + jPopup.current);
		var width = currentWindow.width();
		var height = currentWindow.height();
		if(!jPopup.lastSize[jPopup.current]) jPopup.lastSize[jPopup.current] = { };
		var lastSize = jPopup.lastSize[jPopup.current];				
		if(lastSize.width!=width || lastSize.height != height) {
			lastSize.width = width;
			lastSize.height = height;
			jPopup.setPosition(jPopup.current,true);		
		}  
	},
	closeAll:function () {
		var current = jPopup.current;
		for(var i=0;i<=current;i+=2) {
			console.log(i);
			jPopup.close();
		}			
	}
};
$(window).resize(function () {	
	for(var i=0;i<=jPopup.current;i+=2) {		
		jPopup.setPosition(i);
	}	
});
jPopup.timer = setInterval(jPopup.resizeHandler,100);