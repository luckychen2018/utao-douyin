const _ctrlx={
    play(){
        _menuCtrl.menu();
    }
};
(function(){
    _tvFunc.check(function (){return document.getElementsByTagName("video").length>0;},function (){
        console.log("video found")
       // document.getElementsByTagName("video")[0].classList.add("utv-video-full");
        _tvFunc.fullscreen("video");
        $$("video").css("position","fixed !important")
    });
    let _app={
        init(){
            _tvFunc.check(function(){return  document.getElementsByTagName("video").length>0;},function(index){
                //全屏
                let menuId = _detailInit(null,999990,true);
            },1000);
        }
    };
    _app.init();


})();

let _data={
    vue:null,
    initData(vue){
        this.vue=vue;
        this.vue.video=false;
        this.fullscreen();
    },
    fullscreen(){
        //$$("#player_pagefullscreen_msg_player").click();
        //音量100
        _tvFunc.volume100();
        _tvFunc.videoReady(function (video){
            if(video.paused){
                video.play();
            }
        })
    }
};