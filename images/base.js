/// <reference path="jquery-1.7.2.min.js" />
$(function () {
    // 导航帖顶
    $(window).scroll(function () {

        if ($(window).scrollTop() > 180) {
            $(".big_nav").addClass("active");
        }
        else {
            $(".big_nav").removeClass("active");
        }

    });

    // 选择“分类搜索”、“一网搜索”
    $('.search_choose_btn').click(function () {
        var index = parseInt($(this).index('.search_choose_btn'));
        $('.search_other_btn').eq(index).slideToggle();
    })
    $('.search_other_btn img').click(function () {
        var parentIndex = parseInt($(this).parents('.search').index('.search'));
        var btnIndex = parseInt($(this).index());

        $('.search_btn').eq(parentIndex).children('.search_btn_1').children('img').eq(btnIndex).addClass('active').siblings().removeClass('active');
        $('.search_other_btn').eq(parentIndex).hide();
    })
    $(document).click(function(e) {
        
        var index = parseInt($(this).parents('.click_outer').index('.click_outer'));
        var btn_index = parseInt($(this).index('.click_btn'));

        var isOuterShow = $('.footer_right_hidden').css('display') === 'block' ? true : false;
        var isInnerShow = $('.click_bodies').eq(index).children('.click_body').eq(btn_index).css('display') === 'block' ? true : false;
        // 隐藏
            $('.footer_right_hidden').slideUp();
            $('.click_btn').removeClass('active');
            //$('.click_btn').eq(btn_index).removeClass('active');
            
       
    });
    // 右侧站群导航和相关链接的显示隐藏
    $(".click_btn").click(function (e) {
        e.stopPropagation();
        var index = parseInt($(this).parents('.click_outer').index('.click_outer'));
        var btn_index = parseInt($(this).index('.click_btn'));

        $('.click_btn').eq(btn_index).addClass('active');
        $('.click_btn').not(":eq(" + btn_index + ")").removeClass('active');

        var isOuterShow = $('.footer_right_hidden').css('display') === 'block' ? true : false;
        var isInnerShow = $('.click_bodies').eq(index).children('.click_body').eq(btn_index).css('display') === 'block' ? true : false;
        // 隐藏
        if (isOuterShow && isInnerShow) {
            $('.footer_right_hidden').slideUp();

            $('.click_btn').eq(btn_index).removeClass('active');
        } else { // 显示
            $('.click_bodies').eq(index).children('.click_body').eq(btn_index).show().siblings().hide();
            $('.footer_right_hidden').slideDown();
        }
    });

    


    // 手机版导航显示
    $('.show_nav').click(function () {
        $('.big_nav .right').slideToggle();
    })




})

