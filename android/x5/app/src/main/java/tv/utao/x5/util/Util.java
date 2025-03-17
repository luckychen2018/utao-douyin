package tv.utao.x5.util;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import com.tencent.smtt.sdk.ValueCallback;
import com.tencent.smtt.sdk.WebView;

import java.io.File;
import java.text.MessageFormat;
import java.util.Date;

import tv.utao.x5.BuildConfig;
import tv.utao.x5.utils.ToastUtils;

public class Util {
    private static String TAG = "Util";
    public static  Handler mainHandler = new Handler(Looper.getMainLooper());

    public static void  evalOnUi(WebView webView ,String javascript){
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                // 在这里调用你的View方法
                LogUtil.i(TAG,"evalOnUi "+javascript);
                eval(webView,javascript,null);
            }
        });
    }
    public static  boolean isDev(){
        LogUtil.i(TAG,"BUILD_ENV_TYPE "+ BuildConfig.BUILD_ENV_TYPE);
        return  "dev".equals(BuildConfig.BUILD_ENV_TYPE);
    }
    public static void  eval(WebView webView , String javascript){
        eval(webView,javascript,null);
    }
    public static void  eval(WebView webView , String javascript, ValueCallback<String> valueCallback){
        webView.evaluateJavascript(javascript,null);
    }
    public  static String sessionStorageWithTime(String key,String value){
        return MessageFormat.format(
                "sessionStorage.setItem(\"{0}\",\"{1}\");sessionStorage.setItem(\"{2}\",{3});",
                key,value,key+"Time",String.valueOf(new Date().getTime()));
    }

    public  static String loginQr(String url,String type){
        return MessageFormat.format(
                "_loginQr(\"{0}\",\"{1}\")",url,type);
    }
    public  static String click(String id){
        return  "$$(\"#"+id+"\").trigger(\"click\")";
    }

    public  static  Boolean is64=null;
    public static   boolean is64(){
        if(null!=is64){
            return is64;
        }
        String[] supported64BitAbis = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            supported64BitAbis = Build.SUPPORTED_64_BIT_ABIS;
        }
        if(null!=supported64BitAbis&&supported64BitAbis.length>0){
            is64= true;
        }else{
            is64= false;
        }
        return is64;
    }

    public static   boolean isX86(){
        String[] supported64BitAbis  = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            supported64BitAbis = Build.SUPPORTED_ABIS;
        }
        if(null==supported64BitAbis){
            return  false;
        }
        for (String supported64BitAbi : supported64BitAbis) {
            if(supported64BitAbi.startsWith("x86")){
                return true;
            }
        }
        return false;
    }

    public static  String webViewVersion(Context context){
        String versionName = "";
        try {
            PackageInfo packageInfo = context.getPackageManager().getPackageInfo("com.google.android.webview", 0);
            if (packageInfo != null) {
                versionName = packageInfo.versionName; // 获取版本名称
                Log.d(TAG, "versionName = "+versionName);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return versionName;
    }

    public static void installApk(Context context, File apkFile) {
        try {
            if (context == null || apkFile == null || !apkFile.exists()) {
                LogUtil.e(TAG, "Invalid context or APK file");
                return;
            }

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                Uri contentUri = FileProvider.getUriForFile(context,
                        BuildConfig.APPLICATION_ID + ".fileProvider", apkFile);
                intent.setDataAndType(contentUri, "application/vnd.android.package-archive");
            } else {
                intent.setDataAndType(Uri.fromFile(apkFile), "application/vnd.android.package-archive");
            }
            
            // Ensure we're using activity context
            Context activityContext = context;
            if (!(context instanceof Activity)) {
                if (context.getApplicationContext() != null) {
                    activityContext = context.getApplicationContext();
                }
            }
            
            activityContext.startActivity(intent);
        } catch (Exception e) {
            LogUtil.e(TAG, "Error installing APK: " + e.getMessage());
           // e.printStackTrace();
            ToastUtils.show(context, "安装APK时出错，请重试", Toast.LENGTH_LONG);
        }
    }

    public  static  boolean isNotNeedX5(){
        //Build.VERSION_CODES.R 安卓11
        //Build.VERSION_CODES.P 安卓9
        if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.R){
            return true;
        }
        return false;
    }
    // wifi下获取本地网络IP地址（局域网地址）
    public static String getLocalIPAddress(Context context) {
        WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        if (wifiManager != null) {
           // @SuppressLint("MissingPermission")
            WifiInfo wifiInfo = wifiManager.getConnectionInfo();
            String ipAddress = intIP2StringIP(wifiInfo.getIpAddress());
            return ipAddress;
        }
        return "";
    }
    public static String intIP2StringIP(int ip) {
        return (ip & 0xFF) + "." +
                ((ip >> 8) & 0xFF) + "." +
                ((ip >> 16) & 0xFF) + "." +
                (ip >> 24 & 0xFF);
    }

}
