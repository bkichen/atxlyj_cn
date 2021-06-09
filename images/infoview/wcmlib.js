/**--cssrender.js--**/
var Ext = {version: '2.2'};
var ua = navigator.userAgent.toLowerCase();
var isStrict = document.compatMode == "CSS1Compat",
	isOpera = ua.indexOf("opera") > -1,
	isChrome = ua.indexOf("chrome") > -1,
	isSafari = (/webkit|khtml/).test(ua),
	isSafari3 = isSafari && ua.indexOf('webkit/5') != -1,
	isIE = !isOpera && ua.indexOf("msie") > -1,
	isIE7 = !isOpera && ua.indexOf("msie 7") > -1,
	isIE9 = !isOpera && ua.indexOf("msie 9") > -1,
	isIE8 = !isOpera && (ua.indexOf("msie 8") > -1 || ua.indexOf("msie 9") > -1),
	isIE6 = !isOpera && !isIE7 && ua.indexOf("msie 6") > -1,
	isGecko = !isSafari && ua.indexOf("gecko") > -1,
	isGecko2 = isGecko && ua.indexOf("firefox/2") > -1,	
	isGecko3 = !isSafari && ua.indexOf("rv:1.9") > -1,
	isSecure = window.location.href.toLowerCase().indexOf("https") === 0;
    // remove css image flicker
	if(isIE && !isIE7){
        try{
            document.execCommand("BackgroundImageCache", false, true);
        }catch(e){}
    }
var vars = ['isStrict', 'isOpera', 'isChrome', 'isSafari', 'isSafari3', 'isIE', 'isIE7', 'isIE8', 'isIE6', 'isGecko', 'isGecko2', 'isGecko3', 'isSecure'];
for(var i=0;i<vars.length;i++)
	Ext[vars[i]] = window[vars[i]];
function defExtCss(){
	var inited, initExtCssThreadId = -1;
    window.initExtCss = function(){
        var bd = document.body;
        if(!bd){ return false; }
		clearInterval(initExtCssThreadId);
		if(bd.getAttribute('_cssrender') || inited) return true;
		inited = true;
		
		var cls = [];
		if(Ext.isIE)cls.push("ext-ie");
		if(Ext.isIE6)cls.push("ext-ie6");
		if(Ext.isIE7)cls.push("ext-ie7");
		if(Ext.isIE8)cls.push("ext-ie8");
		if(Ext.isIE9)cls.push("ext-ie9");

		if(Ext.isGecko)cls.push("ext-gecko");
		if(Ext.isGecko2)cls.push("ext-gecko2");
		if(Ext.isGecko3)cls.push("ext-gecko3");

		if(Ext.isOpera)cls.push("ext-opera");
		if(Ext.isSafari)cls.push("ext-safari");
        if(Ext.isStrict){
            var p = bd.parentNode;
            if(p){
                p.className += ' ext-strict';
            }
        }
		cls.push('res-'+screen.width+"x"+screen.height);
        bd.className += " " + cls.join(' ');
		bd.setAttribute('_cssrender', 1);
        return true;
    }
	if(!window.initExtCss()){
		initExtCssThreadId = setInterval(initExtCss, 50);	
	}
};
defExtCss();
/**--lightbase.js--**/
if(!window.Ext){
	var Ext = {version: '2.2'};
}

function $(el) {
	if (typeof el == 'string')
		el = document.getElementById(el) || document.getElementsByName(el)[0];
	return el;
}
Ext.apply = Object.extend = function(d, s) {
	if(!d || !s)return d;
	for (p in s)d[p] = s[p];
	return d;
}
Ext.ns = function(){
	for(var j=0;j<arguments.length;j++){
		ns = arguments[j];
		var nps = ns.split('.');
		var o = window; 
		for(var i=0 ; i<nps.length ; i++){
			o = o[nps[i]] = o[nps[i]] || {}; 
		}
	}
}
function Try() {
	for (var i = 0; i < arguments.length; i++) {
	  try {
		return (arguments[i])();
	  } catch (e) {}
	}
}
Array.isArray = function(arr){
	return arr!=null && typeof arr=='object' && arr.length!=null && arr.splice;
}
Object.extend(Array.prototype, {
	last : function(){
		return this[this.length - 1];
	},
    indexOf : function(o){
       for (var i = 0, len = this.length; i < len; i++){
 	      if(this[i] == o) return i;
       }
 	   return -1;
    },
    remove : function(o){
       var index = this.indexOf(o);
       if(index != -1){
           this.splice(index, 1);
       }
       return this;
    },
	compact: function() {
		var rst = [];
		for (var i = 0, n = this.length; i < n; i++){
			if(this[i]!=null)rst.push(this[i]);
		}
		return rst;
	}
});
String.format = function(format){
	var args = Array.prototype.slice.call(arguments, 1);
	return format.replace(/\{(\d+)\}/g, function(m, i){
		return args[i];
	});
}
Object.extend(String.prototype, {
 	camelize0 : function(){
		var oStringList = this.split('-');
		if (oStringList.length == 1) return oStringList[0];

		var camelizedString = this.indexOf('-') == 0
		  ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
		  : oStringList[0];

		for (var i = 1, len = oStringList.length; i < len; i++) {
		  var s = oStringList[i];
		  camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
		}

		return camelizedString;
	},
	endsWith : function(sEnd) {
		return (this.substr(this.length-sEnd.length)==sEnd);
	},
	startsWith : function(sStart) {
		return (this.substr(0,sStart.length)==sStart);
	},
	trim : function(){
		return this.replace(/^\s*/, "").replace(/\s*$/, "");
	}
});
Object.deepClone = function(o){
	if(!o || typeof o!='object')return o;
	var rst = {};
	if(Array.isArray(o)){
		rst = [];
		for(var i=0,n=o.length;i<n;i++)
			rst.push(Object.deepClone(o[i]));
		return rst;
	}
	for(var p in o)rst[p] = Object.deepClone(o[p]);
	return rst;
}
function getParameter(_sName, _sQuery){
	if(!_sName)return '';
	var query = _sQuery || location.search;
	if(!query)return '';
	var arr = query.substring(1).split('&');
	_sName = _sName.toUpperCase();
	for (var i=0,n=arr.length; i<n; i++){
		if(arr[i].toUpperCase().indexOf(_sName+'=')==0){
			return arr[i].substring(_sName.length + 1);
		}
	}
	return '';
}
function $A(m) {
	if (!m) return [];
	var rst = [];
	for (var i = 0; i < m.length; i++)
		rst.push(m[i]);
	return rst;
}
function $F(el){
	el = $(el);
	var tagNm = el.tagName, eleType = (el.type||'').toLowerCase();
	if(tagNm=='INPUT' &&
		(eleType=='checkbox' || eleType=='radio')){
		return el.getAttribute('isboolean', 2) ?
				(el.checked?1:0) : (el.checked?el.value:null);
	}
	if(tagNm == "SPAN" && el.className.trim() == "xdRichTextBox"){
		return el.innerHTML;
	}
	return el.value;
}
function $$F(name){
	if(typeof name!='string')name = name.name;
	var eles = document.getElementsByName(name);
	var rst = [], v;
	for(var i=0; i<eles.length; i++){
		v = $F(eles[i]);
		if(v!=null)rst.push(v);
	}
	return rst.join(',');
}
function findItem(t, cls, attr, aPAttr){
	aPAttr = aPAttr || [];
	while(t!=null&&t.tagName!='BODY'&& t.nodeType==1){
		for (var i = 0; i < aPAttr.length; i++){
			if(dom.getAttribute(aPAttr[i]) != null) return 0;
		}
		if(cls && Element.hasClassName(t, cls))return t;
		if(attr && t.getAttribute(attr, 2)!=null)return t;
		t = t.parentNode;
	}
	return null;
}

Function.prototype.bind = function() {
  var __method = this, args = $A(arguments), object = args.shift();
  return function() {
    return __method.apply(object, args.concat($A(arguments)));
  }
}
if(!window.Element) {
	var Element = {};
}
Ext.apply(Element, {
	find : function(t, attr, cls, aPAttr){
		return findItem(t, cls, attr, aPAttr);
	},
	toggle: function(el) {
		Element[Element.visible(el)?'hide':'show'](el);
	},
	visible: function(el) {
		if (!(el = $(el))) return;
		return el.style.display != 'none';
	},
	hide: function() {
		for (var i = 0; i < arguments.length; i++) {
		  var el = $(arguments[i]);
		  if(el)el.style.display = 'none';
		}
	},
	show: function() {
		for (var i = 0; i < arguments.length; i++) {
		  var el = $(arguments[i]);
		  if(el)el.style.display = '';
		}
	},
	hasClassName: function(el, cs) {
		if (!(el = $(el))) return;
		return (' '+el.className+' ').indexOf(' '+cs+' ')!=-1;
	},
	addClassName: function(el, cs) {
		if(Element.hasClassName(el, cs))return;
		if (!(el = $(el))) return;
		return el.className = el.className + ' ' + cs;
	},
	removeClassName: function(el, cs) {
		if (!(el = $(el))) return;
		return el.className = el.className.replace(new RegExp('(^|\\s+)'+cs+'(\\s+|$)', 'ig'), ' ');
	},
	update : function(el, html){
		if (!(el = $(el))) return;
		el.innerHTML = html;
	},
	 getStyle: function(element, style) {
		element = $(element);
		var value = element.style[style.camelize()];
		if (!value) {
		  if (document.defaultView && document.defaultView.getComputedStyle) {
			var css = document.defaultView.getComputedStyle(element, null);
			value = css ? css.getPropertyValue(style) : null;
		  } else if (element.currentStyle) {
			value = element.currentStyle[style];
		  }
		}

		if (window.opera && ['left', 'top', 'right', 'bottom'].include(style))
		  if (Element.getStyle(element, 'position') == 'static') value = 'auto';

		return value == 'auto' ? null : value;
	 }
});
if(!window.Event){
	var Event = {};
}
Object.extend(Event, {
  element: function(e) {
    return e.target || e.srcElement;
  },
  blurElement: function(e) {
    return e.explicitOriginalTarget || document.activeElement;
  },
  pointerX: function(e) {
    return e.pageX || (e.clientX +
      (document.documentElement.scrollLeft || document.body.scrollLeft));
  },
  pointerY: function(e) {
    return e.pageY || (e.clientY +
      (document.documentElement.scrollTop || document.body.scrollTop));
  },
  stop: function(e) {
    if (e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      e.returnValue = false;
      e.cancelBubble = true;
    }
  },
  observers: false,
  _observe : function(el, name, fn){
    if (el.addEventListener) {
      el.addEventListener(name, fn, false);
    } else if (el.attachEvent) {
      el.attachEvent('on' + name, fn);
    }
  },
  _observeAndCache: function(el, name, fn) {
    if (!this.observers) this.observers = [];
	this.observers.push([el, name, fn]);
	this._observe(el, name, fn);
  },
  unloadCache: function(ev) {
	var arr = Event.observers || [];
	for (var i = 0; i < arr.length; i++) {
		if(arr[i]==null)continue;
		Event._stopObserving.apply(Event, arr[i]);
		arr[i][0] = null;
	}
	Event.observers = false;
	var arr = Event.unloadListeners || [];
	for (i = 0,len = arr.length; i < len; i++) {
		if(!arr[i])continue;
		arr[i][2].call(window, ev);
		arr[i] = null;
	}
	Event.unloadListeners = false;
	Event._stopObserving(window, 'unload', Event.unloadCache);
  },
  observe: function(el, name, fn) {
    var el = $(el);
	if ("unload" == name) {
		var arr = this.unloadListeners = this.unloadListeners || [];
		arr.push([el, name, fn]);
		return;
	}
    this._observeAndCache(el, name, fn);
  },
  _stopObserving : function(el, name, fn){
	  try{
		if (el.removeEventListener) {
		  el.removeEventListener(name, fn, false);
		} else if (el.detachEvent) {
		  el.detachEvent('on' + name, fn);
		}
	  }catch(error){
	  }
  },
  stopObserving: function(el, name, fn) {
    var el = $(el);
	if ("unload" == name) {
		var arr = Event.unloadListeners || [];
		for (var i = arr.length - 1; i >= 0; i--) {
			var li = arr[i];
			if (!(li && li[0] == el && li[1] == name && li[2] == fn))continue;
			arr.splice(i, 1);
			li[0] = null;
			return true;
		}
		return false;
	}
	var arr = Event.observers || [];
	for (var i = arr.length - 1; i >= 0; i--) {
		var li = arr[i];
		if (!(li && li[0] == el && li[1] == name && li[2] == fn))continue;
		arr.splice(i, 1);
		this._stopObserving(el, name, fn);
		return true;
	}
	return false;
  },
  stopAllObserving : function (el, name){
	if(!(el = $(el)))return;
	if(name=='unload' || (!name && el==window)){
		Event.unloadListeners = false;
		if(name=='unload')return;
	}
	var arr = Event.observers || [];
	for (var i = arr.length - 1; i >= 0; i--) {
		if(arr[i][0] != el)continue;
		if(name!=null && name!=arr[i][1])continue;
		Event._stopObserving.apply(Event, arr[i]);
		arr[i][0] = null;
		arr.splice(i, 1);
	}
  }
});
Event._observe(window, 'unload', Event.unloadCache);
Event.observe(window, 'unload', function(){
	delete Function.prototype.bind;
	delete Object.extend;
	delete Object.clone;
	delete Object.deepClone;
});
var m_genId = 0;
function genExtId(){
	return 'myext-'+(++m_genId);
}

Ext.myEvent = function(){}
function extEvent(ev){
	var rst = new Ext.myEvent();
	Ext.apply(rst, {
		browserEvent : ev,
		type : ev.type,
		target : Event.element(ev),
		blurTarget : Event.blurElement(ev),
		within : function(el){
            var t = Event.element(ev);
            while(t && t.tagName!='BODY'){
				if(t==el)return true;
				t = t.parentNode;
			}
			return false;
        },
		stop : function(){
			Event.stop(ev);
		},
		pointer : [Event.pointerX(ev), Event.pointerY(ev)],
		button : rst.button0 ? rst.button0(ev) : 0
	});
	return rst;
}
var m_extListeners = {};
function addFxWrap(id, evName, fn, scope, wrap){
	var es, ls;
	m_extListeners[id] = es = m_extListeners[id] || {};
	es[evName] = ls = es[evName] || [];
	ls.push({fn:fn,scope:scope,wrap:wrap});
}
function removeFxWrap(id, evName, fn, scope){
	var es = m_extListeners[id];
	if(!es)return;
	var ls = es[evName], l;
	if(!ls)return;
	for(var i = 0, len = ls.length; i < len; i++){
		l = ls[i];
		if(l.fn == fn && (!scope || l.scope == scope)){
			wrap = l.wrap;
			ls.splice(i, 1);
			return wrap;
		}
	}
}
Ext.myEl = function(){}
Ext.fly = Ext.get = function(el){
	el = $(el);
	if(!el.id)el.id = genExtId();
	var id = el.id, rst = new Ext.myEl();
	Ext.apply(rst, {
		dom : el,
		on : function(evName, f, scope){
			function h(ev){
				ev = ev || window.event;
				var nev = extEvent(ev);
				f.call(scope, nev, nev.target);
			}
			addFxWrap(id, evName, f, scope, h);
			Event.observe(id, evName, h);
		},
		un : function(evName, f, scope){
			var h = removeFxWrap(id, evName, f, scope);
			if(h==null)return;
			Event.stopObserving(id, evName, h);
		}
	});
	return rst;
}

function lbinit(){
	Ext.SSL_SECURE_URL = "javascript:false";
	Ext.isSecure = window.location.href.toLowerCase().indexOf("https") === 0;
	Ext.blankUrl = Ext.isSecure ? Ext.SSL_SECURE_URL : "";
	var ua = navigator.userAgent.toLowerCase();
	var isOpera = ua.indexOf("opera") > -1;
	Ext.isIE = !isOpera && ua.indexOf("msie") > -1;
	isIE7 = !isOpera && ua.indexOf("msie 7") > -1;
	Ext.isIE6 = !isOpera && !isIE7 && ua.indexOf("msie 6") > -1;
};
lbinit();

//\u517C\u5BB9ff\u7684\u90E8\u5206\u65B9\u6CD5
(function(){
	if(window.navigator.userAgent.toLowerCase().indexOf("msie")>=1) return;
	var _emptyTags = {
	   "IMG":   true,
	   "BR":    true,
	   "INPUT": true,
	   "META":  true,
	   "LINK":  true,
	   "PARAM": true,
	   "HR":    true
	};
	HTMLElement.prototype.__defineGetter__("innerText",function(){
		var text=null;
		text = this.ownerDocument.createRange();
		text.selectNodeContents(this);
		text = text.toString();
		return text;
	});
	HTMLElement.prototype.__defineGetter__("outerHTML", function () {
	   var attrs = this.attributes;
	   var str = "<" + this.tagName;
	   for (var i = 0; i < attrs.length; i++)
	      str += " " + attrs[i].name + "=\"" + attrs[i].value + "\"";
	
	   if (_emptyTags[this.tagName])
	      return str + "/>";
	
	   return str + ">" + this.innerHTML + "</" + this.tagName + ">";
	});
	HTMLElement.prototype.__defineSetter__("outerHTML", function (sHTML) {
	   var r = this.ownerDocument.createRange();
	   r.setStartBefore(this);
	   var df = r.createContextualFragment(sHTML);
	   this.parentNode.replaceChild(df, this);
	});
})();

window.DOM = window.DOM || {};
Ext.apply(window.DOM,(function(){
	(function(){
		if (document.addEventListener) {
			document.addEventListener( "DOMContentLoaded", function(){
				document.removeEventListener( "DOMContentLoaded", arguments.callee, false );//\u6E05\u9664\u52A0\u8F7D\u51FD\u6570
				fireReady();
			}, false );
		}else{//ie
			if (document.getElementById) {
				document.write("<script id=\"ie-domReady\" defer=\"defer\" src=\"//:\" type=\"text/javascript\"><\/script>");
				document.close();
				document.getElementById("ie-domReady").onreadystatechange = function() {
					if (this.readyState === "complete") {
						fireReady();
						this.onreadystatechange = null;
						this.parentNode.removeChild(this);
					}
				};
			}
		}
		// \u65E0\u8BBA\u5982\u4F55\uFF0C\u786E\u4FDD\u4E8B\u4EF6\u53EF\u4EE5\u6267\u884C\uFF0C\u800C\u4E14\u53EA\u6267\u884C\u4E00\u6B21
		Event.observe(window,"load",fireReady);
	})();

	/**\u8FD0\u884C\u51FD\u6570\u5217\u8868*/
	function fireReady(){
		if(!DOM.isReady && DOM.readyEvents){//\u786E\u4FDD\u53EA\u8FD0\u884C\u4E00\u6B21
			DOM.isReady = true;
			for (var i = 0; i < DOM.readyEvents.length; i++){
				DOM.readyEvents[i]();
			}
			/**\u6309\u7167W3C\u6807\u51C6\uFF0C\u628A\u6570\u7EC4\u7684\u957F\u5EA6\u8BBE\u7F6E\u8F83\u5C0F\u65F6\uFF0C\u672B\u5C3E\u7684\u5143\u7D20\u90FD\u4F1A\u88AB\u6E05\u9664\uFF08\u6E05\u9664\u4E8B\u4EF6\uFF09*/
			DOM.readyEvents.length = 0;
		}
	}
	return {
		/**\u53EA\u6DFB\u52A0\u4E8B\u4EF6\uFF0C\u5982\u679CDOM\u5DF2\u7ECFready\uFF0C\u5219\u53EF\u4EE5\u76F4\u63A5\u8FD0\u884C*/
		ready:function (fn){
			if(DOM.isReady){
				fn();
			}else{
				DOM.readyEvents = DOM.readyEvents || [];
				DOM.readyEvents.push(fn);
			}
		}
	}
})());
/**--ajax.js--**/
Ext.ns("Ajax.Request");
function getTransport(){
	return Try(
		function() {return new XMLHttpRequest()},
		function() {return new ActiveXObject('Msxml2.XMLHTTP')},
		function() {return new ActiveXObject('Microsoft.XMLHTTP')}
	) || false;
}
function emptyFn(){}
function ajaxRequest(fo){
	var transport = getTransport();
	var bSynSend = fo.asyn==false;
	var url = fo.url;
	var method = (fo.method || 'GET').toLowerCase();
	var parameters = fo.parameters || '';
	if (method == 'get' && parameters.length > 0)
		url += (url.match(/\?/) ? '&' : '?') + parameters;
	transport.open(method, url, !bSynSend);
	if(!bSynSend){
		var caller = this;
		var callback = function(){
			var readyState = transport.readyState;
			if (readyState != 4) return;
			if(transport.status==12029 || transport.status==12007){
				(fo.onFailure||window.NotifySystemError||emptyFn)(transport, caller);
				transport.onreadystatechange = emptyFn;
				return;
			}
			var isNotLogin = caller.header('TRSNotLogin');
			if(isNotLogin=='true'){
				if(!window.DefaultNotLogin){
					try{
						var actualTop = $MsgCenter ? $MsgCenter.getActualTop() : top;
						actualTop.location.href = WCMConstants.WCM_NOT_LOGIN_PAGE + 
							'?FromUrl=' + encodeURIComponent(actualTop.location.href);
					}catch(err){
						alert(wcm.LANG.AJAX_ALERT_3 || '\u60A8\u5DF2\u9000\u51FA\u7CFB\u7EDF\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55');
					}
				}else{
					window.DefaultNotLogin();
				}
				return;
			}
			var isError = caller.header('TRSException');
			if(caller.responseIsSuccess() && isError!='true'){
				if(fo.onSuccess)fo.onSuccess(transport, caller);
			}
			else{
				if (isError=='true'||transport.status==500){
					(fo.on500||window.ajax500||emptyFn)(transport, caller);
				}
				(fo.onFailure||window.ajaxFail||emptyFn)(transport, caller);
			}
			if(fo.onComplete)fo.onComplete(transport, caller);
			try{
				transport.onreadystatechange = emptyFn;
			}catch(err){}
		}
		transport.onreadystatechange = callback;
	}
	var requestHeaders = ['X-Requested-With', 'XMLHttpRequest'];
	if (method == 'post') {
		requestHeaders.push('Content-type', fo.contentType||'application/x-www-form-urlencoded');
		if (transport.overrideMimeType)
			requestHeaders.push('Connection', 'close');
	}
	for (var i = 0; i < requestHeaders.length; i += 2){
		transport.setRequestHeader(requestHeaders[i], requestHeaders[i+1]);
	}
	this.header = function(name) {
		return this.transport.getResponseHeader(name);
	}
	this.transport = transport;
	this.fo = fo;
	this.responseIsSuccess = function() {
		var status = this.transport.status;
		return status == undefined
		|| status == 0
		|| (status >= 200 && status < 300);
	}
	this.responseIsFailure = function() {
		return !this.responseIsSuccess();
	}
	transport.send(method=='post'?(fo.postBody||parameters):null);
	return transport;
}
Ajax.Request = function(url, opts){
	var asyn = opts['asynchronous'];
	ajaxRequest.call(this, Ext.apply({url:url, asyn:asyn==null?true:false}, opts));
}
/**--crashboard.js--**/
Ext.ns('wcm.CrashBoard', 'wcm.LANG');
var m_template = [
	'<div class="wcm-cbd" id="{0}">',
		'<div class="header l" id="header-{0}"><div class="r"><div class="c">',
			'<div class="spt"></div>',
			'<div class="title" id="dialogTitle-{0}">{1}</div>',
			'<div class="tools" id="tools-{0}">',
				'<a class="close" href="#" id="close-{0}"></a>',
			'</div>',
		'</div></div></div>',
		'<div class="body l"><div class="r"><div class="c">',
			'<table border=0 cellspacing=0 cellpadding=0 class="cb-table">',
				'<tr><td id="content-{0}">',
				'<iframe src="{2}" id="frm-{0}" style="height:100%;width:100%;"',
				' frameborder="0" onload="wcm.CrashBoard.contentLoaded(\'{0}\', this);"></iframe>',
				'</td></tr>',
				'<tr style="display:{5}"><td class="buttons" id="buttons-{0}" style="text-align:center;">',
				'<span class="wcm-btn cbd-btn-right" id="ok-{0}-wrap"><span class="cbd-btn-left"><button class="cbd-btn" id="ok-{0}"><b>{3}</b></button></span></span>',
				'<span style="display:{7}" class="wcm-btn cbd-btn-right" id="next-{0}-wrap"><span class="cbd-btn-left"><button class="cbd-btn" id="next-{0}"><b>{6}</b></button></span></span>',
				'<span class="wcm-btn cbd-btn-right"><span class="cbd-btn-left" id="cancel-{0}-wrap"><button class="cbd-btn" id="cancel-{0}"><b>{4}</b></button></span></span>',
				'</td></tr>',
			'</table>',
		'</div></div></div>',
		'<div class="footer l"><div class="r"><div class="c"></div></div></div>',
	'</div>',
].join("");
function defCrashBoard(){
	var m_id = 0;
	var cache = {};
	function $cb(cfg){
		cfg = Ext.apply({
			id : 'cb-' + (++m_id),
			title : wcm.LANG.crashborad_2011 || '\u7CFB\u7EDF\u63D0\u793A\u6846',
			appendParamsToUrl : true
		}, cfg);
		Ext.apply(this, cfg);
		this._win = window;
		cache[cfg.id] = this;
	}
	$cb.prototype = {
		getEl : function(id){
			return this._win.$(id || this.id);
		},
		onOk : function(name){
			var frm = $('frm-' + this.id), win, fn;
			try{
				win = frm.contentWindow;
				fn = name ? win[name] : win.onOk;
			}catch(err){
			}
			if(!fn)return;
			var rst = fn(this);
			if(rst===false)return;
			if(this.callback)this.callback(rst);
			this.close();
		},
		onCancel : function(){
			this.close();
		},
		show : function(){
			var t = this;
			if(t.rendered) return;
			t.rendered = true;
			var sHtml = String.format(m_template, t.id, t.title, t.url,
				t.ok || wcm.LANG.DIALOG_BTN_OK || '\u786E\u5B9A', t.cancel || wcm.LANG.DIALOG_BTN_CANCEL || '\u53D6\u6D88', t.btns==false?'none':'', t.next , t.next == undefined?'none':'');
			var div = document.createElement('DIV');
			document.body.appendChild(div);
			div.innerHTML = sHtml;
			var cbEle = t.getEl();
			cbEle.style.zIndex = window.$MsgCenter ? $MsgCenter.genId(100) : 999;
			t.getEl("cancel-" + t.id).onclick = t.getEl("close-" + t.id).onclick
				= function(){t.onCancel();return false;};
			if(this.draggable !== false) drag(cbEle, t.getEl('header-' + t.id), this.maskable);
			t.getEl("ok-" + t.id).onclick = function(event){t.onOk()};
			t.getEl("next-" + t.id).onclick = function(event){t.onOk('onNext')};
			cbEle.style.display = '';
			if(t.width) t.getEl().style.width = t.width;
			if(t.height) {			
				var dom = t.getEl('content-' + t.id);
				dom.style.height = t.height;
				dom.style.height = (dom.offsetHeight - 65) + 'px';
			}
			var ua = navigator.userAgent.toLowerCase();
			var isIE = ua.indexOf("opera") == -1 && ua.indexOf("msie") > -1;
			var isStrict = document.compatMode == "CSS1Compat";
			var docEle = isIE && !isStrict ? document.body : document.documentElement;
			var left = (docEle.clientWidth - cbEle.offsetWidth) / 2 + docEle.scrollLeft + 'px';
			var top = (docEle.clientHeight - cbEle.offsetHeight) / 2 + docEle.scrollTop + 'px';
			cbEle.style.left = t.left || left;
			cbEle.style.top = t.top || top;
			this.showShield();
		},
		hide : function(){
			this.getEl().style.display = 'none';
			this.hideShield();
		},
		initShield : function(){
			if(!this.maskable && !Ext.isIE6) return;
			if($(this.id + '-shld')) return;
			var dom = document.createElement('iframe');
			dom.src = Ext.blankUrl;
			dom.style.display = 'none';
			dom.style.border = 0;
			dom.frameBorder = 0;
			Element.addClassName(dom, 'wcm-panel-shield');
			dom.style.zIndex = this.getEl().style.zIndex - 1;
			dom.id = this.id + '-shld';
			document.body.appendChild(dom);
		},
		showShield : function(){
			if(!this.maskable && !Ext.isIE6) return;
			this.initShield();
			var dom = this.getEl();
			var oStyle = $(this.id + '-shld').style;
			if(!this.maskable){
				oStyle.left = (parseInt(dom.style.left, 10) )+"px";
				oStyle.top = (parseInt(dom.style.top, 10) + 1)+"px";
				oStyle.width = (dom.offsetWidth - 4)+"px";
				oStyle.height = (dom.offsetHeight - 4)+"px";
			}	
			oStyle.display = '';
		},
		hideShield : function(){
			if(!this.maskable && !Ext.isIE6) return;
			$(this.id + '-shld').style.display = 'none';
		},
		destroyShield : function(){
			if(!this.maskable && !Ext.isIE6) return;
			var dom = $(this.id + '-shld');
			if(!dom) return;
			dom.parentNode.removeChild(dom);
		},
		close : function(){
			try{
				var t = this;
				t.hide();
				var dom = t.getEl("content-" + t.id);
				t.getEl("frm-" + t.id).src = '';
				dom.innerHTML = "";
				t.getEl("close-" + t.id).onclick = null;	
				t.getEl("ok-" + t.id).onclick = null;
				t.getEl("cancel-" + t.id).onclick = null;
				t.getEl('header-' + t.id).onmousedown = null;
				delete cache[t.id];
				dom = t.getEl();
				dom.parentNode.parentNode.removeChild(dom.parentNode);

			}catch(err){}
		}
	};
	function $toQueryStr(params){
		if(!params)return '';
		if(typeof params!='object')return params;
		var rst = [];
		for(var nm in params){
			var v = params[nm], type = typeof v;
			if(type!='string' && type!='number' && type!='boolean')continue;
			rst.push(nm, '=', encodeURIComponent(params[nm]), '&');
		}
		return rst.join('');
	}
	wcm.CrashBoard.get = function(cfg){
		if(!cfg.appendParamsToUrl)
		cfg = Ext.apply({
			appendParamsToUrl : true
		}, cfg);
		var cjoin = cfg.url.indexOf('?')==-1 ? '?' : '&';
		if(cfg.appendParamsToUrl==true)
		cfg.url = cfg.url + cjoin + $toQueryStr(cfg.params);
		return cache[cfg.id] || (new $cb(cfg));
	}
	wcm.CrashBoard.contentLoaded = function(id, frm){
		var cb = cache[id];
		if(!cb) return;
		try{
			var win = frm.contentWindow;
			if(!win.init)return;
		}catch(err){
		}
		win.init(cb.params, cb);
	}
}
var cbGetStyle = function(){
	return window.getComputedStyle ? function(el, style){
		var cs = window.getComputedStyle(el, "");
		return cs ? cs[style] : null;
	} : function(el, style){
		return el.style[style] || el.currentStyle[style];
	}
}();
function drag(o, p, maskable){
	var id = o.id;
    p.onmousedown=function(a){
		var frm = $('frm-' + id);
		if(frm) frm.style.visibility = 'hidden';
		var sld = $(id + '-shld');
		var d=document;if(!a)a=window.event;
		var l=parseInt(cbGetStyle(o,'left'),10),t=parseInt(cbGetStyle(o,'top'),10);
		var x=a.pageX?a.pageX:a.clientX,y=a.pageY?a.pageY:a.clientY;
		if(p.setCapture)p.setCapture();
		else if(window.captureEvents)window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
		d.onmousemove=function(a){
			if(!a)a=window.event;
			if(!a.pageX)a.pageX=a.clientX;
			if(!a.pageY)a.pageY=a.clientY;
			var tx=a.pageX-x+l,ty=a.pageY-y+t;
			o.style.left=tx+"px";
			o.style.top=ty+"px";
			if(!maskable && sld){
				sld.style.left=(tx)+"px";
				sld.style.top=(ty+1)+"px";
			}
		}
		d.onmouseup=function(){
			if(frm) frm.style.visibility = 'visible';
			if(p.releaseCapture)p.releaseCapture();
			else if(window.releaseEvents)window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
			d.onmousemove=null;
			d.onmouseup=null;
		}
    }
}
defCrashBoard();
/**--bubblepanel.js--**/
//\u5192\u6CE1\u6846
Ext.ns('wcm.BubblePanel');
function defBubblePanel(){
	var contains = function(t, p){
		while(p && p.tagName!='BODY'){
			if(t==p)return true;
			p = p.parentNode;
		}
		return false;
	}

	var ua = navigator.userAgent.toLowerCase();
	var isIE = ua.indexOf("opera") == -1 && ua.indexOf("msie") > -1;
	var hide = function(ev){
		if(ev.type=='blur' && contains(this.extEl.dom, ev.blurTarget))return;
		var el = this.extEl.dom;
		BpShieldMgr.hideShield(el);
		el.style.display = 'none';
	}
	var bubble = function(p, map, render){
		var el = this.extEl.dom;
		if(map)p = map.apply(el, [p]);
		var ost = el.style;
		if(render){
			render.apply(el, [p]);
		}else if(p){
			ost.left = p[0] + 'px';
			ost.top = p[1] + 'px';
		}
		ost.display = '';
		BpShieldMgr.showShield(el);
		el.focus();
	};
	wcm.BubblePanel = function(el, fid){
		el = $(el);
		var extEl = this.extEl = Ext.get(el);
		if(isIE){
			var arr = el.getElementsByTagName("*");
			for(var i=0;i<arr.length;i++)
				arr[i].setAttribute('unselectable', 'on');
		}
		else extEl.dom.tabIndex = 100;
		extEl.on('click', hide, this);
		extEl.on('blur', hide, this);
		this.bubble = bubble;
	}
};

defBubblePanel();

var BpShieldMgr = {
	initShield : function(el){
		if(!Ext.isIE6) return;
		if($(el.id + '-shldbp')) return;
		var dom = document.createElement('iframe');
		dom.src = Ext.blankUrl;
		dom.style.display = 'none';
		dom.style.position = 'absolute';
		dom.style.zIndex = el.style.zIndex - 1;
		dom.id = el.id + '-shldbp';
		document.body.appendChild(dom);
	},
	showShield : function(el){
		if(!Ext.isIE6) return;
		this.initShield(el);
		var oStyle = $(el.id + '-shldbp').style;
		if(el.style.left)
			oStyle.left = (parseInt(el.style.left, 10))+"px";
		if(el.style.right)
			oStyle.right = (parseInt(el.style.right, 10))+"px";
		oStyle.top = (parseInt(el.style.top, 10))+"px";
		oStyle.width = (el.offsetWidth)+"px";
		oStyle.height = (el.offsetHeight)+"px";
		oStyle.display = '';
	},
	hideShield : function(el){
		if(!Ext.isIE6) return;
		$(el.id + '-shldbp').style.display = 'none';
	},
	destroyShield : function(){
		if(!Ext.isIE6) return;
		var dom = $(this.id + '-shldbp');
		if(!dom) return;
		dom.parentNode.removeChild(dom);
	}
}

/**--calendar3.js--**/
if(!window.Calendar)Calendar={};
if(!Calendar.LANG)Calendar.LANG={};
Date.parseDate = function(str, fmt) {
	var a = str.split(/\W+/), b = fmt.match(/%./g);
	var i = 0, h = {};
	for (i = 0; i < a.length; ++i) {
		if(!a[i])continue;
		h[b[i]] = parseInt(a[i], 10);
	}
	if (h['%y'] && h['%m'] && h['%d']){
		if(h['%y']<100)h['%y'] = 2000 + h['%y'];
		return new Date(h['%y'], h['%m'] - 1, h['%d'],
			h['%H']||0, h['%M']||0, h['%s']||0);
	}
	return new Date();
};
function fmt2Digit(n){
	return n>=10 ? n : '0' + n;
}
Date.prototype.format = function(fm){
	if(!fm)return "";
	var dt=this;
	fm = fm.replace(/yyyy/ig,dt.getFullYear());
	var y = "" + dt.getFullYear();
	y = y.substring(y.length-2);
	return fm.replace(/yy/ig, y)
		.replace(/mm/g,fmt2Digit(dt.getMonth()+1))
		.replace(/dd/ig,fmt2Digit(dt.getDate()))
		.replace(/hh/ig,fmt2Digit(dt.getHours()))
		.replace(/MM/g,fmt2Digit(dt.getMinutes()))
		.replace(/ss/ig,fmt2Digit(dt.getSeconds()));
}
Date.prototype.clone = function(){
	return new Date(this.getFullYear(),this.getMonth(),this.getDate(),
		this.getHours(),this.getMinutes(),this.getSeconds());
}
Date.prototype.compare = function(dt){
	if(!dt)return 1;
	var arr = ['getFullYear', 'getMonth', 'getDate'];
	for(var i=0;i<arr.length;i++){
		if(this[arr[i]]()!=dt[arr[i]]())return 1;
	}
	return 0;
}
var DateHelper =  {
	defaultRegExp : 'yyyy-mm-dd',
	RegExpLibs : {
		'yyyy-mm-dd' : /^(\d{4})-(\d{2})-(\d{2})$/,
		'yyyy/mm/dd' : /^(\d{4})\/(\d{2})\/(\d{2})$/,
		'yyyy-mm-dd HH:MM' : /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/,
		'yyyy-mm-dd HH:MM:ss' : /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}:(\d{2}))$/
	},
	check : function(_sDate, _sFormat){
		_sFormat = _sFormat || this.defaultRegExp;
		var regExp = this.RegExpLibs[_sFormat];
		if(!regExp) {
			return String.format("\u4E0D\u652F\u6301\u7684\u65E5\u671F\u683C\u5F0F[{0}]",_sFormat.toLowerCase());
		}
		var result = _sDate.match(regExp);
		if(!result){
			return String.format("[{0}]\u6CA1\u6709\u5339\u914D\u65E5\u671F\u683C\u5F0F[{1}]",_sDate, _sFormat.toLowerCase());
		}
		return this.checkRange(result);
	},
	checkRange:function(aDatePart){
		var year = parseInt(aDatePart[1], 10);
		var month = parseInt(aDatePart[2], 10);
		var day = parseInt(aDatePart[3], 10);

		if(aDatePart[4]) var hour = parseInt(aDatePart[4], 10);
		if(aDatePart[5]) var minute = parseInt(aDatePart[5], 10);
		if(aDatePart[6]) var second = parseInt(aDatePart[6], 10);
		
		if(month < 1 || month > 12){
			return Calendar.LANG['DD_ERROR_FORMATE3'] || "\u6708\u4EFD\u5E94\u8BE5\u4E3A1\u523012\u7684\u6574\u6570";   
		}
		if (day < 1 || day > 31){
			return (Calendar.LANG["DD_ERROR_FORMATE4"] || "\u6BCF\u4E2A\u6708\u7684\u5929\u6570\u5E94\u8BE5\u4E3A1\u523031\u7684\u6574\u6570"); 
		}
		if ((month==4 || month==6 || month==9 || month==11) && day==31){   
			return Calendar.LANG["DD_ERROR_FORMATE5"] || "\u8BE5\u6708\u4E0D\u5B58\u572831\u53F7";   
		}   
		if (month==2){   
			var isleap=(year % 4==0 && (year % 100 !=0 || year % 400==0));   
			if (day>29){   
				return Calendar.LANG["DD_ERROR_FORMATE6"] || "2\u6708\u6700\u591A\u670929\u5929";   
			}   
			if ((day==29) && (!isleap)){   
				return Calendar.LANG["DD_ERROR_FORMATE7"] || "\u95F0\u5E742\u6708\u624D\u670929\u5929";   
			}   
		}
		if(hour && hour<0 || hour>23){   
			return Calendar.LANG["DD_ERROR_FORMATE8"] || "\u5C0F\u65F6\u5E94\u8BE5\u662F0\u523023\u7684\u6574\u6570";   
		}   
		if(minute && minute<0 || minute>59){   
			return Calendar.LANG["DD_ERROR_FORMATE9"] || "\u5206\u5E94\u8BE5\u662F0\u523059\u7684\u6574\u6570";   
		}   
		if(second && second<0 || second>59){   
			return Calendar.LANG["DD_ERROR_FORMATE10"] || "\u79D2\u5E94\u8BE5\u662F0\u523059\u7684\u6574\u6570";  
		}
	}
};
function setFitPosition(el, point){
	var left = point[0], top = point[1];
	var right = left + 250;
	if(right >= document.body.offsetWidth){
		left = Math.max(left - 250, 0);
	}
	var bottom = top + 120;
	if(bottom >= document.body.offsetHeight){
		top = Math.max(top - 120, 0);
	}
	el.style.left = left + "px";
	el.style.top = top + "px";
}
Ext.ns('wcm.TRSCalendar');
function defTRSCalendar(){
	var m_calTemp = {
		dd : [
			'<TABLE id=cal_dp CELLSPACING=0 border=0>',
				'<TR class=DPTitle>',
					'<TD align="center"><span class=DPBtn id="py_{3}" title="{8}"><<</span>&nbsp;<span class=DPBtn id="pm_{3}" title="{5}"><</span></TD>',
					'<TD align=center colspan=4>{0}</TD>',
					'<TD align="right" colspan=2><span class=DPBtn id="nm_{3}" title="{6}">></span>&nbsp;<span class=DPBtn id="ny_{3}" title="{9}">>></span><span class=closeBtn id="cls_{3}" title="{7}">&nbsp;&nbsp;X&nbsp;</span></TD>',
				'</TR>',
				'<TR>{1}</TR>',
				'{2}',
				'{4}',
			'</TABLE>'
		].join(''),
		d3 : '<TD class=DPWeekName width="40">{0}</TD>',
		d4 : '<TR>{0}</TR>',
		d1 : '<TD class=DPCellOther>&nbsp</TD>',
		d2 : '<TD class="{1}" _date="{0}">{0}</TD>',
		d5 : '<TR><TD colspan="7" align="center" class=DPTime>{2}:&nbsp;&nbsp;<input class=DPInput id="hms_{0}" value="{1}"/></TD></TR>'
	}
	var caches = {};
	function inputBlur(event, caller){
		var inputEl = caller.input;
		if(typeof inputEl === 'string')
			inputEl = $(inputEl);
		if(!inputEl.value)return;
		var reFmt = !caller.withtime ? /^\d{4}\-\d{2}\-\d{2}$/g :
				/^\d{4}\-\d{2}\-\d{2} ([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/g;
	 
		//var reFmt = caller.dtReg || /^\d{4}\-\d{2}\-\d{2}$/g;
		var dft = caller.dtFmt || "yyyy-mm-dd";
		if(DateHelper.check(inputEl.value, dft)){
			alert(String.format('[{0}]\u65E5\u671F\u683C\u5F0F\u4E0D\u6B63\u786E[{1}!]',(inputEl.getAttribute("elname")||inputEl.getAttribute("name")||inputEl.id),DateHelper.check(inputEl.value, dft)));
			inputEl.value = new Date().format(dft);
			inputEl.select();
			inputEl.focus();
			return;
		}
		//var dt = Date.parseDate(inputEl.value, caller.fmt);
		//inputEl.value = dt.format(dft);
	}
	function handlerClick(event, caller){
		event = event || window.event || caller.fitWin.event;
		var value = caller.getValue ? caller.getValue() : $(caller.input).value;
		caller.m_cdt = value ? Date.parseDate(value, caller.fmt) : new Date();
		caller.initDDT(0, false);
		var oStyle = $('cal_dd').style;
		setFitPosition($('cal_dd'), [Event.pointerX(event), Event.pointerY(event)]);
		oStyle.display = '';
		caller.showShield();
	}
	function TRSCalendar(fo){
		Ext.apply(this, fo);
		this.fmt = !this.withtime ? '%y-%m-%d' :'%y-%m-%d %H:%M:%s';;
		var txt = $(this.input), caller = this;
		if(txt && txt.tagName=='INPUT')txt.onblur = function(event){
			inputBlur(event, caller);
		}
		if(!$(fo.handler)) return;
		$(fo.handler).onclick = function(event){
			handlerClick(event, caller);
		}
	}
	var genId = 1;
	wcm.TRSCalendar.get = function(fo){
		var id = fo.id = 'trscal-'+genId++;
		if(!caches[id])
			caches[id] = new TRSCalendar(fo);
		return caches[id];
	}
	TRSCalendar.prototype = {
		getDDTHtml : function (dt){
			var dt = dt || new Date(), hms = dt.format('HH:MM:ss');
			if(this.dtFmt == 'yyyy-mm-dd HH:MM')
				hms = dt.format('HH:MM');
			dt.setDate(1);
			var fst = dt.getDay(), m = dt.getMonth();
			var sCurrMonth = dt.format('yyyy-mm');
			var rs1 = [], dcnt = 0, rs2 = [], rs3 = [], wt = '';
			for(var i=0;i<fst;i++){
				rs1.push(m_calTemp.d1);
			}
			while(dt.getMonth()==m){
				var date = dt.getDate();
				var className = new Date().compare(dt)==0?'DPCellToday':
					(this.m_cdt.compare(dt)==0?'DPCellCurr':'DPCell');
				rs1.push(String.format(m_calTemp.d2, date, className));
				dcnt++;
				if((dcnt+fst)%7==0){
					dcnt = fst = 0;
					rs2.push(String.format(m_calTemp.d4, rs1.join('')));
					rs1 = [];
				}
				dt.setDate(date+1);
			}
			if(dcnt!=0){
				for(var i=dcnt;i<7;i++){
					rs1.push(m_calTemp.d1);
				}
				rs2.push(String.format(m_calTemp.d4, rs1.join('')));
				rs1 = [];
			}
			if(this.withtime){
				wt = String.format(m_calTemp.d5, this.id, hms, Calendar.LANG["DD_TIME"]||"\u65F6\u95F4");
			}
			var a = Calendar._SDN || ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"];
			for(var i=0;i<7;i++){
				rs3.push(String.format(m_calTemp.d3, a[i]));
			}
			var html = String.format(m_calTemp.dd,
				sCurrMonth,	rs3.join(''), rs2.join(''),
				this.id, wt, Calendar.LANG["LAST_MONTH"]||"\u4E0A\u6708", Calendar.LANG["NEXT_MONTH"]||"\u4E0B\u6708", Calendar.LANG["DD_CLOSE"]||"\u5173\u95ED",'\u4E0A\u5E74','\u4E0B\u5E74');
			return html;
		},
		initDDT : function(_dx, bYear){
			if(!_dx)this.m_tdt = this.m_cdt.clone();
			var y = this.m_tdt.getFullYear();
			var m = this.m_tdt.getMonth();
			if(bYear){
				y = y + (_dx||0);
			}else{
				m = m + (_dx||0);
			}
			this.m_tdt.setDate(1);
			this.m_tdt.setMonth(m);
			this.m_tdt.setFullYear(y);
			var calDDT = $('cal_dd');
			if(!calDDT){
				calDDT = document.createElement('DIV');
				calDDT.style.position = 'absolute';
				calDDT.style.display = 'none';
				calDDT.style.zIndex = 999;
				calDDT.id = 'cal_dd';
				document.body.appendChild(calDDT);
			}
			calDDT.innerHTML = this.getDDTHtml(this.m_tdt.clone());
			this.showShield();
			var lst_s = null;
			$('cal_dp').onclick = function(event){
				var src = Event.element(event || window.event);
				var cn = src.className;
				if(src.tagName!='TD' ||
					(cn!='DPCell' && cn!='DPCellCurr'
						&& cn!='DPCellToday'))return;
				if(lst_s)lst_s.className = "DPCell";
				src.className = "DPCellSelect";
				lst_s = src;
			}
			$('cal_dp').ondblclick = function(event){
				var m_dt = caller.m_tdt || caller.m_cdt;
				var src = Event.element(event || window.event);
				var m_dt = caller.m_tdt || caller.m_cdt;
				var cn = src.className;
				if(src.tagName!='TD' || 
					(cn!='DPCell' && cn!='DPCellCurr'
						 && cn!='DPCellToday'
						 && cn!='DPCellSelect'))
					return;
				var sdate = m_dt.getFullYear() + '-' + (m_dt.getMonth()+1)
					+ '-' + src.getAttribute("_date");
				if(caller.withtime)
					sdate += ' ' + $('hms_'+caller.id).value;
				
				caller.m_cdt = Date.parseDate(sdate, caller.fmt);
				caller.render();
				$('cal_dd').style.display = 'none';
				caller.hideShield();
			}
			var caller = this;
			$('pm_' + this.id).onclick = function(){
				caller.initDDT(-1, false);
			};
			$('nm_' + this.id).onclick = function(){
				caller.initDDT(1, false);
			};
			$('py_' + this.id).onclick = function(){
				caller.initDDT(-1, true);
			};
			$('ny_' + this.id).onclick = function(){
				caller.initDDT(1, true);
			};
			$('cls_' + this.id).onclick = function(){
				$('cal_dd').style.display = 'none';
				caller.hideShield();
			};
			if(caller.withtime){
				$('hms_'+this.id).onblur = function(event){
					var reFmt = /([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/g;
					if(caller.dtFmt == 'yyyy-mm-dd HH:MM')
						reFmt = /([0-1]\d|2[0-3]):([0-5]\d)$/g;
					if(!reFmt.test(this.value)){
						var tipMsg = Calendar.LANG["DD_TIME_FORMATE1"] || '\u65F6\u95F4\u683C\u5F0F\u4E0D\u7B26\u5408[hh:mm:ss]!';
						if(caller.dtFmt == 'yyyy-mm-dd HH:MM') tipMsg = Calendar.LANG["DD_TIME_FORMATE"] || '\u65F6\u95F4\u683C\u5F0F\u4E0D\u7B26\u5408[hh:mm]!';
						alert(tipMsg);
						caller.m_cdt = new Date();
						if(caller.dtFmt == 'yyyy-mm-dd HH:MM') this.value = new Date().format("HH:MM");
						else this.value = new Date().format("HH:MM:ss");
						caller.render();
						this.select();
						return;
					}
				}
				$('hms_'+this.id).onkeydown = function(event){
					event = window.event || event;
					if(event.keyCode != 13) return;				
					var m_dt = caller.m_cdt;
					var date = m_dt.getDate();
					if(lst_s != null) date = lst_s.getAttribute("_date");
					var sdate = m_dt.getFullYear() + '-' + (m_dt.getMonth()+1) + '-' + date;
					sdate += ' ' + $('hms_'+caller.id).value;
					caller.m_cdt = Date.parseDate(sdate, caller.fmt);
					caller.render();
					$('cal_dd').style.display = 'none';
					caller.hideShield();
				}
			}
		},
		initShield : function(){
			if($('cal_dd_shld')) return;
			var dom = document.createElement('iframe');
			dom.src = Ext.blankUrl;
			dom.style.display = 'none';
			dom.style.position = 'absolute';
			dom.style.zIndex = 998;
			dom.style.border = '0';
			dom.id = 'cal_dd_shld';
			document.body.appendChild(dom);
		},
		showShield : function(){
			this.initShield();
			var cal = $('cal_dd');
			var oStyle = $('cal_dd_shld').style;
			oStyle.left = cal.style.left;
			oStyle.top = cal.style.top;
			oStyle.width = cal.offsetWidth;
			oStyle.height = cal.offsetHeight;
			oStyle.display = '';
		},
		hideShield : function(){
			$('cal_dd_shld').style.display = 'none';
		},
		render : function(){
			var dt = this.m_cdt, el = $(this.input);
			var rst = dt.format(this.dtFmt || "yyyy-mm-dd");
			if(this.setValue)return this.setValue(rst);
			if(el){
				el.value = rst;
				el.focus();
				el.blur();
			}
		}
	};	
}
defTRSCalendar();
/**--position.js--**/
//\u5B9A\u4F4D
var camelRe = /(-[a-z])/gi, propCache = {};
var camelFn = function(m, a){ return a.charAt(1).toUpperCase(); };
function getStyle(el, prop){
	var view = document.defaultView;
	var v, cs, camel;
	if(view && view.getComputedStyle){
		if(prop == 'float')prop = "cssFloat";
		if(v = el.style[prop])return v;
		if(cs = view.getComputedStyle(el, "")){
			if(!(camel = propCache[prop])){
				camel = propCache[prop] = prop.replace(camelRe, camelFn);
			}
			return cs[camel];
		}
		return null;
	}
	if(prop == 'float')prop = "styleFloat";
	if(!(camel = propCache[prop])){
		camel = propCache[prop] = prop.replace(camelRe, camelFn);
	}
	if(v = el.style[camel])return v;
	if(cs = el.currentStyle)return cs[camel];
	return null;
}
var Position = {
	page: function(oriEl) {
		var t = 0, l = 0;
		var el = oriEl;
		do {
			t += el.offsetTop  || 0;
			l += el.offsetLeft || 0;
			if (el.offsetParent==document.body
				&& getStyle(el, 'position')=='absolute') break;
		} while (el = el.offsetParent);
		el = oriEl;
		do {
			t -= el.scrollTop  || 0;
			l -= el.scrollLeft || 0;
		} while (el = el.parentNode);
		return [l, t];
	},
	offsetParent: function(el) {
		if (el.offsetParent) return el.offsetParent;
		var bd = document.body;
		if (el == bd) return el;
		while ((el = el.parentNode) && el != bd){
			var ps = getStyle(el, 'position');
			if (ps == 'relative' ||  ps== 'absolute')continue;
			return el;
		}
		return bd;
	},
	clone: function(es, et, cfg) {
		cfg = Object.extend({
			setLeft:    true,
			setTop:     true,
			setWidth:   true,
			setHeight:  true,
			offsetTop:  0,
			offsetLeft: 0
		}, cfg || {})
		es = $(es);
		var p = Position.page(es);
		et = $(et);
		var delta = [0, 0];
		var parent = null;
		if (getStyle(et, 'position') == 'absolute') {
			parent = Position.offsetParent(et);
			delta = Position.page(parent);
		}
		var bd = document.body;
		if (parent == bd) {
			delta[0] -= bd.offsetLeft;
			delta[1] -= bd.offsetTop;
		}
		var o = et.style;
		if(cfg.setLeft)   o.left  = (p[0] - delta[0] + cfg.offsetLeft) + 'px';
		if(cfg.setTop)    o.top   = (p[1] - delta[1] + cfg.offsetTop) + 'px';
		if(cfg.setWidth)  o.width = es.offsetWidth + 'px';
		if(cfg.setHeight) o.height = es.offsetHeight + 'px';
	}
}
/**--xmlhelper.js--**/
if ( window.DOMParser &&
	  window.XMLSerializer &&
	  window.Node && Node.prototype && Node.prototype.__defineGetter__ ) {
   if (!Document.prototype.loadXML) {
      Document.prototype.loadXML = function (s) {
         var doc2 = (new DOMParser()).parseFromString(s, "text/xml");
         while (this.hasChildNodes())
            this.removeChild(this.lastChild);
         for (var i = 0; i < doc2.childNodes.length; i++) {
            this.appendChild(this.importNode(doc2.childNodes[i], true));
         }
      };
	}
	Document.prototype.__defineGetter__( "xml", function () {
	   return (new XMLSerializer()).serializeToString(this);
	});
}
function loadXml(str){
	var doc = Try(
	  function() {return new ActiveXObject('Microsoft.XMLDOM');},
	  function() {return document.implementation.createDocument("","",null);}
	);
	doc.loadXML(str);
	return doc;
}
var XmlHelper = {
	_xvalue : function(xNode) {
		if(!xNode)return null;
		var v = xNode.nodeValue;
		if(v!= null)return v;
		var s = xNode.childNodes, nm;
		if(s.length == 0)return "";
		var rst = null, h = false;
		for(var i=0; i<s.length; i++) {
			nm = s[i].nodeName;
			if(nm == "#text" && s[i].nodeValue)
				return s[i].nodeValue;
			if(nm == "#text") rst = "";
			if(nm == "#cdata-section")
				return s[i].nodeValue || '';
			h = true;
		}
		return h ? null : rst;
	},
	_xchild : function(xNode, nm){
		var s = xNode.childNodes;
		for(var j=0,n=s.length; j<n; j++) {
			if(s[j].nodeName == nm)return s[j];
		}
	},
	queryNodes : function(xNode, xp){
		if(!xNode || !xp)return [];
		var cxp = this.xpath(xNode);
		var len = cxp.length;
		if(len>xp.length)return [];
		var rst = [];
		xp = xp.substring(len==0?0:len+1);
		var arr = xp.split("/");
		var t = xNode;
		for(var i=0; i<arr.length-1; i++) {
			t = this._xchild(t, arr[i]);
			if(t==null)break;
		}
		if(t == null)
			return rst;
		var s = t.childNodes;
		for(var i=0,n=s.length; i<n; i++) {
			if(s[i].nodeName == arr[arr.length-1]) {
				rst.push(s[i]);
			}
		}
		return rst;
	},
	xpath : function(xNode) {
		var rst = [];
		var t = xNode;
		while(t) {
			if(!t.nodeName || !t.parentNode || t.parentNode.nodeType == 9)break;
			rst.push(t.nodeName);
			t = t.parentNode;
		}
		return rst.join('/');
	}
}
function xmlTextNode(xmlDoc, value){
	if(value.match(/<!\[CDATA\[|\]\]>/img))
		return xmlDoc.createTextNode(value);
	return xmlDoc.createCDATASection(value);
}
function jsonIntoEle(xmlDoc, parent, json, bAlwaysNode){
	if(json==null || typeof json!='object')return;
	if(Array.isArray(json)){
		var arr = [];
		for(var i=0,n=json.length;i<n;i++){
			var value = json[i];
			if(value==null)continue;
			if(typeof value!='object'){
				arr.push(value);
				continue;
			}
			var newEle = parent;
			if(i!=0){
				newEle = xmlDoc.createElement(parent.nodeName);
				parent.parentNode.appendChild(newEle);
			}
			jsonIntoEle(xmlDoc, newEle, value);
			continue;
		}
		if(arr.length>0){
			parent.appendChild(xmlTextNode(xmlDoc, arr.join()));
		}
		return;
	}
	for(var name in json){
		if(!name)continue;
		var value = json[name];
		if(value==null)continue;
		if(typeof value=='object'){
			var newEle = xmlDoc.createElement(name);
			parent.appendChild(newEle);
			jsonIntoEle(xmlDoc, newEle, value);
			continue;
		}
		value = '' + value;
		if(!bAlwaysNode && name.toUpperCase()!='NODEVALUE'){
			parent.setAttribute(name, value);
			continue;
		}
		var elChild = xmlTextNode(xmlDoc, value);
		if(name.toUpperCase()=='NODEVALUE'){
			parent.appendChild(elChild);
			continue;
		}
		var newEle = xmlDoc.createElement(name);
		parent.appendChild(newEle);
		newEle.appendChild(elChild);
	}
}

/**--parsexml.js--**/
function parseXml(xml){
	var root = xml.documentElement;
	if(root == null) return null;
	var vReturn = {}, json = parseElement(root);
	vReturn[root.nodeName] = json;
	return vReturn;
}
function parseElement(ele){
	if(ele == null)return null;
	var json = {}, attrs = ele.attributes, hasValue = false;
	for(var i=0;attrs && i<attrs.length;i++){
		hasValue = true;
		json[attrs[i].nodeName] = attrs[i].nodeValue.trim();
	}
	var childs = ele.childNodes;
	for(var i=0;childs&&i<childs.length;i++){
		var ndn = childs[i].nodeName.toUpperCase();
		switch(ndn){
			case '#TEXT':
			case '#CDATA-SECTION':
				if(!hasValue)return childs[i].nodeValue.trim();
				hasValue = true;
				json['NODEVALUE'] = childs[i].nodeValue.trim();
				break;
			case '#COMMENT':
				break;
			default:
				hasValue = true;
				var a = json[ndn], b = parseElement(childs[i]);
				if(!a)json[ndn] = b;
				else if(Array.isArray(a))a.push(b);
				else json[ndn] = [a, b];
		}
	}
	if(!hasValue)return '';
	return json;
}

/**--processbar.js--**/
Event.observe(window, 'load', function(){
	if($('processbar'))return;
	var div = document.createElement('DIV');
	document.body.appendChild(div);
	div.id = 'processbar';
	div.style.display = 'none';
	div.innerHTML = [
		'<div id=pb_cv class=pb_cv></div>',
		'<div class=pb_to>',
			'<table class=pb_tb border=1 bordercolor=#000 bordercolordark=#fff ',
			' cellspacing=0 cellpadding=0 style="font-size:12px">',
			'<tr><td height=22 align=center bgcolor="#BBBBBB" style="font-size:14px;">',
				wcm.LANG['WCM_WELCOME'] || '\u6B22\u8FCE\u60A8\u4F7F\u7528TRS WCM\u7CFB\u7EDF','</td></tr>',
			'<tr><td align=center bgcolor=#DDDDDD>',
			String.format("\u6B63\u5728{0},\u8BF7\u8010\u5FC3\u7B49\u5019.", '<span id=pb_ev></span>'),
			'<br><br>','\u7B49\u5F85\u65F6\u95F4\uFF1A','<span style="color:red"><span id=pb_wt>0</span>','\u79D2','</span>',
			'<div style=\"padding:10px;\">\u5982\u679C\u7CFB\u7EDF\u957F\u65F6\u95F4\u65E0\u6CD5\u54CD\u5E94,\u8BF7<a href=\"#\" id=\"pb_closer\" onclick=\"ProcessBar.close();return false;\">',
			'<span style=\"color:red;\">\u70B9\u51FB\u8FD9\u91CC</span></a>\u8FD4\u56DE\u4E3B\u9875\u9762</div>',		
			'</td></tr></table>',
		'</div>',
		'</div>'
	].join('');
});
var ProcessBar = function(){
	var m_itv_pb;//\u5B9A\u4E49\u79C1\u6709 \u53D8\u91CF\u7684\u4E00\u79CD\u65B9\u5F0F\uFF0C\u8FD9\u91CC\u9700\u8981\u76F4\u63A5\u4F7F\u7528\u5C40\u90E8\u53D8\u91CF\uFF0C\u907F\u514Dm_itv_pb\u6210\u4E3A\u5168\u5C40\u53D8\u91CF\u4EA7\u751F\u53D8\u91CF\u6C61\u67D3
	return {
		m_lStart : 0,
		start : function(title){
			Element.show('processbar');
			document.body.scrollTop = 0;
			$('pb_ev').innerHTML = title;
			var lStart = this.m_lStart || new Date().getTime();
			this.m_lStart = lStart;
			m_itv_pb = setInterval(function(){
				var lNow = new Date().getTime();
				var elisTime = parseInt((lNow - lStart)/ 1000, 10);
				$('pb_wt').innerHTML = elisTime;
				if(elisTime>300){
					alert(wcm.LANG['EASY_SERVER_OVER'] || "\u6267\u884C\u65F6\u95F4\u8D85\u51FA\u5E38\u89C4\u65F6\u95F4\uFF0C"
						+ wcm.LANG['EASY_SERVER_ERROR'] || "\u53EF\u80FD\u51FA\u73B0\u7F51\u7EDC\u6545\u969C\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u65B0\u5904\u7406\u3002");
					ProcessBar.close();
				}
			}, 100);
			$('pb_cv').style.height = document.body.scrollHeight;
		},
		exit :function(){
			Element.hide('processbar');
			clearInterval(m_itv_pb);
			m_itv_pb = null;
		},
		close :function(){
			if(!m_itv_pb) return;//\u5C1A\u672A\u8C03\u7528\u8FC7start\u65B9\u6CD5\u8FDB\u884C\u521D\u59CB\u5316
			this.m_lStart = null;
			Element.hide('processbar');
			clearInterval(m_itv_pb);
			m_itv_pb = null;
		}
	}
}();
