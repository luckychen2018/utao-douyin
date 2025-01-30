package tv.utao.x5.dao;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;

import java.util.List;

@Dao
public interface HistoryDao {
    @Query("SELECT * FROM history where  site=:site order by update_time desc limit 60")
    List<History> queryHistoryBySite(String site);


    @Query("SELECT * FROM history  order by update_time desc limit 120")
    List<History> queryHistory();
    @Insert
    void insertAll(History... histories);
    @Query("SELECT * FROM history where vod_id =:vodId and site=:site")
    List<History> queryByVodId(String vodId,String site);

    @Query("update history set remark =:remark,url=:url,update_time=:updateTime where vod_id =:vodId and site=:site")
    //@Update
    int updateUrl(String  vodId,String site,String remark,String url,Long updateTime);

}