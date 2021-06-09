
var timeout = 300;
var closetimer = 0;
var ddmenuitem = null;
var donghua = 300;

function jsddm_open() {
    jsddm_canceltimer();
    ddmenuitem = $(this).find('ul').eq(0);
    if (ddmenuitem.is(":hidden")) {
        $('.pz_menu li ul').fadeOut(donghua);
        ddmenuitem.fadeIn(donghua);
    }
}

function jsddm_close() {
    if (ddmenuitem != null) {
        if (ddmenuitem.is(":visible")) {
            ddmenuitem.fadeOut(donghua);
        }
    }
}

function jsddm_timer() {
    closetimer = window.setTimeout(jsddm_close, timeout);
}

function jsddm_canceltimer() {
    if (closetimer) {
        window.clearTimeout(closetimer);
        closetimer = null;
    }
}

$(document).ready(function () {
    $('.pz_menu > li').bind('mouseover', jsddm_open);
    $('.pz_menu > li').bind('mouseout', jsddm_timer);
});

document.onclick = jsddm_close;