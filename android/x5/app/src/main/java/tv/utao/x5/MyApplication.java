package tv.utao.x5;

import android.app.ActivityManager;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;
import android.webkit.WebView;

import androidx.multidex.MultiDex;


import java.util.HashMap;
import java.util.UUID;

import tv.utao.x5.service.CrashHandler;
import tv.utao.x5.util.LogUtil;
import tv.utao.x5.util.ValueUtil;
import tv.utao.x5.util.Util;

public class MyApplication extends Application {

    private static Context context;
    private static final String TAG = "MyApplication";
   // private String DIR = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getPath();
   @Override
   protected void attachBaseContext(Context base) {
       super.attachBaseContext(base);
       MultiDex.install(base);
   }
   public static  String androidId=null;
    @Override
    public void onCreate() {
        super.onCreate();
        LogUtil.i(TAG, "onViewInitBegin: ");
        allErrorCatch();
        context = getApplicationContext();
        // 根据系统版本和配置决定是否初始化X5内核
        // 去除X5内核，默认不启动不下载内核
        LogUtil.i(TAG, "X5 kernel is disabled by default");
        // 强制设置为不需要X5内核
        ValueUtil.putString(getApplicationContext(), "openX5", "0");
        androidId = Settings.System.getString(getContentResolver(), Settings.System.ANDROID_ID);
        if(null==androidId){
            LogUtil.i(TAG, "androidId: getUUID");
            androidId=getUUID();
        }
        CrashHandler.getInstance().init(this);
        CrashHandler.uploadExceptionToServer(this);
        try {
            System.setProperty("persist.sys.media.use-mediaDrm", "false");
        } catch (Exception e) {
            // 安全处理异常
            LogUtil.e("use-mediaDrm:"+e.getMessage());
        }
        //startX5WebProcessPreinitService();
        //initPieWebView();
    }
    private void allErrorCatch(){
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread thread, Throwable throwable) {
                // 检查是否为 SurfaceTexture 相关异常
                if (throwable != null && throwable.getMessage() != null &&
                        (throwable instanceof NullPointerException) &&
                        (throwable.getStackTrace() != null && throwable.getStackTrace().length > 0 &&
                                containsSurfaceTextureInStackTrace(throwable.getStackTrace()))) {

                    LogUtil.e("Application", "捕获到 SurfaceTexture 相关异常: " + throwable.getMessage());

                    // 记录异常但不终止应用
                    return;
                }

                // 其他异常，使用默认处理器
                Thread.UncaughtExceptionHandler defaultHandler = Thread.getDefaultUncaughtExceptionHandler();
                if (defaultHandler != null) {
                    defaultHandler.uncaughtException(thread, throwable);
                }
            }

            // 检查堆栈跟踪是否包含 SurfaceTexture 相关内容
            private boolean containsSurfaceTextureInStackTrace(StackTraceElement[] stackTrace) {
                for (StackTraceElement element : stackTrace) {
                    if (element.getClassName().contains("SurfaceTexture") ||
                            element.getMethodName().contains("SurfaceTexture")) {
                        return true;
                    }
                }
                return false;
            }
        });
    }
    // X5内核已移除，此方法不再使用
    private void initX5() {
        LogUtil.i(TAG, "X5内核已移除，无需初始化");
    }
    public static Context getAppContext() {
        return context;
    }
    private static final String PROCESS = "tv.utao.x5";
    private void initPieWebView() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            String processName = getProcessName(this);
            if (!PROCESS.equals(processName)) {
                WebView.setDataDirectorySuffix(getString(processName, "utao"));
            }
        }
    }
    private void initWebView() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            String processName = getProcessName();
            WebView.setDataDirectorySuffix(processName);
        }
    }
    public String getProcessName(Context context) {
        if (context == null) return null;
        ActivityManager manager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningAppProcessInfo processInfo : manager.getRunningAppProcesses()) {
            if (processInfo.pid == android.os.Process.myPid()) {
                return processInfo.processName;
            }
        }
        return null;
    }

    public String getString(String s, String defValue) {
        return isEmpty(s) ? defValue : s;
    }

    public boolean isEmpty(String s) {
        return s == null || s.trim().length() == 0;
    }

    public static Context getContext() {
        return context;
    }
    public static String getUUID() {
        String serial = null;
        String m_szDevIDShort = "随机两位数" +
                Build.BOARD.length() % 10 + Build.BRAND.length() % 10 +
                Build.CPU_ABI.length() % 10 + Build.DEVICE.length() % 10 +
                Build.DISPLAY.length() % 10 + Build.HOST.length() % 10 +
                Build.ID.length() % 10 + Build.MANUFACTURER.length() % 10 +
                Build.MODEL.length() % 10 + Build.PRODUCT.length() % 10 +
                Build.TAGS.length() % 10 + Build.TYPE.length() % 10 +
                Build.USER.length() % 10; //13 位
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                serial = "默认值";
            } else {
                serial = Build.SERIAL;
            }
            //API>=9 使用serial号
            return new UUID(m_szDevIDShort.hashCode(), serial.hashCode()).toString();
        } catch (Exception exception) {
            //serial需要一个初始化
            serial = "默认值"; // 随便一个初始化
        }
        //使用硬件信息拼凑出来的15位号码
        return new UUID(m_szDevIDShort.hashCode(), serial.hashCode()).toString();
    }

    // X5内核已移除，不再需要启动X5初始化服务
    private void startX5WebProcessPreinitService() {
        LogUtil.i(TAG, "X5内核已移除，不再启动X5初始化服务");
    }

    // X5内核已移除，以下方法不再使用
    private static void resetSdk() {
        LogUtil.i(TAG, "X5内核已移除，resetSdk方法不再使用");
    }

    private void downSDk(){
        LogUtil.i(TAG, "X5内核已移除，downSDk方法不再使用");
    }

}