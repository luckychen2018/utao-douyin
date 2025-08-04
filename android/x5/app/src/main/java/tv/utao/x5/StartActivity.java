package tv.utao.x5;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Toast;

import androidx.databinding.DataBindingUtil;


import java.io.File;
import java.util.HashMap;

import tv.utao.x5.api.ConfigApi;
import tv.utao.x5.call.ConfigCallback;
import tv.utao.x5.call.DownloadProgressListener;
import tv.utao.x5.databinding.ActivityStartBinding;
import tv.utao.x5.domain.ApkInfo;
import tv.utao.x5.domain.ConfigDTO;
import tv.utao.x5.util.AppVersionUtils;
import tv.utao.x5.util.FileUtil;
import tv.utao.x5.util.HttpUtil;
import tv.utao.x5.util.LogUtil;
import tv.utao.x5.util.Util;
import tv.utao.x5.util.ValueUtil;
import tv.utao.x5.utils.ToastUtils;

public class StartActivity extends Activity {
    private long mClickBackTime = 0;
    private static final String TAG = "StartActivity";
    protected ActivityStartBinding binding;
   // private static Context thisContext;
    private ConfigDTO thisConfigDTO;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);//隐藏标题栏
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_ALT_FOCUSABLE_IM);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        //setContentView(R.layout.activity_start);
        binding = DataBindingUtil.setContentView(this, R.layout.activity_start);
        Context thisContext=this;
        binding.setUpdateHandler(new UpdateHandler(this));
        //check  更新应用
        //HttpUtil.getJson("https://www.baidu.com",null);
        ConfigApi.syncGetConfig(new ConfigCallback() {
            @Override
            public void getConfig(ConfigDTO configDTO) {
                if(null==configDTO){
                    runOnUiThread(()->{
                        // X5内核已移除，直接跳转到主界面
                        to();
                    });
                    return;
                }
                thisConfigDTO=configDTO;
                int versionCode=  AppVersionUtils.getVersionCode();
                ApkInfo apkInfo = configDTO.getApk();
                int updateCode= apkInfo.getVersion();
                LogUtil.i(TAG,updateCode+" old "+versionCode);
                if(updateCode>versionCode){
                    //更新数据
                    runOnUiThread(()->{
                        if(!apkInfo.getForce()&&isUpdateLater(thisContext)){
                            installX5(thisContext,configDTO);
                            return;
                        }
                        binding.startX5Wrapper.setVisibility(View.GONE);
                        if(apkInfo.getForce()){
                            binding.updateCancelBtn.setVisibility(View.GONE);
                        }
                        binding.updateApkWrapper.setVisibility(View.VISIBLE);
                        //binding.updateApkWrapper.requestFocus();
                        binding.updateDesc.setText(apkInfo.getDesc());
                        binding.updateOkBtn.requestFocus();
                        //binding.updateOkBtn.setNextFocusRightId(R.id.updateCancelBtn);
                    });
                    return;
                }
                installX5(thisContext,configDTO);
            }
        });

    }
    private boolean isUpdateLater(Context context){
        String UpdateLater=ValueUtil.getString(context,"updateLater");
        if(UpdateLater.equals("ok")){
            return true;
        }
        return false;
    }
    private boolean openX5(){
        return "1".equals(ValueUtil.getString(getApplicationContext(),"openX5","0"));
    }
    // X5内核相关方法已移除
    private  void installX5(Context content,ConfigDTO configDTO){
        // X5内核已移除，直接跳转到主界面
        to();
    }
    private void to(){
        Intent intent = new Intent(StartActivity.this, MainActivity.class);
        startActivity(intent);
        finish();
    }
    // X5内核相关方法已移除
      
      // X5内核已移除，此方法不再使用
      public void initX5(String toFilePath){
          LogUtil.i(TAG, "X5内核已移除，无需初始化");
          to();
      }
  
      @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            keyBack();
        }
        return super.onKeyUp(keyCode, event);
    }

    private  void keyBack(){
        long currentTime = System.currentTimeMillis();
        if (currentTime - mClickBackTime < 3000) {
            //killAppProcess();
            finish();
            //super.onBackPressed();
           // System.exit(0);
        } else {
            ToastUtils.show(this, "再按一次返回键退出", Toast.LENGTH_SHORT);
            mClickBackTime = currentTime;
        }
    }

    public class UpdateHandler {
        private Context thisContext;
        public UpdateHandler(Context context) {
            this.thisContext = context;
        }
        public void updateOk() {
            binding.progressApk.setVisibility(View.VISIBLE);
            File targetFile = new File(thisContext.getFilesDir().getPath(), "x5.apk");
            HttpUtil.downloadByProgress(thisConfigDTO.getApk().getUrl(),
                    targetFile, new DownloadProgressListener() {
                        @Override
                        public void onDownloadProgress(long sumReaded, long content, boolean done) {
                            int num = (int)(sumReaded*100/content);
                            runOnUiThread(() -> {
                                binding.progressApk.setProgress(num);
                            });
                        }

                        @Override
                        public void onDownloadResult(File target, boolean done) {
                            runOnUiThread(() -> {
                                if (target != null && target.exists()) {
                                    try {
                                        Util.installApk(StartActivity.this, target);
                                    } catch (Exception e) {
                                        LogUtil.e(TAG, "Error installing APK: " + e.getMessage());
                                        ToastUtils.show(StartActivity.this, "安装失败，请重试", Toast.LENGTH_LONG);
                                    }
                                } else {
                                    ToastUtils.show(StartActivity.this, "下载文件不存在，请重试", Toast.LENGTH_LONG);
                                }
                            });
                        }

                        @Override
                        public void onFailResponse() {
                            runOnUiThread(() -> {
                                ToastUtils.show(thisContext, "下载失败，请检查网络后重试", Toast.LENGTH_SHORT);
                            });
                        }
                    });
        }
        public  void updateCancel(){
            binding.updateApkWrapper.setVisibility(View.GONE);
            binding.startX5Wrapper.setVisibility(View.VISIBLE);
            installX5(thisContext,thisConfigDTO);
            ValueUtil.putString(thisContext,"updateLater","ok");
        }
    }



}
