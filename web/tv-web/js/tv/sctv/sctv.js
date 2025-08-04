let url = window.location.href;
let index= url.indexOf("tag=");
let tag = url.substring(index+4,url.length);
//api.vonchange.com
let playUrl=null;
let initPlayer=function (){
<<<<<<< HEAD
    fetch("http://api.vonchange.com/utao/sctv?tag="+tag)
=======
    _apiX.getJson("http://api.vonchange.com/utao/sctv?tag="+tag,   { "User-Agent": _apiX.userAgent(false), "tv-ref": "http://api.vonchange.com" },function(data){
        console.log(data);
        if(data&&data.trim()!==""){
            playUrl=data;
            const config = {
                "id": "mse",
                "url": data,
                "hlsOpts": {
                    xhrSetup: function(xhr, url) {
                       // xhr.setRequestHeader('tv-ref', 'https://www.sctv.com/');
                    }
                },
                "playsinline": true,
                "plugins": [],
                "isLive": true,
                "autoplay": true,
                volume: 1,
                "width": "100%",
                "height": "100%"
            }
            //config.plugins.push(HlsPlayer);
//config.plugins.push(FlvPlayer)
            player = new HlsJsPlayer(config);
        }
    });
   /* fetch("http://api.vonchange.com/utao/sctv?tag="+tag)
>>>>>>> 9df0996e87f5dfe893b4155841963ce5fe3eb02c
        .then((response) => response.text())
        .then((data) => {console.log(data);
            if(data&&data.trim()!==""){
                playUrl=data;
                const config = {
                    "id": "mse",
                    "url": data,
<<<<<<< HEAD
=======
                    "hlsOpts": {
                        xhrSetup: function(xhr, url) {
                            xhr.setRequestHeader('Referer', 'https://www.sctv.com/');
                        }
                    },
>>>>>>> 9df0996e87f5dfe893b4155841963ce5fe3eb02c
                    "playsinline": true,
                    "plugins": [],
                    "isLive": true,
                    "autoplay": true,
                    volume: 1,
                    "width": "100%",
                    "height": "100%"
                }
<<<<<<< HEAD
                config.plugins.push(HlsPlayer);
//config.plugins.push(FlvPlayer)
                player = new Player(config);
            }
        });
}
let reloadLive=function (){
    fetch("http://api.vonchange.com/utao/sctv?tag="+tag)
        .then((response) => response.text())
        .then((data) => {console.log(data);
=======
                //config.plugins.push(HlsPlayer);
//config.plugins.push(FlvPlayer)
                player = new HlsJsPlayer(config);
            }
        });*/
}
let reloadLive=function (){
    _apiX.getJson("http://api.vonchange.com/utao/sctv?tag="+tag,   { "User-Agent": _apiX.userAgent(false), "tv-ref": "http://api.vonchange.com" },function(data){
        console.log(data);
>>>>>>> 9df0996e87f5dfe893b4155841963ce5fe3eb02c
            if(data&&data.trim()!==""){
                if(data!==playUrl){
                    playUrl=data;
                    player.src=data;
                }
            }
        });
}


initPlayer();
setInterval(function(){console.log("reloadLive");reloadLive();},1000*60*5);
