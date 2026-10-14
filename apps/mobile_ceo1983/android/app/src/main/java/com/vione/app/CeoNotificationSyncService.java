package com.vione.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.HashSet;
import java.util.Set;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

/**
 * Background notification sync service for CEO 1983 Mobile App.
 * Keeps running in the background when the phone is locked or outside the app.
 * Immediately alerts the user with Heads-Up Banner, Ringtone, Vibration, and WakeLock
 * whenever an incoming call or urgent message arrives.
 */
public class CeoNotificationSyncService extends Service {
    private static final String TAG = "CeoNotifSyncService";
    public static final String ACTION_START = "com.vione.app.action.START_SYNC";
    public static final String ACTION_STOP = "com.vione.app.action.STOP_SYNC";
    public static final String ACTION_CANCEL_NOTIF = "com.vione.app.action.CANCEL_NOTIF";

    public static final String PREF_NAME = "ceo1983_native_push";
    public static final String KEY_USER_ID = "user_id";
    public static final String KEY_TOKEN = "token";
    public static final String KEY_SERVER_URL = "server_url";

    private static final String CHANNEL_CALLS_ID = "ceo1983_channel_calls";
    private static final String CHANNEL_MESSAGES_ID = "ceo1983_channel_messages";
    private static final String CHANNEL_SERVICE_ID = "ceo1983_channel_service";

    private static final int SERVICE_NOTIFICATION_ID = 198301;

    public static void startSync(Context context, String userId, String token) {
        startSync(context, userId, token, null);
    }

    public static void startSync(Context context, String userId, String token, String serverUrl) {
        if (context == null) return;
        try {
            Intent intent = new Intent(context, CeoNotificationSyncService.class);
            intent.setAction(ACTION_START);
            intent.putExtra(KEY_USER_ID, userId);
            intent.putExtra(KEY_TOKEN, token);
            if (serverUrl != null && !serverUrl.isEmpty()) {
                intent.putExtra(KEY_SERVER_URL, serverUrl);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error starting sync service: " + e.getMessage());
        }
    }

    public static void stopSync(Context context) {
        if (context == null) return;
        try {
            Intent intent = new Intent(context, CeoNotificationSyncService.class);
            intent.setAction(ACTION_STOP);
            context.stopService(intent);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping sync service: " + e.getMessage());
        }
    }

    private boolean mIsRunning = false;
    private Thread mWorkerThread;
    private String mLastActiveCallId = null;
    private final Set<String> mSeenNotifIds = new HashSet<>();
    private boolean mHasSeededInitialNotifs = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
        trustAllCertificates();
        startForegroundServiceNotification();
    }

    private void startForegroundServiceNotification() {
        try {
            NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_SERVICE_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("CEO 1983")
                .setContentText("Dịch vụ nhận cuộc gọi & thông báo đang chạy nền")
                .setPriority(NotificationCompat.PRIORITY_MIN)
                .setOngoing(true)
                .setShowWhen(false);

            startForeground(SERVICE_NOTIFICATION_ID, builder.build());
        } catch (Exception e) {
            Log.w(TAG, "startForeground error: " + e.getMessage());
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForegroundServiceNotification();
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_STOP.equals(action)) {
                stopSync();
                stopSelf();
                return START_NOT_STICKY;
            } else if (ACTION_CANCEL_NOTIF.equals(action)) {
                String tag = intent.getStringExtra("tag");
                cancelNotificationByTag(tag);
                return START_STICKY;
            }

            String userId = intent.getStringExtra(KEY_USER_ID);
            String token = intent.getStringExtra(KEY_TOKEN);
            String serverUrl = intent.getStringExtra(KEY_SERVER_URL);

            if (userId != null && !userId.isEmpty()) {
                SharedPreferences prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
                prefs.edit()
                    .putString(KEY_USER_ID, userId)
                    .putString(KEY_TOKEN, token != null ? token : "")
                    .putString(KEY_SERVER_URL, serverUrl != null ? serverUrl : "https://14.225.217.232:5444")
                    .apply();
            }
        }

        startSync();
        return START_STICKY;
    }

    private void startSync() {
        if (mIsRunning) return;
        mIsRunning = true;

        mWorkerThread = new Thread(() -> {
            Log.d(TAG, "Background notification sync worker started");
            while (mIsRunning) {
                try {
                    SharedPreferences prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
                    String userId = prefs.getString(KEY_USER_ID, "");
                    String token = prefs.getString(KEY_TOKEN, "");
                    String serverUrl = prefs.getString(KEY_SERVER_URL, "https://14.225.217.232:5444");

                    if (userId != null && !userId.isEmpty()) {
                        checkActiveCall(serverUrl, userId, token);
                        checkNewNotifications(serverUrl, userId, token);
                    }

                    Thread.sleep(3500);
                } catch (InterruptedException e) {
                    break;
                } catch (Exception e) {
                    Log.w(TAG, "Sync loop iteration error: " + e.getMessage());
                    try {
                        Thread.sleep(4000);
                    } catch (InterruptedException ignored) {
                        break;
                    }
                }
            }
            Log.d(TAG, "Background notification sync worker stopped");
        });
        mWorkerThread.start();
    }

    private void stopSync() {
        mIsRunning = false;
        if (mWorkerThread != null) {
            mWorkerThread.interrupt();
            mWorkerThread = null;
        }
    }

    private void checkActiveCall(String baseUrl, String userId, String token) {
        try {
            String apiBase = baseUrl.replaceAll("/+$", "");
            if (!apiBase.endsWith("/api")) {
                apiBase += "/api";
            }
            String target = apiBase + "/me/active-call";
            HttpURLConnection conn = createConnection(target, token, userId);
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            int code = conn.getResponseCode();
            if (code == 200) {
                String body = readStream(conn.getInputStream());
                JSONObject res = new JSONObject(body);
                if (res.optBoolean("ok") && !res.isNull("call")) {
                    JSONObject call = res.getJSONObject("call");
                    String status = call.optString("status");
                    String callId = call.optString("callId");
                    String callerName = call.optString("callerName", "Hội viên CEO 1983");
                    String callType = call.optString("callType", "video");

                    if ("ringing".equalsIgnoreCase(status) && !callId.isEmpty()) {
                        if (!callId.equals(mLastActiveCallId)) {
                            mLastActiveCallId = callId;
                            triggerIncomingCallAlert(callId, callerName, callType);
                        }
                        return;
                    }
                }
            }

            // If active call is gone or ended, cancel the notification
            if (mLastActiveCallId != null) {
                cancelNotificationByTag("call-" + mLastActiveCallId);
                mLastActiveCallId = null;
            }
        } catch (Exception e) {
            // Non-critical network check error
        }
    }

    private void checkNewNotifications(String baseUrl, String userId, String token) {
        try {
            String apiBase = baseUrl.replaceAll("/+$", "");
            if (!apiBase.endsWith("/api")) {
                apiBase += "/api";
            }
            // Chỉ đồng bộ thông báo cá nhân của tài khoản CEO 1983, không đẩy thông báo broadcast từ CRM
            String target = apiBase + "/me/notifications/member?personalOnly=true";
            HttpURLConnection conn = createConnection(target, token, userId);
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            int code = conn.getResponseCode();
            if (code == 200) {
                String body = readStream(conn.getInputStream());
                JSONObject res = new JSONObject(body);
                JSONArray list = res.optJSONArray("notifications");
                if (list != null && list.length() > 0) {
                    if (!mHasSeededInitialNotifs) {
                        // Lần đầu chạy khi app khởi động: ghi nhớ các thông báo cũ để không nổ thông báo dồn dập
                        for (int i = 0; i < list.length(); i++) {
                            JSONObject notif = list.getJSONObject(i);
                            String id = notif.optString("id");
                            if (!id.isEmpty()) {
                                mSeenNotifIds.add(id);
                            }
                        }
                        mHasSeededInitialNotifs = true;
                        return;
                    }

                    for (int i = 0; i < list.length(); i++) {
                        JSONObject notif = list.getJSONObject(i);
                        boolean unread = notif.optBoolean("unread", true);
                        if (!unread) continue;

                        boolean isBroadcast = notif.optBoolean("isBroadcast", false);
                        if (isBroadcast) continue;

                        String id = notif.optString("id");
                        if (!id.isEmpty() && !mSeenNotifIds.contains(id)) {
                            mSeenNotifIds.add(id);
                            // Avoid flooding initial history
                            if (mSeenNotifIds.size() > 100) {
                                mSeenNotifIds.clear();
                                mSeenNotifIds.add(id);
                            }
                            String title = notif.optString("title", "Hiệp hội CEO 1983");
                            String content = notif.optString("body", "Bạn có thông báo mới");
                            String type = notif.optString("type", notif.optString("refType", "message"));
                            triggerMessageAlert(title, content, type, id);
                        }
                    }
                } else {
                    mHasSeededInitialNotifs = true;
                }
            }
        } catch (Exception ignored) {}
    }

    private void triggerIncomingCallAlert(String callId, String callerName, String callType) {
        try {
            // Wake up screen and keep it bright
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                PowerManager.WakeLock wl = pm.newWakeLock(
                    PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                    "ceo1983:incoming_call_wake"
                );
                wl.acquire(15000);
            }

            Intent notifyIntent = new Intent(this, MainActivity.class);
            notifyIntent.setAction(Intent.ACTION_MAIN);
            notifyIntent.addCategory(Intent.CATEGORY_LAUNCHER);
            notifyIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            notifyIntent.putExtra("target_url", "/association/messages");
            notifyIntent.putExtra("call_id", callId);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            int requestCode = Math.abs(callId.hashCode());
            PendingIntent pendingIntent = PendingIntent.getActivity(this, requestCode, notifyIntent, flags);

            Uri ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            long[] vibration = new long[]{0, 600, 300, 600, 300, 600, 300, 600};

            String typeText = "video".equalsIgnoreCase(callType) ? "📹 Cuộc gọi Video trực tiếp" : "📞 Cuộc gọi thoại trực tiếp";
            String titleText = "Cuộc gọi đến từ " + callerName;

            NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_CALLS_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(titleText)
                .setContentText(typeText + " · Chạm để trả lời ngay")
                .setStyle(new NotificationCompat.BigTextStyle().bigText(typeText + " từ " + callerName + ". Chạm để kết nối."))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setFullScreenIntent(pendingIntent, true)
                .setSound(ringtoneUri)
                .setVibrate(vibration)
                .setOngoing(true);

            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify("call-" + callId, requestCode, builder.build());
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to trigger incoming call alert: " + e.getMessage());
        }
    }

    private void triggerMessageAlert(String title, String body, String type, String notifId) {
        try {
            Intent notifyIntent = new Intent(this, MainActivity.class);
            notifyIntent.setAction(Intent.ACTION_MAIN);
            notifyIntent.addCategory(Intent.CATEGORY_LAUNCHER);
            notifyIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            notifyIntent.putExtra("target_url", "/association/messages");

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            int requestCode = Math.abs(notifId.hashCode());
            PendingIntent pendingIntent = PendingIntent.getActivity(this, requestCode, notifyIntent, flags);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_MESSAGES_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setDefaults(NotificationCompat.DEFAULT_SOUND | NotificationCompat.DEFAULT_LIGHTS)
                .setVibrate(new long[]{0, 200, 100, 200});

            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify("msg-" + notifId, requestCode, builder.build());
            }
        } catch (Exception ignored) {}
    }

    private void cancelNotificationByTag(String tag) {
        try {
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                if (tag != null && !tag.isEmpty()) {
                    manager.cancel(tag, Math.abs(tag.hashCode()));
                    manager.cancel(Math.abs(tag.hashCode()));
                } else {
                    manager.cancelAll();
                }
            }
        } catch (Exception ignored) {}
    }

    private HttpURLConnection createConnection(String targetUrl, String token, String userId) throws Exception {
        URL url = new URL(targetUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        if (token != null && !token.isEmpty()) {
            conn.setRequestProperty("Authorization", "Bearer " + token);
        }
        if (userId != null && !userId.isEmpty()) {
            conn.setRequestProperty("x-user-id", userId);
        }
        conn.setRequestProperty("Accept", "application/json");
        conn.setRequestProperty("User-Agent", "CEO1983-Native-Sync/1.0");
        return conn;
    }

    private String readStream(InputStream in) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        reader.close();
        return sb.toString();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            NotificationChannel callChannel = new NotificationChannel(
                CHANNEL_CALLS_ID,
                "Cuộc gọi đến CEO 1983",
                NotificationManager.IMPORTANCE_HIGH
            );
            callChannel.setDescription("Thông báo cuộc gọi thoại & video trực tiếp từ hội viên");
            callChannel.enableVibration(true);
            callChannel.setVibrationPattern(new long[]{0, 600, 300, 600, 300, 600});
            callChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(callChannel);

            NotificationChannel msgChannel = new NotificationChannel(
                CHANNEL_MESSAGES_ID,
                "Tin nhắn CEO 1983",
                NotificationManager.IMPORTANCE_HIGH
            );
            msgChannel.setDescription("Thông báo tin nhắn đối tác và hội viên");
            msgChannel.enableVibration(true);
            msgChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(msgChannel);

            NotificationChannel serviceChannel = new NotificationChannel(
                CHANNEL_SERVICE_ID,
                "Dịch vụ nền CEO 1983",
                NotificationManager.IMPORTANCE_MIN
            );
            serviceChannel.setDescription("Giữ kết nối nhận cuộc gọi và tin nhắn khi tắt màn hình");
            serviceChannel.setShowBadge(false);
            manager.createNotificationChannel(serviceChannel);
        }
    }

    private void trustAllCertificates() {
        try {
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
            };
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
        } catch (Exception ignored) {}
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopSync();
        super.onDestroy();
    }
}
