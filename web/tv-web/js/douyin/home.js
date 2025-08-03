// 定义Filter枚举
const Filter = {
    default: 'default',
    hot: 'hot',
    new: 'new',
    best: 'best'
};

var _data={
    vue:null,
    initData(vue){
       this.vue=vue;
       this.channels();
       this.channelPage();
    },
    channels(){
        _data.vue.channels.push({id:1,tag:"hot",name:"推荐",loading:false,filter:Filter.hot,pageNum:0,vods:[]});
        _data.vue.channels.push({id:2,tag:"follow",name:"关注",loading:false,filter:Filter.hot,pageNum:0,vods:[]});
        _data.vue.channels.push({id:3,tag:"search",name:"搜索",loading:false,filter:Filter.hot,pageNum:0,vods:[]});
        _data.vue.filters=[Filter.default,Filter.hot,Filter.new,Filter.best];
    },
    genSort(filter){
        if(filter===Filter.default){
            return "0";
        }
        if(filter===Filter.hot){
            return "1";
        }
        if(filter===Filter.new){
            return "2";
        }
        if(filter===Filter.best){
            return "3";
        }
        return "0";
    },
    channelPage(channelItem){
        if(!channelItem){
            channelItem=this.vue.channels[0];
        }
        if (channelItem.loading) {
            console.warn("已有数据真正加载中");
            return;
        }
        let sort= this.genSort(channelItem.filter);
        channelItem.loading=true;
        let pageNum=channelItem.pageNum+1;
        // 抖音API请求URL - 使用网页版API端点
        let requestUrl=`https://www.douyin.com/aweme/v1/web/feed/`;
        console.log(requestUrl);
        // 构建请求参数
        let params = {
            type: '0',
            count: '20',
            max_cursor: '0',
            min_cursor: '0',
            is_new_user: '0',
            screen_width: window.screen.width,
            screen_height: window.screen.height
        };

        // 构建完整请求URL
        let fullUrl = requestUrl + '?' + Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');

        // 设置请求头
        let headers = {
            "User-Agent": _api.userAgent(true),
            "Referer": "https://www.douyin.com/",
            "Accept": "application/json, text/plain, */*",
            "X-Requested-With": "XMLHttpRequest"
        };

        console.log('请求URL:', fullUrl);

        _api.getJson(fullUrl, JSON.stringify(headers), function(text){
            channelItem.loading=false;
            if(null==text){
                return;
            }
            try {
                let data = JSON.parse(text);
                console.log('抖音API响应:', data);
                channelItem.pageNum++;

                // 解析抖音返回的数据并添加到vods数组
                if(data.aweme_list && data.aweme_list.length>0){
                    data.aweme_list.forEach(item => {
                        // 确保item和必要属性存在
                        if(!item || !item.video || !item.aweme_id) return;

                        let imageUrl = item.video.cover.url_list && item.video.cover.url_list.length > 0 ? item.video.cover.url_list[0] : '';
                        let remark = item.desc || '抖音视频';
                        let title = item.desc || '抖音视频';
                        let url = `https://www.douyin.com/video/${item.aweme_id}`;

                        channelItem.vods.push({
                            id: item.aweme_id,
                            name: title,
                            pic: imageUrl,
                            url: url,
                            remark: remark,
                            "site": "douyin"
                        });
                    });
                } else {
                    console.warn('没有找到视频数据');
                }
            } catch (e) {
                console.error('解析抖音数据失败:', e);
            }
            },function () {
                channelItem.loading=false;
            }
        )
    }
};
 $(function(){
    _tvHtmlInit();
 });