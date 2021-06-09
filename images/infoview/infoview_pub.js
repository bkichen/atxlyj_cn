/**--infoview_pub.js--**/
/**--infoview_pub.js--**/
Ext.ns('wcm.LANG');
var ua = navigator.userAgent.toLowerCase();
var isSafari = (/webkit|khtml/).test(ua),
	isGecko = !isSafari && ua.indexOf("gecko") > -1;
var m_readFileUrl, m_fileUploadDowithUrl;
var m_sRootPath = '../images/infoview/';
PgC = {
	initFrmAction : function(){
		var frmAction = $('frmAction');
		m_sRootPath = frmAction.resourcebase.value;
		var currDocId = getParameter("documentId") || 0;
		frmAction.DocumentId.value = currDocId;
		m_fileUploadDowithUrl = frmAction.fileuploadurl.value;
		
		m_readFileUrl = frmAction.readfileurl.value + '?FileName=';

		if(currDocId > 0){
			m_readFileUrl = m_readFileUrl.replace(/file_server_read\.jsp\?/, 'file_server_read_from_wcm.jsp?')
		}
		Event.observe('SubmitButton', 'click', function(){
			var frm = $('frmAction');
			window._databeforeSubmit = {};
			if(exCenter._beforeSubmit(window._databeforeSubmit)===false)return;
			if(frm.OnlyCached != null){
				InfoDocHelper.renderSubmit(frm.OnlyCached.value == 'true');
			}else{
				InfoDocHelper.renderSubmit();
			}
		});
		if($('ResetButton')){
			Event.observe('ResetButton', 'click', function(){
				var arr = document.body.getElementsByTagName('*'), toRemoves = [];
				for(var i=0, n=arr.length; i<n; i++){
					var el = arr[i], id = el.id;
					var xp = el.getAttribute('trs_temp_id', 2);
					var elType = el.getAttribute('element-type', 2);
					if(xp && elType) EleHelper.setDefaultValue(el);
					if(!xp || (elType!=3 && elType!=4 && elType!=5))continue;
					if(xp!=id)toRemoves.push(el);
				}
				for(var i=0, n=toRemoves.length; i<n; i++){
					try{
						toRemoves[i].parentNode.removeChild(toRemoves[i]);
					}catch(e){}
				}
				PgC.initPage();
			});
		}
	},
	getBinding : function(bind, json, el){
		var v = json[bind.toUpperCase()];
		return v==null ? '' : v;
	},
	initPage : function(fn){
		var frmAction = $('frmAction');
		var xmlEl = frmAction.DataXML || frmAction.ObjectXML;
		if(!frmAction.GateWayInit){
			XmlDataHelper.initData(xmlEl.value);
			if(fn)fn();
			return;
		}
		this._gatewayInit(frmAction.GateWayInit.value, function(xml, json){
			if(xml){
				XmlDataHelper.initData(xml);
			}
			if(json){
				var arr = document.body.getElementsByTagName('*');
				for(var i=0, n=arr.length; i<n; i++){
					var el = arr[i];
					if(!el.getAttribute('infodoc_data'))continue;
					var bind = el.getAttribute('gateway_binding');
					if(bind)EleHelper.setValue(el, PgC.getBinding(bind, json, el));
				}
			}
			if(!xml && frmAction.NeedInit.value == 'true'){
				XmlDataHelper.initData(xmlEl.value, true);
			}
			if(fn)fn();
		}, fn);
	},
	_gatewayInit : function(url, callback, fn) {
		if(!url)return;
		var c = url.indexOf('?')!=-1 ? '&' : '?', frm = $('frmAction');
		url = [
			url, c, location.search.substring(1)||'r=1',
			'&siteid=', frm.SiteId.value, '&channelid=', frm.ChannelId.value,
			'&infoviewid=', frm.InfoViewId.value
		].join('');
		window.GateWayCallBack = function(t, mode){
			switch(mode){
				case 'CACHED_DATA' :
					if(callback)(callback)(t.trim());
					break;
				case 'USERINFO'	:
					var json = parseXml(loadXml(t));
					if(callback)(callback)(null, json['USERINFO']);
					break;
				case 'NIL':
					if(callback)(callback)();
					break;
				case 'EDIT_DATA' : 
					if(callback)(callback)(t.trim());
					break;
				case 'NEED_LOGIN':
					try{
						var loginEl = frmAction.GATEWAYLOGIN;
						if(!loginEl)return;
						var cb = wcm.CrashBoard.get({
							id : 'Trs_Gateway_Login',
							title : '\u8BE5\u8868\u5355\u9700\u8981\u767B\u5F55',
							params : {
								src : loginEl.value
							},
							url : m_sRootPath + 'login.html',
							callback : function(_args){
								PgC.initPage(fn);
							},
							width:'240px',
							height:'305px',
							btns : false
						});
						cb.show();
					}catch(err){
						alert('\u8BE5\u8868\u5355\u9700\u8981\u767B\u5F55\u540E\u624D\u80FD\u586B\u62A5\uFF01\u8BF7\u5148\u767B\u5F55\u3002');
					}
					break;
				case 'EXCEPTION' :
					break;
			}
		}
		window.InfoviewConfigInfo = function(conf){			
			conf = eval('('+conf+')');
			var isNeedVerifyCode = conf.isNeedVerifyCode;				
			var inputEl = document.getElementById("bIsVerifyCode");				
			if(!inputEl){
				inputEl = document.createElement("input");
				inputEl.type = "hidden";
				inputEl.id = "bIsVerifyCode";
				inputEl.name = "bIsVerifyCode";
				inputEl.value = "true";
				frmAction.appendChild(inputEl);
			}
			if(isNeedVerifyCode == false){
				inputEl.value = "false";
			}
		}
		var el = document.createElement("SCRIPT");
		el.src = url.replace(/initpage\.jsp\?/, 'initpage2.jsp?');
		document.body.appendChild(el);

		var verifyEl = document.createElement("SCRIPT");
		verifyEl.src = url.replace(/initpage\.jsp\?/, 'infoview_conf_info.jsp?');
		document.body.appendChild(verifyEl);
	},
	attach_file : function(ev, tg){
		var xp = tg.getAttribute('_tgid', 2);
		var el = $(xp);
		PgC.appendFileForEl(el);
	},
	append_file : function(ev, tg){
		PgC.attach_file(ev, tg);
	},
	open_file : function(ev, tg){
		var xp = tg.getAttribute('_tgid', 2);
		var el = $(xp);
		if(!el)return;
		var file = EleHelper.getFile(el, true);
		if(file.FileName!=null && file.FileName!=''){
			window.open(m_readFileUrl + file.FileName + '&DownName=' + encodeURIComponent(file.FileDesc));
			return;
		}
	},
	remove_file : function(ev, tg){
		var xp = tg.getAttribute('_tgid', 2);
		var el = $(xp);
		if(!el)return;
		var bIsAppend = el.getAttribute('trs_temp_id', 2)!=xp && el.id != xp;
		if(bIsAppend){
			el.parentNode.removeChild(el);
			return;
		}
		EleHelper.setValue(el, '', {FileDesc:''});
	},
	appendFileForEl : function(el){
		if(!el)return;
		InfoDocHelper.attachFile({
			params : {
				AllowExt : el.getAttribute('allow_ext', 2),
				InlineImg : el.getAttribute('trs_file_upload_type', 2) == 'InlineImage',
				DowithUrl : m_fileUploadDowithUrl
			},
			callback : function(_args){
				var file = _args[0], fileDesc = _args[1] || file;
				var currFile = EleHelper.getFile(el);
				if(currFile){
					var newEl = el.cloneNode(true);
					newEl.id = el.id + '_' + new Date().getTime();
					el.parentNode.insertBefore(newEl, el.nextSibling);
					el = newEl;
				}
				EleHelper.setValue(el, file, {FileDesc:fileDesc});
			}
		});
	},
	openFileOrAppend : function(exEv, el){
		if(!el)return;
		var xct = el.getAttribute("xd:xctname", 2);
		if(!xct)el = el.parentNode;
		var file = EleHelper.getFile(el, true);
		if(file && file.FileName!=null && file.FileName!=''){
			window.open(m_readFileUrl + file.FileName + '&DownName=' + encodeURIComponent(file.FileDesc));
			return;
		}
		else PgC.appendFileForEl(el);
	},
	repeat_insert1 : function(ev, tg, end){
		var xp = tg.getAttribute('_tgid', 2);
		var el = $(xp);
		if(!el)return;
		var newEl = el.cloneNode(true);
		newEl.id = el.name + '_' + new Date().getTime();
		var els = newEl.getElementsByTagName("*");
		for(i=0; i<els.length;i++){
			var currEl = els[i];
			this.renameRepeatId(currEl);
			var currElXctName = currEl.getAttribute('xd:xctname',2);
			if(!currElXctName)continue;
			
			if(currElXctName == 'DTPicker_DTText'){
				
				if(!currEl.disabled){
					makeDateCalendarRule(currEl);
				}
			}
			if(currElXctName == 'RichText'){
				
if(!currEl.disabled){

					makeTextEditorRule(currEl);
	
				}

			}

		}
		el.parentNode.insertBefore(newEl, end ? el.nextSibling : el);
		EleHelper.setValue(newEl, '');
		exCenter._afterModify(newEl);
	},
	repeat_insert2 : function(ev, tg){
		this.repeat_insert1(ev, tg, true);
	},
	repeat_remove : function(ev, tg){
		var xp = tg.getAttribute('_tgid', 2);
		var el = $(xp);
		if(!el)return;
		var bIsAppend = el.getAttribute('trs_temp_id', 2)!=xp;
		if(bIsAppend){
			el.parentNode.removeChild(el);
			return;
		}
		EleHelper.setValue(el, '');
	},
	renameRepeatId : function(el){
		var id = el.id;
		if(!id || $(id) == el) return el;
		el.id = id +"_"+(new Date().getTime());
	},
	flys : function(elType, el){
		var rst;
		if(elType==5){
			var isImg = el.getAttribute('is-image', 2)=='1';
			var file = EleHelper.getFile(el);
			rst = [{
					action : file ? 'append_file' : 'attach_file',
					name : '\u9644\u52A0...',
					desc : isImg?'\u4E0A\u4F20\u56FE\u7247':'\u4E0A\u4F20\u9644\u4EF6'
				}];
			if(file){
				rst.push({
						action : 'open_file',
						name : isImg?'\u67E5\u770B\u56FE\u7247':'\u6253\u5F00\u9644\u4EF6'
					},{
						action : 'remove_file',
						name : '\u5220\u9664',
						desc : isImg? '\u79FB\u9664\u56FE\u7247':'\u79FB\u9664\u9644\u4EF6'
					}
				);
			}
		}
		else if(elType==4 || elType==3){
			if(el.getAttribute('trs_readonly_field', 2)=='1' || el.getAttribute('trs_backreadonly_field', 2)=='1')
				return null;
			var sInsert = el.getAttribute("trs_xCollection_insert", 2)||'';
			sInsert = sInsert.replace(/^Insert\s*(.*?)\s*$/ig, '\u5728$1\u5F53\u524D\u884C\u63D2\u5165');
			var sInsertBefore = el.getAttribute("trs_xCollection_insertBefore", 2)||'';
			sInsertBefore = sInsertBefore.replace(/^Insert\s*(.*?)\s*Above$/ig, '\u5728$1\u5F53\u524D\u884C\u524D\u63D2\u5165');
			var sInsertAfter = el.getAttribute("trs_xCollection_insertAfter", 2)||'';
			sInsertAfter = sInsertAfter.replace(/^Insert\s*(.*?)\s*Below$/ig, '\u5728$1\u5F53\u524D\u884C\u540E\u63D2\u5165');
			var sRemove = el.getAttribute("trs_xCollection_remove", 2)||'';
			sRemove = sRemove.replace(/^Remove\s*(.*?)\s*$/ig, '\u5220\u9664$1\u5F53\u524D\u884C');
			rst = [{
					action : 'repeat_insert1',
					name : '\u5728\u524D\u9762\u6DFB\u52A0',
					desc : sInsertBefore
				},
				{
					action : 'repeat_insert2',
					name : '\u5728\u540E\u9762\u6DFB\u52A0',
					desc : sInsertAfter
				},{
					action : 'repeat_remove',
					name : '\u5220\u9664',
					desc : sRemove
				}
			];
		}
		return rst;
	},
	flyItem : '<DIV class="menuitem" unselectable="on" _action="{1}" _tgid="{0}" title="{3}">{2}</DIV>',
	buildMenu : function(items, tg){
		var rst = [];
		for(var i=0, n=items.length; i<n; i++){
			var t = items[i];
			rst.push(String.format(PgC.flyItem, tg.id, t.action, t.name, t.desc));
		}
		return rst.join('');
	},
	borderFx : function(el, undo){
		if(el.getAttribute('trs_readonly_field', 2)=='1')return;
		var nElType = el.getAttribute('element-type', 2);
		if(nElType==13)return;
		if(nElType==11)el = el.parentNode;
		Element[undo?'removeClassName':'addClassName'](el, 'xct-hover');
	},
	flyBtnFx : function(ev, el, undo){
		el = findItem(el, false, 'fly-button');
		if(!el)return;
		var fb = $('fly-button');
		if(undo){
			fb.style.display = 'none';
			fb.cfg = '';
			return;
		}
		var eid = el.getAttribute('trs_temp_id', 2);
		if(fb.cfg && fb.cfg.id == eid 
			&& fb.style.display!='none')return;
		var p = ev.pointer;
		Position.clone(el, fb, {
			setWidth:   false,
			setHeight:  false,
			offsetTop:  2,
			offsetLeft: 2
		});
		var nElType = el.getAttribute('element-type', 2);
		fb.style.display = '';
		fb.cfg = {
			id : eid,
			elType : nElType,
			el : el
		};
	},
	openeditor : function(ev, el){
		var xp = el.getAttribute('trs_temp_id', 2);
		var myEl = $(xp);
		if(!myEl)return;
		if(myEl.tagName=='IFRAME'){
			html = myEl.contentWindow.document.body.innerHTML;
		}
		else html = myEl.innerHTML;
		InfoDocHelper.openeditor({
			html : html,
			callback : function(a, b){
				var myEl = $(xp);
				if(myEl.tagName=='IFRAME'){
					myEl.contentWindow.document.body.innerHTML = a;
				}
				else myEl.innerHTML = a;
			}
		});
	}
};
var _TransRule_ = {
	xct : 'xd:xctname',
	Rules : {},
	save : function(tag, xct, m) {
		tag = tag.toLowerCase();
		var l = this.Rules[tag];
		this.Rules[tag] = l = l || {};
		l[xct.toLowerCase()] = m;
	},
	doTrans : function(el, args) {
		var tag = el.tagName;
		if(!tag)return false;
		var xct = el.getAttribute(this.xct, 2);
		if(!xct)return false;
		xct = xct.toLowerCase();
		var l = this.Rules[tag.toLowerCase()];
		if(!l || !l[xct])return;
		el = l[xct](el, args) || el;
		if(!el.id)el.id = el.getAttribute('trs_temp_id', 2);
		this.initDefaultValue(el);
	},
	initDefaultValue : function(nd){
		var nElType = nd.getAttribute('element-type', 2);
		var v = nd.getAttribute('default_value', 2);
		var reVarName = /^\$\$(.*)\$\$$/;
		if(!v || reVarName.test(v))return;
		EleHelper.setValue(nd, v);
	},
	mustDoCaches : [],
	pushToMustDoCaches : function(item){
		this.mustDoCaches.push(item);
	},
	removeMustDoCaches : function(){
		this.mustDoCaches = [];
	},
	getMustDoCaches : function(){
		return this.mustDoCaches;
	},
	_MustDoSpan : function(){
		var sp = document.createElement("SPAN");
		sp.className = 'must_fill';
		sp.innerHTML = '*';
		return sp;
	},
	NotifyMustFill : function(nd, os){
		var spid = nd.getAttribute('trs_obj_id', 2) + "_mustfill";
		if(nd.getAttribute("not_null", 2) == "1"){
			if($(spid)){
				Element.show(spid);
				return;
			}
			var sp = this._MustDoSpan();
			this.pushToMustDoCaches([nd, sp, os]);
			sp.id = spid;
			document.body.appendChild(sp);
			Position.clone(nd, sp, {
				setWidth : false,
				setHeight : false,
				offsetLeft : nd.offsetWidth,
				offsetTop : 5
			});
			for(var n in os){
				sp.style[n] = os[n];
			}
		}
		else if($(spid)){
			Element.hide(spid);
		}
	},
	appendExTool : function(nd, sp, os){
		os = Object.extend({
			exTool : 1
		}, os);
		this.pushToMustDoCaches([nd, sp, os]);
		sp.className = 'ex-tool';
		sp.setAttribute('_fxType', 'ex-tool');
		document.body.appendChild(sp);
		Position.clone(nd, sp, {
			setWidth : false,
			setHeight : false,
			offsetLeft : -15,
			offsetTop : 5
		});
		for(var n in os){
			sp.style[n] = os[n];
		}
	}
};
var InfoDocHelper = {
	openeditor : function(info){
		var cb = wcm.CrashBoard.get({
			id : 'Trs_Simple_Editor',
			title: '\u683C\u5F0F\u6587\u672C\u7F16\u8F91\u5668',
			url : m_sRootPath + 'infoview_editor.html',
			params : {
				html : info.html,
				faceUrl : m_sRootPath
			},
			width:'500px',
			height:'345px',
			callback : function(html, text){
				info.callback(html, text);
			},
			appendParamsToUrl : false
		});
		cb.show();
	},
	attachFile : function(info){
		var cb = wcm.CrashBoard.get({
			id : 'FileUploadDialog',
			title: '\u4E0A\u4F20\u6587\u4EF6',
			url : m_sRootPath + 'file_upload.html',
			params : info.params,
			width:'420px',
			height:'140px',
			callback : function(args){
				info.callback(args);
			},
			btns : false
		});
		cb.show();
	},
	displayVerify : function(verifyURL, validVerifycodeURL){
		var cb = wcm.CrashBoard.get({
			id : 'VerifyCodeDialog',
			title: '\u8BF7\u586B\u5199\u6821\u9A8C\u7801',
			url : m_sRootPath + "infoview_verify_code.htm",
			params : {VerifyURL:verifyURL,ValidVerifycodeURL:validVerifycodeURL},
			width:'240px',
			height:'170px',
			callback : function(args){
				var frm = $('frmAction');
				if(frm.OnlyCached != null && frm.OnlyCached.value == 'true'){
					InfoDocHelper.onlyCachedSubmit(args || "", 'true');
				}else{
					InfoDocHelper.doSubmit(args || "");
				}
			}
		});
		cb.show();
	},
	renderSubmit : function(_bJustCached){
		var frmAction = $('frmAction');
		if(frmAction.JustCached != null) {
			frmAction.JustCached.value = (_bJustCached == 'true') ? 1 : 0;
		}
		var isVerifyCodeEl = frmAction.bIsVerifyCode;
		if(!isVerifyCodeEl){
			alert("\u65E0\u6CD5\u8FDE\u63A5\u5230infogate\uFF0C\u8BF7\u68C0\u67E5infogate\u5E94\u7528\u662F\u5426\u542F\u52A8\uFF01");
			return;
		}
		var isVerifyCode = frmAction.bIsVerifyCode.value ;	
		if(!(_bJustCached == 'true') && isVerifyCode == 'true'){
				InfoDocHelper.displayVerify(frmAction.verifycodeurl.value, frmAction.ValidVerifycodeUrl.value);
				return;
		}
		
		this.doSubmit(null, _bJustCached);
	},
	onlyCachedSubmit : function(_sVerifyCode, _bJustCached){
		var frmAction = $('frmAction');
		if(frmAction.JustCached != null) {
			frmAction.JustCached.value = (_bJustCached == 'true') ? 1 : 0;
		}
		alert(_sVerifyCode);
		this.doSubmit(_sVerifyCode, _bJustCached);
	},
	doSubmit : function(_sVerifyCode, _bJustCached) {
		if(_bJustCached == 'true') ProcessBar.start('\u4FDD\u5B58\u8868\u5355\u6570\u636E');
		else ProcessBar.start('\u63D0\u4EA4\u8868\u5355\u6570\u636E');
		if(frmAction.verifycode != null) {
			frmAction.verifycode.value = _sVerifyCode;
		}
		frmAction.ObjectXML.value = XmlDataHelper.fetchData();
		frmAction.NeedInit.value = 'true';
		frmAction.method = "post";
		var nCachedInfoviewId = parseInt(getParameter('cachedinfoviewid'), 10);
		if(nCachedInfoviewId > 0 && frmAction.CachedInfoviewId) {
			frmAction.CachedInfoviewId.value = nCachedInfoviewId;
			frmAction.bIsVerifyCode.value = "false";
		}
		frmAction.submit();
	}
};
function copyAttrs(src, tg){
	var attrs = src.attributes;
	for(var i=0; i<attrs.length; i++) {
		if(!attrs[i].specified)continue;
		if(attrs[i].name == "style"){
			tg.style.cssText = src.style.cssText;
			continue;
		}
		tg.setAttribute(attrs[i].name, attrs[i].value);
	}
	tg.className = src.className;
	tg.style.height = src.offsetHeight + 'px';
	tg.style.width = src.offsetWidth + 'px';
	if(Ext.isIE)return;
	//if(tg.tagName == 'TEXTAREA' || tg.TagName == 'INPUT')
	//tg.style.width = src.offsetWidth + 25 + 'px';
}
function disableInput(rp){
	rp.readOnly = true;
	rp.disabled = true;
	rp.style.backgroundColor = '#ECECEC';
}
_TransRule_.save("span", "PlainText", function(nd, only) {
	var nHeight = parseInt(nd.style.height, 10);
	if(isNaN(nHeight))nHeight = 0;
	var isTextArea = nHeight > 30;
	nd.setAttribute('infodoc_data', 1);
	nd.setAttribute("element-type", isTextArea?2:1);
	var rp = nd;
	if(isTextArea) {
		rp = document.createElement("textarea");
		rp.style.overflow = "auto";
	} else {
		rp = document.createElement("input");
	}
	copyAttrs(nd, rp);
	if(isTextArea) {
		rp.style.whiteSpace="pre-wrap";
	}
	nd.parentNode.insertBefore(rp, nd.nextSibling);
	nd.parentNode.removeChild(nd);
	if(nd.innerHTML!=""){
		rp.value = nd.innerHTML;
	}
	if(only){
		disableInput(rp);
		return rp;
	}
	_TransRule_.NotifyMustFill(rp, {marginLeft:'-15px'});
	return rp;
});
_TransRule_.save("span", "RichText", function(nd, only) {
	nd.style.overflow = "auto";
	nd.setAttribute('infodoc_data', 1);
	nd.setAttribute("element-type", "7");
	if(!isGecko){
		nd.contentEditable = !only;
	}else{
		var rp = document.createElement("iframe");
		rp.src = '';
		copyAttrs(nd, rp);
		nd.parentNode.insertBefore(rp, nd.nextSibling);
		nd.parentNode.removeChild(nd);
		var doc = rp.contentWindow.document;
		doc.write('<html><head></head><body style="font-size:14px;font-family:\u5B8B\u4F53,Arial;padding:0;margin:0;"></body></html>');
		doc.close();
		doc.designMode = only ? 'off' : 'on';
		nd = rp;
	}
	if(nd.innerHTML!=""){
		nd.value = nd.innerHTML;
	}
	if(only)return nd;
	makeTextEditorRule(nd);
	_TransRule_.NotifyMustFill(nd, {marginLeft:'-15px'});
	return nd;
});
function makeTextEditorRule(currNode){
	var img = document.createElement("img");
	img.src = m_sRootPath + "editor.gif";
	img.title = '\u70B9\u51FB\u7F16\u8F91\u683C\u5F0F\u6587\u672C';
	img.style.width = "16px";
	img.style.height = "16px";
	img.setAttribute('_action', 'openeditor');
	//img.setAttribute('trs_temp_id', nd.getAttribute("trs_temp_id", "2"));
	img.setAttribute('trs_temp_id', currNode.id);
	_TransRule_.appendExTool(currNode, img, {marginLeft:'-5px'});
}
_TransRule_.save("select", "DropDown", function(nd, only) {
	nd.setAttribute('infodoc_data', 1);
	nd.setAttribute("element-type", "8");
	nd.disabled = only;
	_TransRule_.NotifyMustFill(nd);
});
_TransRule_.save("select", "ListBox", function(nd, only) {
	nd.setAttribute('infodoc_data', 1);
	nd.setAttribute("element-type", "8");
	nd.disabled = only;
	_TransRule_.NotifyMustFill(nd);
});
_TransRule_.save("input", "CheckBox", function(nd, only) {
	nd.setAttribute('infodoc_data', 1);
	nd.setAttribute("element-type", "9");
	nd.disabled = only;
});
_TransRule_.save("input", "OptionButton", function(nd, only) {
	nd.setAttribute('infodoc_data', 1);
	nd.setAttribute("element-type", "10");
	nd.disabled = only;
});
_TransRule_.save("div", "Section", function(nd, only) {
	nd.setAttribute("element-type", "13");
});
_TransRule_.save("div", "RepeatingSection", function(nd, only) {
	nd.setAttribute("element-type", "3");
	nd.setAttribute("fly-button", 1);
	nd.setAttribute("context-menu", 1);
	if(only)return;
	nd.style.border = '1px dotted gray';
});
_TransRule_.save("tbody", "RepeatingTable", function(nd, only) {
	nd.setAttribute("element-type", "4");
	nd.setAttribute("fly-button", 1);
	nd.setAttribute("context-menu", 1);
	//\u517C\u5BB9\u591A\u6D4F\u89C8\u5668\uFF0C\u7ED9\u91CD\u590D\u8868\u7684\u7236\u5143\u7D20\u6DFB\u52A0\u6837\u5F0F
	if(nd.parentNode.tagName.toUpperCase() == 'TABLE'){
		var repeatingTableContainer = nd.parentNode.parentNode;
		if(repeatingTableContainer.tagName.toUpperCase() == 'DIV')
			repeatingTableContainer.className = 'xdRepeatingTableContainer';
	}
	if(only)return;
	nd.style.border = '1px dotted gray';
});
_TransRule_.save("span", "ListItem_Plain", function(nd, only) {
	nd.setAttribute("element-type", "1");
	nd.setAttribute('infodoc_data', 1);
	var rp = document.createElement("input");
	copyAttrs(nd, rp);
	nd.parentNode.insertBefore(rp, nd.nextSibling);
	nd.parentNode.removeChild(nd);
	if(only){
		disableInput(rp);
		return rp;
	}
	_TransRule_.NotifyMustFill(rp);
	return rp;
});
_TransRule_.save("span", "DTPicker_DTText", function(nd, only) {
	nd.setAttribute('infodoc_data', 1);
	nd.setAttribute("element-type", "11");
	var rp = document.createElement("input");
	copyAttrs(nd, rp);
	rp.style.border = 0;
	//\u65E5\u671F\u63A7\u4EF6\u591A\u6D4F\u89C8\u5668\u7684\u517C\u5BB9\uFF0C\u51CF\u6389\u7684\u5BBD\u5EA6\u4E3A\u65E5\u671F\u6309\u94AE\u5360\u7684\u533A\u57DF
	rp.style.width = (nd.parentNode.offsetWidth - 37) + 'px';	
	rp.style.height = (nd.parentNode.offsetHeight - 6) + 'px';
	//\u65E5\u671F\u63A7\u4EF6\u7684\u7236\u5BB9\u5668\u6307\u5B9A100%\u4F1A\u6EA2\u51FA
	if(nd.parentNode.style.width == "100%")
		nd.parentNode.style.width = (nd.parentNode.offsetWidth - 5)+ "px";
	nd.parentNode.insertBefore(rp, nd.nextSibling);
	nd.parentNode.removeChild(nd);
	var img = rp.parentNode.getElementsByTagName("BUTTON")[0];
	if(only){
		disableInput(rp);
		img.disabled = true;
		img.style.filter = 'gray';
		return rp;
	}
	makeDateCalendarRule(rp);
	_TransRule_.NotifyMustFill(rp, {marginLeft:'-13px'});
	return rp;

});
function makeDateCalendarRule(el){
	var img = el.parentNode.getElementsByTagName("BUTTON")[0];
	img.setAttribute("type", 'button');
	var df = el.getAttribute("xd:datafmt", 2);
	var time = df != null && df.indexOf("datetime") != -1;
	var dtfm = null;
	if(time){
		img.unselectable = 'on';
		var validation = el.getAttribute("validation", 2);
		if(!validation)dtfm = 'yyyy-mm-dd HH:MM:ss';
		else{
			eval("var obj = {" + validation + "}");
			dtfm = obj['date_format'];
			if(dtfm==undefined)
			dtfm = 'yyyy-mm-dd HH:MM:ss';
		}
	}
	else{
		var validation = el.getAttribute("validation", 2);
		if(!validation)dtfm = 'yyyy-mm-dd';
		else{
			eval("var obj = {" + validation + "}");
			dtfm = obj['date_format'];
			if(dtfm==undefined)
			dtfm = 'yyyy-mm-dd';
		}
	}
	wcm.TRSCalendar.get({
		input : el,
		handler : img,
		dtFmt : dtfm,
		withtime : time
	});
}
_TransRule_.save("span", "FileAttachment", function(nd, only) {
	nd.setAttribute("element-type", "5");
	nd.setAttribute('infodoc_data', 1);
	if(!only){
		nd.setAttribute("fly-button", 1);
		nd.setAttribute("context-menu", 1);
		nd.setAttribute('_action', "openFileOrAppend");
		nd.style.cursor = "pointer";
	}
	var img = document.createElement("img");
	img.src = m_sRootPath + "FileAttachment.gif";
	img.style.width = "14px";
	img.style.height = "13px";
	img.align = 'absmiddle';
	nd.appendChild(img);
	var txt = document.createElement("span");
	txt.setAttribute("text_body", "1");
	txt.className = 'appendix_txt';
	txt.innerHTML = "\u70B9\u51FB\u6B64\u5904\u4EE5\u6DFB\u52A0\u9644\u4EF6";
	nd.appendChild(txt);
	var txtFile = document.createElement("span");
	txtFile.setAttribute("text_file", "1");
	txtFile.style.display = 'none';
	txtFile.innerHTML = "";
	var validation = nd.getAttribute("validation", 2);
	if(validation){
		eval("var obj = {" + validation + "}");
		var validType = obj['extvalid'];
		if(validType)
			nd.setAttribute("allow_ext", validType);
	}
	nd.appendChild(txtFile);
	_TransRule_.NotifyMustFill(nd, {marginLeft:'-15px', marginTop:'7px'});
});
var GetImageAttachmentRule = function(xct){
	return function(nd, only) {
		var sp = document.createElement('SPAN');
		sp.setAttribute("element-type", "5");
		sp.setAttribute('infodoc_data', 1);
		sp.setAttribute("is-image", 1);	
		if(!only){
			nd.setAttribute("fly-button", 1);
			nd.setAttribute("context-menu", 1);
			nd.setAttribute('_action', "openFileOrAppend");
			nd.style.cursor = "pointer";
		}
		nd.setAttribute('trs_file_upload_type', "InlineImage");
		var validation = nd.getAttribute("validation", 2);
		if(validation){
			eval("var obj = {" + validation + "}");
			var validType = obj['extvalid'];
			if(validType){
				nd.setAttribute("allow_ext", validType);
			}else {
				nd.setAttribute('allow_ext', "jpg,png,gif,bmp,jpeg");
			}
		}
		copyAttrs(nd, sp);
		//sp.style.cursor = "pointer";
		nd.parentNode.insertBefore(sp, nd.nextSibling);
		var w = nd.offsetWidth, h = nd.offsetHeight;
		nd.parentNode.removeChild(nd);
		var img = document.createElement('IMG');
		img.setAttribute("image_body", "1");
		img.src = m_sRootPath + 'spacer.gif';
		img.style.width = w + 'px';
		img.style.height = h + 'px';
		img.style.background = "url(" + m_sRootPath + "ImageAttachment.gif) no-repeat center center";
		sp.appendChild(img);
		var txt = document.createElement("span");
		txt.setAttribute("text_body", "1");
		txt.innerHTML = '&nbsp;\u70B9\u51FB\u6B64\u5904\u4EE5\u6DFB\u52A0\u56FE\u7247';
		txt.style.marginLeft = (-w)  + 'px';
		txt.style.marginTop = '-22px';
		txt.style.height = '16px';
		txt.style.lineHeight = '16px';
		sp.appendChild(txt);
		return sp;
	};
}
var _genId = 0;
function genId(){
	return ++_genId;
}
_TransRule_.save("img", "InlineImage", GetImageAttachmentRule('trs_is_inline_image'));
_TransRule_.save("img", "LinkedImage", GetImageAttachmentRule('trs_is_linked_image'));
_TransRule_.save("span", "ExpressionBox", function(nd, only) {
	nd.setAttribute("element-type", "101");
	nd.setAttribute('infodoc_data', 1);
	var rp = document.createElement("input");
	rp.id = rp.id || 'trs-exp-' + genId();
	rp.setAttribute('trs_temp_id', rp.id);
	copyAttrs(nd, rp);
	nd.parentNode.insertBefore(rp, nd.nextSibling);
	nd.parentNode.removeChild(nd);
	only = only || nd.getAttribute("xd:disableEditing") == "yes";
	if(only){
		disableInput(rp);
		return rp;
	}
	return rp;
});
Event.observe(window, 'resize', function(){
	var caches = _TransRule_.getMustDoCaches();
	for(var i=0, n=caches.length; i<n; i++){
		var sp = caches[i][1], os = caches[i][2] || {}, nd = caches[i][0];
		Position.clone(nd, sp, {
			setWidth : false,
			setHeight : false,
			offsetLeft : os.exTool ? -15 : nd.offsetWidth,
			offsetTop : 5
		});
		for(var nm in os){
			if(nm=='exTool')continue;
			sp.style[nm] = os[nm];
		}
	}
});
Event.observe(window, 'unload', function(){
	_TransRule_.removeMustDoCaches();
});
function bodyFxEvents(){
	//bubble-panel
	var divBp = document.createElement('DIV');
	divBp.id = 'bubble-panel';
	divBp.setAttribute('_fxType', 'bubble-panel');
	divBp.style.display = 'none';
	divBp.style.position = "absolute";
	divBp.style.zIndex = 999;
	document.body.appendChild(divBp);
	regMenuItemEvent('bubble-panel');
	//fly-button
	var flyBtn = document.createElement('DIV');
	flyBtn.style.display = 'none';
	flyBtn.id = 'fly-button';
	flyBtn.setAttribute('_fxType', 'fly-button');
	flyBtn.style.zIndex = 99;
	flyBtn.style.cursor = 'pointer';
	flyBtn.style.position = "absolute";
	flyBtn.style.border = 0;
	flyBtn.setAttribute("xd:xctname", "FlyButton");
	flyBtn.innerHTML = "<img src='" + m_sRootPath + "DownButton.gif' border='0'>";
	document.body.appendChild(flyBtn);
	var bubblePanel = new wcm.BubblePanel('bubble-panel');
	function showContextMenu(ev, tg){
		var fb = $('fly-button');
		if(!fb.cfg)return true;
		var items = PgC.flys(fb.cfg.elType, fb.cfg.el);
		if(!items)return true;
		$('bubble-panel').innerHTML = PgC.buildMenu(items, fb.cfg.el);
		bubblePanel.bubble(ev.pointer, function(p){
			return [p[0], p[1]+5];
		});
		ev.stop();
		return false;
	}
	Ext.get(flyBtn).on('click', showContextMenu);
	var lastMsm = null;
	function mouseoverFx(ev, tg){
		if(!tg.tagName)return;
		var temp = findItem(tg, false, '_fxType');
		if(temp!=null)return;
		tg = findItem(tg, false, 'trs_temp_id');
		if(lastMsm!=null && lastMsm.el!=tg){
			PgC.borderFx(lastMsm.el, true);
			PgC.flyBtnFx(null, lastMsm.el, true);
			lastMsm = null;
		}
		if(tg==null)return;
		var nElType = tg.getAttribute('element-type', 2);
		PgC.borderFx(tg);
		PgC.flyBtnFx(ev, tg);
		lastMsm = {ev:ev.browserEvent, el:tg};
		return true;
	}
	var extBody = Ext.get(document.body);
	extBody.on('contextmenu', function(ev, tg){
		var el = findItem(tg, false, 'context-menu');
		if(!el)return true;
		mouseoverFx(ev, tg);
		var eid = el.getAttribute('trs_temp_id', 2);
		var nElType = el.getAttribute('element-type', 2);
		var items = PgC.flys(nElType, el);
		if(!items)return true;
		$('bubble-panel').innerHTML = PgC.buildMenu(items, el);
		bubblePanel.bubble(ev.pointer, function(p){
			return [p[0], p[1]+5];
		});
		ev.stop();
		return false;
	});
	extBody.on('mousemove', function(ev, tg){
		if(Element.visible('bubble-panel'))return;
		mouseoverFx(ev, tg);
	});
}
function regClickEvent(id){
	Ext.get(id).on('click', function(exEv, tg){
		var actionItem = findItem(tg, false, '_action');
		if(!actionItem)return;
		var action = actionItem.getAttribute('_action', 2);
		var fn = PgC[action];
		if(!fn)return;
		fn.apply(PgC, [exEv, tg]);
	});
}
function regMenuItemEvent(id){
	var lstMenuItem = null;
	Ext.get(id).on('mousemove', function(exEv, tg){
		var menuitem = findItem(tg, 'menuitem');
		if(!menuitem)return;
		if(lstMenuItem){
			Element.removeClassName(lstMenuItem, 'menuitem_active');
		}
		Element.addClassName(menuitem, 'menuitem_active');
		lstMenuItem = menuitem;
	});
	Ext.get(id).on('mouseout', function(exEv, tg){
		if(lstMenuItem){
			Element.removeClassName(lstMenuItem, 'menuitem_active');
		}
		lstMenuItem = null;
	});
}
var exCenter = null;
function defExCenter(){
	var l1 = [], l2 = [], l3 = [], l4 = [], inited;
	exCenter = {
		onafterTrans : function(fn){
			l1.push(fn);
			if(window.__loaded)fn();
		},
		onafterInitData : function(fn){
			l2.push(fn);
			if(window.__loaded)fn();
		},
		onafterModify : function(fn){
			l3.push(fn);
		},
		onbeforeSubmit : function(fn){
			l4.push(fn);
		},
		_afterTrans : function(){
			for(var i=0,n=l1.length;i<n;i++){
				(l1[i])();
			}
		},
		_afterInitData : function(){
			for(var i=0,n=l2.length;i<n;i++){
				(l2[i])();
			}
		},
		_afterModify : function(el){
			for(var i=0,n=l3.length;i<n;i++){
				(l3[i])(el);
			}
		},
		_beforeSubmit : function(rst){
			for(var i=0,n=l4.length;i<n;i++){
				if((l4[i])(rst)===false)return false;
			}
			return true;
		}
	}
};
defExCenter();
Event.observe(window, 'load', function(){
	PgC.initFrmAction();
	var eles = document.body.getElementsByTagName("*");
	for(var i=0; i<eles.length; i++) {
		var el = eles[i];
		_TransRule_.doTrans(el, el.getAttribute('trs_readonly_field', 2)=='1');
	}
	exCenter._afterTrans();
	bodyFxEvents();
	regClickEvent(document.body);
	PgC.initPage(function(){
		exCenter._afterInitData();
	});
	window.__loaded = true;
});
window.onValidError = function(json){
	if(window.customValidError){
		window.customValidError(json);
		return;
	}
	var infos = json.infos;
	if(infos.length>0){
		alert(infos[0].warning);
		$(infos[0].id).focus();
	}
}

/**--infoview_elehelper.js--**/
//\u63A7\u4EF6\u52A9\u624B
Array.prototype.xJoin = function(c, s, e){
	var rst = [];
	for(var i=s; i<=e; i++)rst.push(this[i]);
	return rst.join(c);
}
var EleHelper = {
	getFile : function(nd, bjson){
		var xct = nd.getAttribute("xd:xctname", 2);
		xct = xct ? xct.toLowerCase() : '';
		var arr = nd.childNodes;
		for(var i=0; i<arr.length; i++) {
			var c1 = arr[i];
			if(!c1.tagName)continue;
			if(xct == "fileattachment"){
				if(c1.getAttribute("text_file") == "1") {
					if(!c1.getAttribute("_fileDesc", 2))continue;
					if(bjson){
						return {
							FileDesc : c1.getAttribute("_fileDesc", 2),
							FileName : c1.getAttribute("_fileName", 2)
						}
					}
					return c1.getAttribute("_fileName", 2);
				}
			}
			else{
				if(c1.getAttribute("image_body") == "1") {
					if(!c1.getAttribute("_fileDesc", 2))continue;
					if(bjson){
						return {
							FileDesc : c1.getAttribute("_fileDesc", 2),
							FileName : c1.getAttribute("_fileName", 2)
						}
					}
					return c1.getAttribute("_fileName", 2);
				}
			}
		}
		return null;
	},
	setValue : function(nd, myv, info){
		var v = (typeof myv=='string') ? myv : XmlHelper._xvalue(myv);
		if(v == null)return false;
		var xp = nd.getAttribute("trs_temp_id", 2);
		var nElType = nd.getAttribute('element-type', 2);
		if(!xp || !nElType)return false;
		if(nElType==1 || nElType==2 || nElType==11 || nElType==101){
			nd.value = v;
		}
		else if(nElType==7){
			if(nd.tagName=='SPAN')nd.innerHTML = v;
			else if(nd.tagName=='IFRAME'){
				try{
					nd.contentWindow.document.body.innerHTML = v;
				}catch(err){}
			}
		}
		else if(nElType==8){
			nd.value = v;
			if(v!='' && nd.value==''){
				var a = document.createElement('OPTION');
				nd.appendChild(a);
				a.value = a.innerHTML = v;
				a.selected = true;
			}
			nd.value = v;
		}
		else if(nElType==10){
			if(nd.getAttribute("xd:onValue")==v)nd.checked = true;
		}
		else if(nElType==9){
			var sv = ',' + nd.getAttribute("xd:onValue") + ',';
			if((','+v+',').indexOf(sv)!=-1)nd.checked = true;
			else nd.checked = false;
		}
		else if(nElType==5){
			var xct = nd.getAttribute("xd:xctname", 2);
			xct = xct ? xct.toLowerCase() : '';
			var arr = nd.childNodes;
			for(var i=0; i<arr.length; i++) {
				var c1 = arr[i];
				if(!c1.tagName)continue;
				if(xct == "fileattachment"){
					if(c1.getAttribute("text_body") == "1") {
						c1.style.display = v ? "none" : "";
						continue;
					}
					if(c1.getAttribute("text_file") == "1") {
						c1.style.display = v ? "" : "none";
						var v2 = '';
						try{
							v2 = (info==null ? myv.getAttribute('FileName') : info.FileDesc) || v;	
						}catch(err){
							v2 = v;
						}
						c1.innerHTML = v2;
						c1.title = v;
						c1.setAttribute("_fileDesc", v2);
						c1.setAttribute("_fileName", v);
						continue;
					}
				}
				else{
					if(c1.getAttribute("image_body") == "1") {
						var v2 = '';
						try{
							v2 = (info==null ? myv.getAttribute('FileName') : info.FileDesc) || v;	
						}catch(err){
							v2 = v;
						}
						if(v != '')c1.src = m_readFileUrl + v;
						else c1.src =  m_sRootPath + 'spacer.gif';
						c1.title = v2;
						c1.style.display = v == null ? "none" : "";
						//c1.style.background = '';
						c1.setAttribute("_fileDesc", v2);
						c1.setAttribute("_fileName", v);
						continue;
					}
					c1.style.display = v ? "none" : "";
				}
			}
		}
		else if(this.isContainerEle(nd)){
			if(v!='')return;
			var arr = nd.getElementsByTagName('*');
			for(var i=0; i<arr.length;i++){
				var flag = arr[i].getAttribute('infodoc_data');
				if(!flag)continue;
				if(this.isContainerEle(arr[i]))continue;
				EleHelper.setValue(arr[i], v);
			}
		}
		return true;
	},
	getValue :  function(nd){
		var nElType = nd.getAttribute("element-type", 2);
		if(nElType==1 || nElType==2 || nElType==11 || nElType==8 || nElType==101){
			return nd.value;
		}
		if(nElType==7){
			if(nd.tagName=='SPAN')return nd.innerHTML;
			if(nd.tagName=='IFRAME'){
				try{
					return nd.contentWindow.document.body.innerHTML;
				}catch(err){
					return '';
				}
			}
		}
		if(nElType==10 || nElType==9){
			var rst = nd.checked ? nd.getAttribute("xd:onValue") : nd.getAttribute("xd:offValue");
			return rst==null ? '' : rst;
		}
		else if(nElType==5){
			var file = this.getFile(nd, true) || {};
			var xct = nd.getAttribute("xd:xctname", 2).toLowerCase();
			var flag = 'trs_is_inline_file';
			if(xct=='inlineimage')
				flag = 'trs_is_inline_image';
			else if(xct=='linkedimage')
				flag = 'trs_is_linked_image';
			var rst = {};
			if(file.FileName){
				rst[flag] = 1;
			}else{
				rst['blank_node'] = 1;
			}
			rst.nodeValue = file.FileName || '';
			rst.FileName = file.FileDesc || '';
			return rst;
		}
		return null;
	},
	setDefaultValue : function(nd){
		var v = nd.getAttribute('default_value', 2) || "";
		var nElType = nd.getAttribute("element-type", 2);
		switch(nElType){
			case "1":
			case "2":
			case "11":
			case "8":
			case "101":
				nd.value = v;
				break;
			case "7":
				var dom = null;
				if(nd.tagName=='SPAN'){
					dom = nd;
				}else if(nd.tagName=='IFRAME'){
					dom = nd.contentWindow.document.body;
				}
				if(dom) dom.innerHTML = v;
				break;
			case "9":
			case "10":
				var sv = "," + nd.getAttribute("xd:onValue") + ",";
				nd.checked = ("," + v + ",").indexOf(sv) >= 0;
				break;
		}
	},
	getValueFields : function(){
		var arr = document.body.getElementsByTagName('*');
		var rst = [];
		for(var i=0, n=arr.length; i<n; i++){
			var flag = arr[i].getAttribute('infodoc_data');
			if(!flag)continue;
			rst.push(arr[i]);
		}
		return rst;
	},
	getElesByTrsTmpId : function(arrTrsTmpId, cntEl){
		cntEl = cntEl || document.body;
		var xps = Array.isArray(arrTrsTmpId) ? arrTrsTmpId.join(',') : arrTrsTmpId;
		xps = ',' + xps + ',';
		var rst = [], tags = ['input', 'select', 'textarea'];
		for(var k=0, nK=tags.length; k<nK; k++){
			var arr = cntEl.getElementsByTagName(tags[k]);
			for(var i=0, n=arr.length; i<n; i++){
				var flag = arr[i].getAttribute('trs_temp_id');
				if(!flag || xps.indexOf(','+flag+',')==-1)continue;
				rst.push(arr[i]);
			}
		}
		return rst;
	},
	isRepeatNode : function(xp){
		var el = $(xp);
		if(!el)return false;
		return this.isRepeatEle(el);
	},
	isRepeatEle : function(nd){
		var type = nd.getAttribute("element-type", 2);
		return type==3 || type==4;
	},
	isContainerEle : function(nd){
		var type = nd.getAttribute("element-type", 2);
		return type==3 || type==13 || type==4;
	},
	isfileattachmentEle : function(nd){
		var type = nd.getAttribute("element-type", 2);
		return type==5;
	},
	jsonData :  function() {
		var els = this.getValueFields();
		var vData = {}, attrs = [];
		for(var i=0; i<els.length; i++){
			var ele = els[i], v = this.getValue(ele);
			if(v==null)continue;
			
			//\u5355\u9009\u548C\u591A\u9009\u7684\u5904\u7406
			var eleTag = ele.tagName;
			var eleType = ele.type ? ele.type.toLowerCase() : '';
			if(eleType =='radio' && v == '')continue;//\u5355\u9009\u7684\u503C\u4E3A\u7A7A\uFF0C\u5219\u8FD4\u56DE
			
			var eleName = ele.getAttribute('trs_temp_id', 2);
			var tmpFor = vData[eleName]; //js\u662F\u6CA1\u6709{}\u7EA7\u4F5C\u7528\u57DF\u7684,\u6240\u4EE5\u5728for\u5FAA\u73AF\u4E2D\u5B9A\u4E49\u7684tmpFor\u53D8\u91CF\u5728for\u5FAA\u73AF\u5916\u4E5F\u53EF\u4EE5\u4F7F\u7528
			if(tmpFor == undefined){
				//\u5728\u7EC4\u7EC7\u7684\u6570\u636E\u4E2D\u672A\u627E\u5230\u540C\u540D\u7684\uFF0C\u5219\u5C06\u5176key\u548Cvalue\u5B58\u653E\u8D77\u6765
				vData[eleName] = v;
				continue;
			}
			//\u5982\u679C\u5DF2\u7ECF\u5B58\u5728\u540Ckey\u7684\u503C\uFF0C\u5219\u5982\u679C\u4E0D\u662F\u6570\u7EC4\uFF0C\u5219\u521B\u5EFA\u51FA\u4E00\u4E2A\u6570\u7EC4\uFF0C\u5C06\u8FD9\u4E2A\u6570\u7EC4\u4F5C\u4E3A\u5DF2\u7ECF\u7EC4\u7EC7\u597D\u7684\u6570\u636E
			if(!Array.isArray(tmpFor)){
				tmpFor = vData[eleName] = [tmpFor];
			}
			
			tmpFor.push(v);//\u5C06\u5F53\u524D\u5143\u7D20\u7684\u503C\u653E\u5230\u5DF2\u7ECF\u7EC4\u7EC7\u597D\u7684\u6570\u7EC4\u4E2D
			if(eleTag=='INPUT' && eleType=='checkbox'){
				vData[eleName] = tmpFor.join(',');//\u591A\u9009\u60C5\u51B5\u4E0B\uFF0C\u5C06\u503C\u7528\u9017\u53F7\u8FDE\u63A5\u8D77\u6765
			}
		}//\u4EE5\u4E0A\u7EC4\u7EC7\u7684\u7ED3\u679C\u662F\uFF1A\u5143\u7D20\u7684key\u548Cvalue\u90FD\u5B58\u653E\u5230vData\u4E2D\uFF0C\u540C\u540D\u7684\u5143\u7D20\uFF0C\u5176\u503C\u662F\u4E00\u4E2A\u6570\u7EC4
		
		var rst = {}, arrName, tmpRst, tmp, tmp2; //\u7531\u4E8Efor\u5FAA\u73AF\u4E2D\u4E5F\u5B9A\u4E49\u4E86tmp\u53D8\u91CF
		for(var name in vData){
			tmpRst = rst;
			arrName = name.split('/');
			var i=0, n = arrName.length-1;
			for(; i<n; i++){
				if(this.isRepeatNode(arrName.xJoin('/', 0, i))){
					//\u91CD\u590D\u8868\u60C5\u51B5\uFF0C\u521D\u59CB\u5316\u6570\u7EC4
					tmpRst[arrName[i]] = tmpRst[arrName[i]] || [];
					tmpRst = tmpRst[arrName[i]];//\u6700\u7EC8tmpRst\u8868\u793A\u5F53\u524Dname\u5143\u7D20\u7684\u7ED3\u679C\uFF0C\u662F\u4E00\u4E2A\u6570\u7EC4
					break;
				}
				//\u5230\u6B64\uFF0CtmpRst\u4E3A\u5F53\u524D\u5143\u7D20\u7684\u7ED3\u679C
				tmp = tmpRst[arrName[i]];
				if(!tmp){//\u5982\u679C\u7ED3\u679C\u4E2D\u8FD8\u6CA1\u6709\u5F53\u524D\u5143\u7D20\u7684key
					tmp = tmpRst[arrName[i]] = {};
				}
				tmpRst = tmp;//\u662F\u4E00\u4E2A\u7A7Ajson
			}
			//\u5230\u6B64\u7684\u7ED3\u679C\u662F:tmpRst\u4E3A\u5F53\u524D\u5143\u7D20\u7684\u4E00\u4E2A\u7ED3\u679C\u7C7B\u578B\uFF0C\u91CD\u590D\u8868\u4E3A[]\uFF0C\u5176\u4ED6\u4E3A{}
			var v = vData[name];
			if(Array.isArray(tmpRst)){
				tmp = null;
				v = Array.isArray(v) ? v : [v];//\u5C06\u5F53\u524D\u503C\u4E5F\u7EC4\u7EC7\u4E3A\u4E00\u4E2A\u6570\u7EC4
				for(var k=0, mK=v.length; k<mK; k++){
					var j = i+1;
					tmp2 = tmpRst[k] = tmpRst[k] || {};
					for(;j<n;j++){
						tmp = tmp2[arrName[j]] = tmp2[arrName[j]] || {};
						tmp2 = tmp;
					}
					var el = document.getElementById(name);
					tmp2[arrName[n]] = v[k];
				}
			}else{
				tmpRst[arrName[n]] = v;
			}
		}
		return rst;
	},
	jsonIntoEle : function(xmlDoc, parent, json){
		if(json==null || typeof json!='object')return;
		if(Array.isArray(json)){
			for(var i=0,n=json.length;i<n;i++){
				var newEle = parent;
				var value = json[i];
				if(i!=0 && value!=''){
					newEle = xmlDoc.createElement(parent.nodeName);
					parent.parentNode.appendChild(newEle);
				}
				if(typeof value=='object'){
					if(value.nodeValue==null)newEle.setAttribute('complex_field', 1);
					this.jsonIntoEle(xmlDoc, newEle, value);
					continue;
				}
				if(value!="")
				newEle.appendChild(xmlDoc.createCDATASection(value));
			}
			return;
		}
		var bAttrNode = json.nodeValue!=null;
		if(bAttrNode){
			for(var name in json){
				var value = json[name];
				if(name!='nodeValue'){
					parent.setAttribute(name, value);
					continue;
				}
				parent.appendChild(xmlDoc.createCDATASection(value));
			}
			return;
		}
		for(var name in json){
			var value = json[name];
			var newEle = xmlDoc.createElement(name);
			parent.appendChild(newEle);
			if(typeof value=='object'){
				this.jsonIntoEle(xmlDoc, newEle, value);
				continue;
			}
			newEle.appendChild(xmlDoc.createCDATASection(value));
		}
	}
}
/**--infoview_xmldatahelper.js--**/
var XmlDataHelper = {
	getDoc : function(){
		var xml = [
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<my:myFields xmlns:my="http://schemas.microsoft.com/office/infopath/"/>'
		].join('\n');
		return loadXml(xml);
	},
	fetchData : function(){
//		window._databeforeSubmit = {};
//		if(exCenter._beforeSubmit(window._databeforeSubmit)===false)return;
		var doc = this.getDoc(), root = doc.documentElement;
		var json = EleHelper.jsonData();
		EleHelper.jsonIntoEle(doc, root, json);
		return doc.xml;
	},
	initData : function(xml, bFromExtranet) {
		var doc = loadXml(xml);
		if(doc == null)return null;
		var root = doc.documentElement;
		this._dealData(document.body, root, bFromExtranet);
	},
	_dealData : function(hNode, xNode, bFromExtranet) {
		if(!hNode || !xNode)return;
		var hChilds = hNode.childNodes;
		for(var i=0; i<hChilds.length; i++) {
			var hcn = hChilds[i];
			if(!hcn.tagName) continue;
			if(hcn.getAttribute('trs_cloned', 2)){
				hcn.removeAttribute('trs_cloned');
				continue;
			}
			var xct = hcn.getAttribute("xd:xctname", 2);
			var xp = hcn.getAttribute("trs_temp_id", 2);
			var eleType = hcn.getAttribute("element-type", 2);
			if(!xct || !xp || !eleType){
				this._dealData(hcn, xNode, bFromExtranet);
				continue;
			}
			if(EleHelper.isRepeatEle(hcn)){
				var xmlNodes = XmlHelper.queryNodes(xNode, xp);
				if(xmlNodes.length==0)continue;
				var tmp = hcn.nextSibling;
				for(var j=0; j<xmlNodes.length; j++) {
					var c1 = hcn;
					if(j != 0) {
						c1 = hcn.cloneNode(true);
						c1.setAttribute('trs_cloned', 1);
						c1.id = c1.id + "_" + new Date().getTime();
						var childEls = c1.getElementsByTagName("*");
						for(var childIndex=0;childIndex<childEls.length;childIndex++){
							var childEl = childEls[childIndex];
							if(!childEl.disabled){
								childEl.id = childEl.id + "_" +new Date().getTime();
								var currElXctName = childEl.getAttribute('xd:xctname',2);
								if(!currElXctName)continue;
								try{
								if(currElXctName == 'DTPicker_DTText' && makeDateCalendarRule){
									makeDateCalendarRule(childEl);
								}
								if(currElXctName == 'RichText' && makeTextEditorRule){
									makeTextEditorRule(childEl);
								}
								}catch(error){
									//do nothing
								}
							}
						}
						hNode.insertBefore(c1, tmp);
					}
					this._dealData(c1, xmlNodes[j], bFromExtranet);
				}
				continue;
			}
			if(EleHelper.isContainerEle(hcn)){
				this._dealData(hcn, xNode, bFromExtranet);
				continue;
			}
			var xmlNodes = XmlHelper.queryNodes(xNode, xp);
			if(xmlNodes.length==0)continue;
			var tmp = hcn.nextSibling;
			var bFirst = true;
			for(var j=0; j<xmlNodes.length; j++) {
				var c1 = hcn;
				//\u9644\u4EF6\u7279\u6B8A\u5904\u7406\u4E00\u4E0B
				if(eleType==5 && xmlNodes[j].getAttribute('blank_node')=='1')continue;
				if(!bFirst) {
					c1 = hcn.cloneNode(true);
					c1.id = c1.id + '_' + (j+1);
					c1.setAttribute('trs_cloned', 1);
					hNode.insertBefore(c1, tmp);
				}
				var v = (typeof xmlNodes[j]=='string') ? xmlNodes[j] : XmlHelper._xvalue(xmlNodes[j]);
				if(bFromExtranet){
					if(v != '')
					EleHelper.setValue(c1, xmlNodes[j]);
				}else EleHelper.setValue(c1, xmlNodes[j]);
				bFirst = false;
			}
		}
	}
}
/**--infoview_expression.js--**/
//\u8868\u8FBE\u5F0F
var xdMath = {
	Nz : function(xp, elId) {
		var eles = EleHelper.getElesByTrsTmpId(xp, xExpression.cntEl($(elId)));
		if(eles.length == 0)
			return 0;
		if(eles.length == 1)
			return parseInt(eles[0].value, 10) || 0;
		var arrValues = [];
		for(var i=0; i<eles.length; i++)
			arrValues.push(parseInt(eles[i].value, 10));
		return arrValues;
	}
}
var xExpression = {
	caches : {},
	cntEl : function(el){
		while(el!=null && el.tagName!='BODY'){
			if(EleHelper.isContainerEle(el))
				return el;
			el = el.parentNode;
		}
		return document.body;
	},
	calMyXp : function(el){
		return this.cntEl(el).getAttribute('trs_temp_id', 2) || '';
	},
	parse : function(el) {
		if(!el)return;
		var eps = el.getAttribute("trs_calc_expression"), elId = el.id;
		if(!eps)return null;
		var names = [], xp = this.calMyXp(el);
		if(this.caches[elId])return this.caches[elId];
		var rEps = eps.replace(/xdMath(:|\.)([^\(\)]+)\(([^\(\)]+)\)/g,
			function(a, dot, fn, cxp){
				cxp = xExpression.calXp(xp, cxp);
				names.push(cxp);
				return "xdMath." + fn + "('" + cxp + "', '" + elId + "')";
			}
		);
		var rst = this.caches[elId] = {
			eps : rEps,
			names : names,
			xp : xp,
			id : elId
		};
		rst.fn = function(){
			var el = $(rst.id);
			try {
				el.value = eval(rst.eps);
				if(el.onchange)el.onchange();
			} catch(e){
			}
		}
		return rst;
	},
	init : function(el) {
		if(!el)return;
		var result = this.parse(el);
		if(result==null)return;
		var ref = el.getAttribute("trs_calc_refresh");
		if(ref && ref.toLowerCase() == "oninit") {
			result.fn();
			return;
		}
		if(result.names.length==0)return;
		var eles = EleHelper.getElesByTrsTmpId(result.names, this.cntEl(el));
		for(var i=0; i<eles.length; i++) {
			Event.observe(eles[i], 'change', result.fn);
		}
	},
	renderEl : function(cntEl) {
		for(var xp in this.caches){
			this.init($(xp));
		}
		var eles = cntEl.getElementsByTagName('INPUT'), el;
		for(var i=0; i<eles.length; i++) {
			el = eles[i];
			var xct = el.getAttribute('xd:xctname', 2);
			if(!xct || xct.toLowerCase()!='expressionbox')continue;
			if(this.caches[el.id]!=null){
				el.id = el.id + '_' + genId();
			}
			this.init(el);
		}
	},
	calXp : function(axp, rxp) {
		if(!axp || !rxp)return rxp;
		var arrR = (axp + '/' + rxp).split("/"), rst = [];
		for(var i=0; i<arrR.length; i++) {
			if(!arrR[i] || arrR[i]=='.')continue;
			if(arrR[i]!='..'){
				rst.push(arrR[i]);
				continue;
			}
			if(rst.length==0)return null;
			rst.pop();
		}
		return rst.join('/');
	}
};
exCenter.onafterTrans(function(){
	xExpression.renderEl(document.body);
});
exCenter.onafterModify(function(newEl){
	xExpression.renderEl(newEl);
});
/*
//\u6269\u5C55\u793A\u4F8B
xdMath.qiuhe = function(xp){
	var eles = EleHelper.getElesByTrsTmpId(xp);
	if(eles.length == 0)
		return 0;
	if(eles.length == 1)
		return parseInt(eles[0].value, 10) || 0;
	var rst = 0;
	for(var i=0; i<eles.length; i++)
		rst += parseInt(eles[i].value, 10) || 0;
	return rst;
}
exCenter.onafterTrans(function(){
	$('my:field2').setAttribute('trs_calc_expression', 'xdMath.qiuhe(my:group1/my:group2/my:field4)');
	xExpression.init($('my:field2'));
});
*/
/**--infoview_validator.js--**/
function defClass(){
	return function(){
		this.initialize.apply(this, arguments);
	}
}
String.prototype.byteLength = function(){
	var length = 0;
	this.replace(/[^\x00-\xff]/g,function(){length++;});
	return this.length+length;
}
var AttrHelper = {
	prefix : 'attr_',
	autoId : 0,
	cache : {},
	setAttribute : function(el, attr, v){
		if(!(el = $(el))) return;
		var _id = this.getId(el);
		var attrs = this.cache[_id] = this.cache[_id] || {};
		attrs[attr.toUpperCase()] = v;
	},
	getAttribute : function(el, attr){
		if(!(el = $(el))) return null;
		var attrs = this.cache[this.getId(el)];
		if(!attrs)return null;
		return attrs[attr.toUpperCase()];
	},
	removeAttribute : function(el, attr){
		if(!(el = $(el))) return;
		var attrs = this.cache[this.getId(el)];
		if(!attrs)return;
		delete attrs[attr.toUpperCase()];
	},
	getId : function(el){
		var _id = el.getAttribute("_id");
		if(_id != null) return _id;
		_id = el.name || el.id || (this.prefix + (++this.autoId));
		_id = _id.toUpperCase();
		el.setAttribute("_id", _id);
		return _id;
	}
};
if(!window.m_Vdcf){
	var m_Vdcf = {};
}
Object.extend(m_Vdcf, {
	msg_info : {
		REQUIRED : '{0}\u4E0D\u80FD\u4E3A\u7A7A',
		NUMBER : '{0}\u5FC5\u987B\u4E3A\u6570\u5B57',
		INT : '{0}\u5FC5\u987B\u4E3A\u6574\u6570',
		INTEGER : '{0}\u5FC5\u987B\u4E3A\u6574\u6570',
		FLOAT : '{0}\u5FC5\u987B\u4E3A\u5C0F\u6570',
		DOUBLE : '{0}\u5FC5\u987B\u4E3A\u53CC\u7CBE\u5EA6\u6570',
		MIN_LEN : '{0}\u6700\u5C0F\u957F\u5EA6\u4E3A{1}',
		MAX_LEN : '{0}\u6700\u5927\u957F\u5EA6\u4E3A{1}',
		MIN : '{0}\u6700\u5C0F\u503C\u4E3A{1}',
		MAX : '{0}\u6700\u5927\u503C\u4E3A{1}',
		LENGTH_RANGE : '{0}\u957F\u5EA6\u8303\u56F4\u4E3A{1}~{2}',
		VALUE_RANGE : '{0}\u503C\u8303\u56F4\u4E3A{1}~{2}',
		URL : '{0}\u671F\u671B\u683C\u5F0F\u4E3A:http(s)://[\u7AD9\u70B9](:[\u7AEF\u53E3])/(\u5B50\u76EE\u5F55)',
		LINK : '{0}\u671F\u671B\u683C\u5F0F\u4E3A:xxx.xxx.xxx',
		IPV4 : '{0}IPV4\u683C\u5F0F\uFF0C\u671F\u671B\u683C\u5F0F\u4E3A: 192.9.200.114',
		COMMON_CHAR : '{0}\u5FC5\u987B\u4E3A\u5B57\u6BCD\u5F00\u5934\u7684\u5B57\u6BCD\u3001\u4E0B\u5212\u7EBF\u6216\u8005\u6570\u5B57\u6240\u7EC4\u6210',
		COMMON_CHAR2 : '{0}\u5FC5\u987B\u4E3A\u5B57\u6BCD\u3001\u4E0B\u5212\u7EBF\u6216\u8005\u6570\u5B57\u6240\u7EC4\u6210',
		EMAIL : '{0}\u5FC5\u987B\u4E3AEmail\u683C\u5F0F(\u5982xxx@xxx.com)'
	},
	warn_info : '{0}',
	warn_reginfo : '\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u9700\u5339\u914D\u6B63\u5219\u5F0F\uFF1A{0}'
});
var vdFactory = {
	getValidateObj : function(dom){
		dom = $(dom);
		var vd = dom.getAttribute("validation") || "", rst;
		eval("rst={" + vd + "}");
		var data_pattern = dom.getAttribute("data_pattern");
		if(data_pattern){
			Ext.apply(rst,{type:data_pattern});
		}
		return rst;
	},
	makeValidator : function(el){
		el = $(el);
		var obj = this.getValidateObj(el);
		AttrHelper.setAttribute(el, "_VALIDATEOBJ_",  obj);
		var sType = obj['type'];
		var rst = !sType ? new AbsVdtor(el) : this._makeValidator(sType, el);		
		AttrHelper.setAttribute(el, "_VALIDATORINS_",  rst);
		return rst;
	},
	_makeValidator : function(type, _field){
		switch(type.toLowerCase()){
			case "int":
			case "integer":
			case "float":
			case "double":
				return new NumVdtor(_field);
			case "string":
				return new StrVdtor(_field);
			case "date":
			case "datetime":
				return new DateVdtor(_field);
			case "url":
				var rst = new StrVdtor(_field);
				rst.format = /^(http|https|ftp|mtsp):\/\/.+$/i;  
				rst.formatType = 'URL';
				return rst;
			case "ip":
				var rst = new StrVdtor(_field);
				rst.format = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;  
				rst.formatType = 'IPV4';
				return rst;
			case "common_char":
				var rst = new StrVdtor(_field);
				rst.format = new RegExp('^[a-z][a-z0-9_]*$', 'i');
				rst.formatType = 'COMMON_CHAR';
				return rst;
			case "common_char2":
				var rst = new StrVdtor(_field);
				rst.format = new RegExp('^[a-z0-9_]+$', 'i');
				rst.formatType = 'COMMON_CHAR2';
				return rst;			
			case "email":
				var rst = new StrVdtor(_field);
				rst.format = new RegExp('^.+@.+$', '');
				rst.formatType = 'EMAIL';
				return rst;
		}
		//no such type,return default validator.
		return new AbsVdtor(_field);
	}
};

var ValidationHelper = {
	isRequired : function(obj, el){
		var required = obj['required'];
		var rst = !(required=='0' || required=='false' || (required==null&&required!=''));
		return rst || el.getAttribute("not_null", 2) == "1";
	},
	filter : function(dom){
		if(!dom.getAttribute("validation")) return false;
		if(dom.getAttribute("forceValid")) return true;
		if(dom.disabled || dom.getAttribute("ignore")) return false;
		return true;
	},
	valid : function(){
		var result = [];
		for(var i = 0; i < arguments.length; i++){
			var dom = $(arguments[i]);
			if(!this.filter(dom)) continue;
			var vdor = vdFactory.makeValidator(dom);
			if(!vdor)continue;
			var isValid = vdor.execute();
			dom.setAttribute('isValid', isValid?1:0);
			if(!isValid){
				dom.setAttribute('validError', vdor.warning);
			}
			result.push({
				id : dom.id || dom.name,
				isValid : isValid,
				message : vdor.getMessage(),
				warning : vdor.warning || ""
			});
		}
		return result.length <= 1 ? result[0] : result;
	},
	validForm : function(boxId){
		var doms = [], box = $(boxId);
		var tags = ["INPUT", "TEXTAREA", "SELECT"];
		for (var i = 0; i < tags.length; i++){
			var eles = box.getElementsByTagName(tags[i]);
			doms.push.apply(doms, $A(eles));
		}
		//\u683C\u5F0F\u5316\u6587\u672C\u5143\u7D20,span
		eles = document.getElementsByClassName("xdRichTextBox");		
		doms.push.apply(doms, eles);
		var rst = this.valid.apply(this, doms);
		return rst==null ? [] : (Array.isArray(rst) ? rst : [rst]);
	}
};
AbsVdtor = defClass();
AbsVdtor.prototype = {
	method : function(){return true;},
	initialize : function(_field) {
		this.el = $(_field);
		this.obj = AttrHelper.getAttribute(this.el, "_VALIDATEOBJ_");
		this.warning = "";		
	},
	execute : function(){
		this.warning = "";
		var v = $$F(this.el) || EleHelper.getValue(this.el);
		if(v==null || v.trim() == ''){
			if(ValidationHelper.isRequired(this.obj, this.el)){
				this.warning = this.warn("REQUIRED", "msg_info");
				return false;
			}
			return true;
		}
		if(this.obj['format']){
			eval("this.outerformat = " + this.obj['format'] + ";"); 
			if(this.obj['message']){
				eval('this.message = "' + this.obj['message'] + '";'); 
			}
			if(!this.outerformat.test(v)){
				if(this.message){
					this.warning += this.message;
					return false;
				}
				this.warning += String.format(m_Vdcf.warn_reginfo, this.outerformat);
				return false;
			}
		}
		if(this.format && !this.format.test(v)){
			this.warning += this.warn(this.formatType||this.type.toUpperCase(), "msg_info");
			return false;
		}
		return this.method();
	},
	_warn : function(){
		var args = $A(arguments);
		args.unshift(m_Vdcf.warn_info);
		return String.format.apply(null, args);
	},
	warn : function(){
		return this._warn(this._info.apply(this, arguments));
	},
	_info : function(info, infoType, value){
		//var args = value ? [value] : [];
		var args = Array.prototype.slice.call(arguments, 2);
		var desc = this.obj[m_Vdcf.DESC] || this.el.getAttribute("elname",2) || this.el.name || this.el.id;
		args.unshift(desc);
		args.unshift(m_Vdcf.msg_info[info]);
		return String.format.apply(null, args);
	},
	_check : function(){
		return true;
	},
	getMessage : function(){
		return '';
	}
};

var NumVdtor = defClass();
Object.extend(NumVdtor.prototype, AbsVdtor.prototype);
Object.extend(NumVdtor.prototype, {
	initialize : function(_field) {
		AbsVdtor.prototype.initialize.call(this, _field);
		var type = this.type = this.obj['type'].trim().toUpperCase();
		if(type == 'INT' || type == 'INTEGER'){
			this.parseMethod = parseInt;
			this.format = new RegExp('^-?\\d+(e[\+-]?\\d+)?$', "i");
		}else{
			this.parseMethod = parseFloat;
			this.format = new RegExp('^-?\\d+(\\.\\d+)?(e[\+-]?\\d+)?$', "i");
		}
		if(!this._check()) return false;
	},
	method : function(){
		var v = this.parseMethod($$F(this.el)) || 0;
		if(this.obj['value_range']){
			if(this.minValue > v || v > this.maxValue){
				this.warning += this.warn("VALUE_RANGE", "msg_info", this.minValue, this.maxValue);
				return false;
			}
			return true;
		}
		if(this.obj['min'] && v < this.minValue){
			this.warning += this.warn("MIN", "msg_info", this.minValue);
			return false;
		}
		if(this.obj['max'] && v > this.maxValue){
			this.warning += this.warn("MAX", "msg_info", this.maxValue);
			return false;
		}
		return true;
	},
	getMessage:function (){
		var msg = "";
		if(this.obj['value_range']){
			return this._info("VALUE_RANGE", "msg_info", this.minValue, this.maxValue);
		}
		if(this.obj['min']){
			msg += this._info("MIN", "msg_info", this.minValue);
		}
		if(this.obj['max']){
			msg += this._info("MAX", "msg_info", this.maxValue);
		}
		return msg;
	},
	_check : function(){
		if(this.obj['value_range']){
			var arr = this.obj['value_range'].split(",");
			this.minValue = this.parseMethod(arr[0]) || Number.NEGATIVE_INFINITY;
			this.maxValue = this.parseMethod(arr[1]) || Number.POSITIVE_INFINITY;
		}
		if(this.obj['min']){
			this.minValue = this.parseMethod(this.obj['min']) || Number.NEGATIVE_INFINITY;
		}
		if(this.obj['max']){
			this.maxValue = this.parseMethod(this.obj['max']) || Number.POSITIVE_INFINITY;
		}
		return true;
	}	
});

var StrVdtor = defClass();
Object.extend(StrVdtor.prototype, AbsVdtor.prototype);
Object.extend(StrVdtor.prototype, {
	initialize : function(_field) {
		AbsVdtor.prototype.initialize.call(this, _field);
		if(!this._check()) return false;
	},
	method : function(){
		var len = ($$F(this.el)||'').byteLength();
		if(this.obj['length_range']){
			var lengthRange = this.obj['length_range'].split(',');
			if(lengthRange[0] > len || len > lengthRange[1]){
				this.warning += this.warn("LENGTH_RANGE", "msg_info", lengthRange[0], lengthRange[1]);
				return false;
			}
			return true;
		}
		if(this.obj['min_len'] && len < this.minLen){
			this.warning += this.warn("MIN_LEN", "msg_info", this.minLen);
			return false;
		}
		if(this.obj['max_len'] && len > this.maxLen){
			this.warning += this.warn("MAX_LEN", "msg_info", this.maxLen);
			return false
		}
		return true;
	},
	getMessage : function(){
		var msg = "";
		if(this.obj['len_range']){
			return this._info("LENGTH_RANGE", "msg_info", this.minLen, this.maxLen);
		}
		if(this.obj['min_len']){
			msg += this._info("MIN_LEN", "msg_info", this.minLen);
		}
		if(this.obj['max_len']){
			msg += this._info("MAX_LEN", "msg_info", this.maxLen);
		}	
		if(msg == '' && ValidationHelper.isRequired(this.obj, this.el)){
			msg = this._info("REQUIRED", "msg_info");
		}
		return msg;
	},
	_check : function(){
		if(this.obj['len_range']){
			var arr = this.obj['len_range'].split(",");
			this.minLen = parseInt(arr[0]) || 0;
			this.maxLen = parseInt(arr[1]) || Number.POSITIVE_INFINITY;			
		}
		if(this.obj['min_len']){
			this.minLen = parseInt(this.obj['min_len']) || 0;
		}
		if(this.obj['max_len']){
			this.maxLen = parseInt(this.obj['max_len']) || 0;
		}
		return true;
	}
});


var DateVdtor = defClass();
Object.extend(DateVdtor.prototype, AbsVdtor.prototype);
Object.extend(DateVdtor.prototype, {
	formatRegExp : /^(yy|yyyy)(-|\/)(m{1,2})(\2)(d{1,2})(\W+(h{1,2})(:)(M{1,2})((\8)(s{0,2}))?)?$/,
	dateRegExp : /^(\d{2}|\d{4})(-|\/)(\d{1,2})(\2)(\d{1,2})(\W+(\d{1,2})(:)(\d{1,2})((\8)(\d{0,2}))?)?$/,
	initialize : function(_field) {
		AbsVdtor.prototype.initialize.call(this, _field);
		if(!this._check()) return false;
	},
	method : function(){
		var sFormat = this.obj['date_format'];
		if(!sFormat){
			var type = this.obj['type'];
			if(type == 'date'){
				sFormat = "yyyy-mm-dd";
			}else if(type == 'datetime'){
				sFormat = "yyyy-mm-dd HH:MM:ss";
			}
		}
		var sTemp = sFormat.replace(/yy|mm|dd|hh|ss/gi, "t").replace(/m|d|h|s/ig, '\\d{1,2}').replace(/t/ig, '\\d{2}');
		var oRegExp = new RegExp("^"+sTemp+"$");
		var sValue = $$F(this.el) || '';
		if(!oRegExp.test(sValue)){
			this.warning = "\u6CA1\u6709\u5339\u914D\u65E5\u671F\u683C\u5F0F:" + sFormat;
			return false;
		}
		var matchs = sValue.match(this.dateRegExp);
		if(!matchs){
			this.warning = "\u6CA1\u6709\u5339\u914D\u65E5\u671F\u683C\u5F0F:" + sFormat;;   
			return false;
		}
		var year = parseInt(matchs[1], 10);
		var month = parseInt(matchs[3], 10);
		var day = parseInt(matchs[5], 10);

		var hour = parseInt(matchs[7], 10);
		var minute = parseInt(matchs[9], 10);
		var second = parseInt(matchs[12], 10);
		
		if(month < 1 || month > 12){
			this.warning = "\u6708\u4EFD\u5E94\u8BE5\u4E3A1\u523012\u7684\u6574\u6570";   
			return false;
		}
		if (day < 1 || day > 31){
			this.warning = "\u6BCF\u4E2A\u6708\u7684\u5929\u6570\u5E94\u8BE5\u4E3A1\u523031\u7684\u6574\u6570"; 
			return false;
		}
		if ((month==4 || month==6 || month==9 || month==11) && day==31){   
			this.warning = "\u8BE5\u6708\u4E0D\u5B58\u572831\u53F7";   
			return false;   
		}   
		if (month==2){   
			var isleap=(year % 4==0 && (year % 100 !=0 || year % 400==0));   
			if (day>29){   
				this.warning = "2\u6708\u6700\u591A\u670929\u5929";   
				return false;   
			}   
			if ((day==29) && (!isleap)){   
				this.warning = "\u95F0\u5E742\u6708\u624D\u670929\u5929";   
				return false;   
			}   
		}
		if(hour && hour<0 || hour>23){   
			this.warning = "\u5C0F\u65F6\u5E94\u8BE5\u662F0\u523023\u7684\u6574\u6570";   
			return false;   
		}   
		if(minute && minute<0 || minute>59){   
			this.warning = "\u5206\u5E94\u8BE5\u662F0\u523059\u7684\u6574\u6570";   
			return false;   
		}   
		if(second && second<0 || second>59){   
			this.warning = "\u79D2\u5E94\u8BE5\u662F0\u523059\u7684\u6574\u6570";   
			return false;   
		}		
		return true;
	},
	getMessage : function(){
		var sFormat = this.obj['date_format'];
		if(!sFormat){
			var type = this.obj['type'];
			if(type == 'date'){
				sFormat = "yyyy-mm-dd";
			}else if(type == 'datetime'){
				sFormat = "yyyy-mm-dd HH:MM:ss";
			}
		}
		return String.format("\u65E5\u671F\u683C\u5F0F\u4E3A\uFF1A{0}" ,sFormat);
	}
});

function _valid(ev){
	var el = this;
	var rst = ValidationHelper.valid(el);
	if(rst==null)return;
	if(window.bShowTitle)
		el.title = !rst.isValid ? rst.warning : rst.message;
	Element[rst.isValid?'removeClassName':'addClassName'](el, 'valid_error');
}
function initEvents(){
	var doms = [], tags = ["INPUT", "TEXTAREA", "SELECT"];
	for (var i = 0; i < tags.length; i++){
		var eles = document.body.getElementsByTagName(tags[i]);
		doms.push.apply(doms, $A(eles));
	}
	for(var i = 0; i < doms.length; i++){
		var dom = doms[i], f = (window.onValid||_valid).bind(dom);
		if(dom.getAttribute("validation", 2)==null)continue;
		Event.observe(dom, 'change', f);
		Event.observe(dom, 'blur', f);
		Event.observe(dom, 'focus', f);
	}

}
exCenter.onafterInitData(function(){
	var doms = [], tags = ["INPUT", "TEXTAREA", "SELECT"];
	for (var i = 0; i < tags.length; i++){
		var eles = document.body.getElementsByTagName(tags[i]);
		doms.push.apply(doms, $A(eles));
	}
	for(var i = 0; i < doms.length; i++){
		var dom = doms[i];
		var v = dom.getAttribute("validation", 2), pt, tmp, fmt;
		var pt = dom.getAttribute("pattern", 2);
		if(pt=='string' && (fmt = dom.getAttribute("xd:datafmt", 2))!=null){
			if(fmt.indexOf('"number"')!=-1)
				pt =  fmt.indexOf('numDigits:auto')!=-1? 'float' : 'integer';
		}
		if(v==null || v.trim().length<=0){
			if(pt==null || pt=='string')continue;
			dom.setAttribute("validation", 'type:\'' + pt + '\'');
		}else if(pt!=null && pt!='string'){
			if(v.indexOf('type:')!=-1){
				v = v.replace(/(^|,)type:[^,]*(,|$)/, '$1type:\'' + pt + '\'$2');
			}else{
				v = v + ',type:\'' + pt + '\'';
			}
			dom.setAttribute("validation", v);
		}
		(window.onValid||_valid).apply(dom, []);
	}
	initEvents();
});
function _validError(){
	//donothing
}
document.getElementsByClassName = function(cls, p) {
	if(p && p.getElementsByClassName) return p.getElementsByClassName(cls);
	var arr = ($(p) || document.body).getElementsByTagName('*');
	var rst = [];
	var regExp = new RegExp("(^|\\s)" + cls + "(\\s|$)");
	for(var i=0,n=arr.length;i<n;i++){
		if (arr[i].className.match(regExp))
			rst.push(arr[i]);
	}
	return rst;
}
function doValidAppendixFields(_msgs, _infos){
	var rtv = true;
	var fileAttachmentEls = document.getElementsByClassName("xdFileAttachment");
	rtv = rtv && collectValidInfo(fileAttachmentEls, _msgs, _infos);
	var inlinePictureEls = document.getElementsByClassName("xdInlinePicture");
	rtv = rtv && collectValidInfo(inlinePictureEls, _msgs, _infos);
	return rtv;
}
function collectValidInfo(appendixDoms, _msgs, _infos){
	var rtv = true;
	for(var i=0; i<appendixDoms.length; i++){
		var currDom = appendixDoms[i];
		var validationInfo = currDom.getAttribute("validation");
		if(validationInfo == null) return;
		eval("var validationInfo={" + validationInfo +"}");
		if(validationInfo['required'] == true){
			var tipDoms = document.getElementsByClassName('appendix_txt', currDom);
			var markDom = null;
			if(tipDoms[0] != null)
				markDom = tipDoms[0];
			else{
				tipDoms = currDom.childNodes;
				for(var j=0; j<tipDoms.length; j++){
					if((tipDoms[j].tagName).toUpperCase() != 'SPAN')continue;
					else if(tipDoms[j].getAttribute("text_body", 2) == 1)
						markDom = tipDoms[j];
				}
			}
			if(markDom != null && markDom.style.display == ''){
				var name = currDom.getAttribute("trs_field_name", 2);
				_msgs.push(name + "\u4E0D\u80FD\u4E3A\u7A7A");
				_infos.push({
					id : currDom.id,
					isValid : false,
					message : name + "\u4E0D\u80FD\u4E3A\u7A7A",
					warning : name + "\u4E0D\u80FD\u4E3A\u7A7A"
				})
				rtv = rtv && false;
			}
			 
		}
	}
	return rtv;
}
exCenter.onbeforeSubmit(function(json){
	var rsts = ValidationHelper.validForm(document.body);
	var rtv = true, msgs = [], valid, infos = [];
	for(var i=0;i<rsts.length;i++){
		valid = rsts[i].isValid;
		rtv = rtv && valid;
		if(!valid){
			infos.push(rsts[i]);
			msgs.push(rsts[i].warning);
		}
	}
	rtv = rtv && doValidAppendixFields(msgs, infos);
	json.msgs = msgs;
	json.infos = infos;
	(window.onValidError || _validError)(json);
	return rtv;
});
