let url = window.location.href;
let index= url.indexOf("tag=");
let tag = url.substring(index+4,url.length);
//api.vonchange.com
let playUrl=null;
let initPlayer=function (){
    fetch("http://api.vonchange.com/utao/sctv?tag="+tag)
        .then((response) => response.text())
        .then((data) => {console.log(data);
            if(data&&data.trim()!==""){
                playUrl=data;
                const config = {
                    "id": "mse",
                    "url": data,
                    "playsinline": true,
                    "plugins": [],
                    "isLive": true,
                    "autoplay": true,
                    volume: 1,
                    "width": "100%",
                    "height": "100%"
                }
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
