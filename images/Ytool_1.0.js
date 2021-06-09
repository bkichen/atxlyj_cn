/// <reference path="jquery.min.js" />
function Ytool() { }

////////////////////辅助方法//////////////////////////////////////////////////////

//tab、onOff和onOffAnimate辅助方法（当前元素显示，其他元素隐藏）

Ytool.prototype.otherHide = function (index, btn, content, btnStyle) {
    btn.eq(index).addClass(btnStyle);
    btn.not(":eq(" + index + ")").removeClass(btnStyle);
    content.eq(index).show();
    content.not(":eq(" + index + ")").hide();
}

//tab和onOffAnimate辅助方法（适合需要左右滑动效果的方法使用）

Ytool.prototype.showContent = function (btnIndex, btn, content, btnStyle, inDirection) {
    var inClass = "";
    var outClass = "";
    if (inDirection == 0) {
        inClass = "fadeInRightBig";
        outClass = "fadeOutLeftBig";
    }
    else if (inDirection == 1) {
        inClass = "fadeInLeftBig";
        outClass = "fadeOutRightBig";
    }
    btn.eq(btnIndex).addClass(btnStyle);
    btn.not(":eq(" + btnIndex + ")").removeClass(btnStyle);
    content.eq(btnIndex).show(500);
    content.eq(btnIndex).removeClass("animated fadeOutRightBig fadeOutLeftBig");
    content.eq(btnIndex).addClass("animated " + inClass);
    content.not(":eq(" + btnIndex + ")").removeClass("animated fadeInRightBig fadeInLeftBig");
    content.not(":eq(" + btnIndex + ")").addClass("animated " + outClass);
    content.not(":eq(" + btnIndex + ")").hide(500);
}

/////////////////////////////头部导航自动渐变贴顶////////////////////////////////////////
/////////////////////////////navFixed////////////////////////////////////////////
///////////////(*使用时需要放在$(window).scroll(function (){})中)

Ytool.prototype.navFixed = function (ob, className) {
    if (ob.offset().top <= $(window).scrollTop()) {
        ob.addClass(className);

        if ($(window).scrollTop() == 0) {
            ob.removeClass(className);
        }
    }
}

///////////////"元素出现动画"核心代码（只有元素出现在窗口中才能触动////////////////////////////////////////
/////////////////////////////animateShow////////////////////////////////////////////

Ytool.prototype.animateShow = function (ob, className) {

    //元素在window窗口下方的情况

    var top = $(window).height() - ob.offset().top + $(window).scrollTop();

    //元素在window窗口上方的情况

    var btm = $(window).scrollTop() - ob.offset().top - ob.height();

    if (top > 0 && btm < 0) {
        ob.css("opacity", "1");
        ob.addClass(className);
    }
    else {
        ob.css("opacity", "0");
        ob.removeClass(className);
    }
}

///////////////多组"元素出现动画"循环遍历////////////////////////////////////////
/////////////////////////////moreAnimate////////////////////////////////////////////

Ytool.prototype.moreAnimate = function (situate, group) {
    if (situate == 0) {
        for (i = 0; i < group.length; i++) {

            var more = new Ytool();
            more.animateShow(group[i][0], group[i][1]);
            //animateShow(group[i][0], group[i][1]);
        }
    }//在$(window).scroll（）方法内部时
    else if (situate == 1) {
        for (i = 0; i < group.length; i++) {
            group[i][0].addClass(group[i][1]);
        }
    }//在$(window).scroll（）方法外部时(不需判断是否在可视区域内，页面加载就启动)
}

//////列表延迟进入动画//////////////////////////////

Ytool.prototype.listAnimateShow = function (ob, className) {
    for (i = 0; i < ob.length; i++) {
        ob.eq(i).addClass("animated " + className);
        ob.eq(i).css({ 'animation-delay': (i / 10) + 's' });
    }
}

////////////////////////tab标签功能（适合横版li，可按两种方向滑动）//////////////////////////////

Ytool.prototype.tab = function (btn, content, btnStyle) {

    var tab = new Ytool();

    tab.otherHide(0, btn, content, btnStyle);

    btn.click(function () {

        for (i = 0; i < btn.length; i++) {

            if (btn.eq(i).hasClass(btnStyle)) {
                var btnIndex = parseInt($(this).index());
                if (btnIndex < i) {
                    tab.showContent(btnIndex, btn, content, btnStyle, 1);//1为从左进入
                }
                else if (btnIndex > i) {
                    tab.showContent(btnIndex, btn, content, btnStyle, 0);//0为从右进入
                }
            }
        }
    });
}

///////标题按钮开关功能（4参数）简单show和hide功能///////////////////////////////
//(第一个参数只有0和1，0默认第一个内容关闭，1默认第一个内容打开)
//(btn为按钮元素对象)
//(btnStyle为点击之后为按钮添加的样式类名)

Ytool.prototype.onOff = function (key, btn, content, btnStyle) {

    var onOff = new Ytool();

    if (key == 1) {
        onOff.otherHide(0, btn, content, btnStyle);
    }
    else if (key == 0) {
        content.hide();
    }
    btn.mouseover(function () {
        var btnIndex = parseInt($(this).index());
        var className = "." + btnStyle;

        if (btn.eq(btnIndex).is(className)) {
            btn.eq(btnIndex).removeClass(btnStyle);
            content.eq(btnIndex).hide();
        } else {
            onOff.otherHide(btnIndex, btn, content, btnStyle);
        }
    });
}

///////标题按钮开关功能（4参数）效果为slide///////////////////////////////////////
//点击当前标签时，其他标签无法关闭，需手动

Ytool.prototype.onOffSlide = function (btn, content, btnClassName) {
    content.hide();
    btn.click(function () {
        var btnIndex = parseInt($(this).index());
        var className = "." + btnClassName
        if (btn.eq(btnIndex).is(className)) {
            btn.eq(btnIndex).removeClass(btnClassName);

            content.eq(btnIndex).slideUp();
        } else {
            btn.eq(btnIndex).addClass(btnClassName);
            content.eq(btnIndex).slideDown();
        }
        //content.eq(btnIndex).slideToggle();
    });
}

///////标题按钮开关功能（5参数）效果为左右滑动////////////////////////////////////
//key为0，第一块内容默认隐藏，为1，默认显示
//directionKey为0，从右滑进，为1，从左滑进

Ytool.prototype.onOffAnimate = function (key, btn, content, btnStyle, directionKey) {

    var onOffAnimate = new Ytool();

    if (key == 1) {
        onOffAnimate.otherHide(0, btn, content, btnStyle);
    }
    else if (key == 0) {
        content.hide();
    }
    btn.click(function () {

        var btnIndex = parseInt($(this).index());
        var className = "." + btnStyle

        if (btn.eq(btnIndex).is(className)) {

            btn.eq(btnIndex).removeClass(btnStyle);

            if (directionKey == 0) {
                content.eq(btnIndex).addClass("animated fadeOutLeftBig");
            } else if (directionKey == 1) {
                content.eq(btnIndex).addClass("animated fadeOutRightBig");
            }

        } else {
            onOffAnimate.showContent(btnIndex, btn, content, btnStyle, directionKey);
        }

    });
}

////////////////////////普通锚点定位（无缓冲效果）//////////////////////////////

Ytool.prototype.anchorGen = function (btn, obClassName) {
    btn.click(function () {
        var index = parseInt($(this).index());
        document.getElementsByClassName(obClassName)[index].scrollIntoView();
    });
}

////////////////////////缓冲锚点定位//////////////////////////////

Ytool.prototype.anchorBuff = function (btn, topBtn, ob, btnStyle, headerHeight) {
    topBtn.on('mouseover', function () {
        $('html,body').animate({ scrollTop: 0 }, 800);
        btn.removeClass(btnStyle);
    });

    $('.anchor_btn').on('mouseover', function (event) {
        var index = parseInt($(this).index('.anchor_btn'));
        btn.addClass(btnStyle);
        btn.not(":eq(" + index + ")").removeClass(btnStyle);
        $('html,body').animate({ scrollTop: (ob.eq(index).offset().top - headerHeight) }, 800);
        event.preventDefault();
    });

    $(window).scroll(function () {
        for (var i = 0; i < btn.length; i++) {
            if ((ob.eq(i).offset().top - headerHeight) <= $(window).scrollTop()) {
                btn.eq(i).addClass(btnStyle);
                btn.not(":eq(" + i + ")").removeClass(btnStyle);
            }
            else {
                btn.eq(i).removeClass(btnStyle);
            }
        }
    });
}

////////////////////////滚轮滚动缓冲动画//////////////////////////////
////////////////////////tranAnimation//////////////////////////////
///////////////(*使用时需要放在$(window).scroll(function (){})中)

Ytool.prototype.tranAnimation = function (topPosition, ob, className) {
    for (var i = 0; i < ob.length; i++) {
        if ((ob.eq(i).offset().top - $(window).scrollTop()) <= topPosition) {
            ob.eq(i).addClass(className);
        }
        else {
            ob.eq(i).removeClass(className);
        }
    }
}

Ytool.prototype.tabGene = function (btn, content, btnStyle) {
    var tabGene = new Ytool();
    tabGene.otherHide(0, btn, content, btnStyle);
    btn.mouseover(function () {
        var index = parseInt($(this).index());
        tabGene.otherHide(index, btn, content, btnStyle);
    });
}