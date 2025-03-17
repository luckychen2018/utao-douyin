package tv.utao.x5.dao;

import android.content.Context;

import java.util.Date;
import java.util.List;

import tv.utao.x5.call.StringCallback;
import tv.utao.x5.domain.live.Vod;
import tv.utao.x5.service.UpdateService;
import tv.utao.x5.util.JsonUtil;
import tv.utao.x5.util.LogUtil;

public class HistoryDaoX {
    private static String TAG="HistoryDaoX";

    public  static  void save(Context context, String data,StringCallback stringCallback){
        HistoryDao historyDao = AppDatabase.getInstance(context).historyDao();
        new Thread(()-> {
                History history =  JsonUtil.fromJson(data, History.class);
                //vodId
                history.id=null;
                String vodId = history.vodId;
                List<History> historyListOrg =   historyDao.queryByVodId(vodId,history.site);
                String url=null;
                if(historyListOrg.isEmpty()){
                    history.createTime=new Date().getTime();
                    history.updateTime=new Date().getTime();
                    historyDao.insertAll(history);
                    url=history.url;
                }else{
                    url=historyListOrg.get(0).url;
                }
                LogUtil.i(TAG,"loadUrl"+url);
                stringCallback.data(url);
        }).start();
    }
    public  static  List<History> queryHistory(Context context){
        HistoryDao historyDao = AppDatabase.getInstance(context).historyDao();
        //@todo 大于150 才
        historyDao.clearData();
        return    historyDao.queryHistory();
    }

    public static Vod currentChannel(Context context){
        HistoryDao historyDao = AppDatabase.getInstance(context).historyDao();
        History history =   historyDao.queryOneBySite("tv");
        if(null==history){
            return UpdateService.getByKey("0_0");
        }
        Vod vod= UpdateService.getByUrl(history.url);
        if(null==vod){
            return UpdateService.getByKey("0_0");
        }
        return vod;
    }
    public static void updateChannel(Context context, String url){
        HistoryDao historyDao = AppDatabase.getInstance(context).historyDao();
        History history =   historyDao.queryOneBySite("tv");
        Vod vod = UpdateService.getByUrl(url);
        if(null==vod){
            return;
        }
        if(null==history){
            History historyNew = new History();
            historyNew.url=vod.getUrl();
            historyNew.name=vod.getName();
            historyNew.site="tv";
            historyNew.vodId="0";
            historyNew.createTime=new Date().getTime();
            historyNew.updateTime=new Date().getTime();
            historyDao.insertAll(historyNew);
            return ;
        }
        LogUtil.i(TAG,vod.getName()+vod.getUrl());
        historyDao.updateChannel(history.id,vod.getName(),vod.getUrl(),new Date().getTime());

    }
   /* public  static  void all(Context context,String data){
        HistoryDao historyDao = AppDatabase.getInstance(context).historyDao();
        new Thread(new Runnable() {
            @Override
            public void run() {
                BaseMsg baseMsg = JsonUtil.fromJson(data, BaseMsg.class);
                String msgId=baseMsg.getMsgId();
                List<History> historyList =   historyDao.queryHistory();
                Map<String,String> dataMap = new HashMap<>();
                dataMap.put("key",msgId);
                dataMap.put("value",JsonUtil.toJson(historyList));
                //MainActivity.postMessage("sessionStorage",JsonUtil.toJson(dataMap));
            }
        }).start();
    }*/
    public  static  void update(Context context,String data){
        HistoryDao historyDao = AppDatabase.getInstance(context).historyDao();
        new Thread(()-> {
                History history =  JsonUtil.fromJson(data, History.class);
                //vodId
               List<History> histories = historyDao.queryByVodId(history.vodId,history.site);
               if(histories.isEmpty()){
                   history.createTime=new Date().getTime();
                   history.updateTime=new Date().getTime();
                   historyDao.insertAll(history);
                   return;
               }
               historyDao.updateUrl(history.vodId,history.site,history.remark,history.url,new Date().getTime());
        }).start();
    }
}
