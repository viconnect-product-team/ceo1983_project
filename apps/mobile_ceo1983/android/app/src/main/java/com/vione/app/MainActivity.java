package com.vione.app;

import android.Manifest;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.nfc.NdefMessage;
import android.nfc.NdefRecord;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.Ndef;
import android.os.Build;
import android.os.Bundle;
import android.os.Parcelable;
import android.provider.MediaStore;
import android.net.http.SslError;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.View;
import android.widget.Toast;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import androidx.core.app.NotificationCompat;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import com.getcapacitor.BridgeWebViewClient;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1002;

    private ValueCallback<Uri[]> mFilePathCallback;
    private Uri mCameraImageUri;

    private NfcAdapter mNfcAdapter;
    private PendingIntent mNfcPendingIntent;
    private IntentFilter[] mNfcIntentFilters;
    private String[][] mNfcTechLists;

    private static final String CHANNEL_CALLS_ID = "ceo1983_channel_calls";
    private static final String CHANNEL_MESSAGES_ID = "ceo1983_channel_messages";
    private static final String CHANNEL_MEETINGS_ID = "ceo1983_channel_meetings";
    private static final String CHANNEL_OPPORTUNITIES_ID = "ceo1983_channel_opportunities";
    private static final String CHANNEL_GENERAL_ID = "ceo1983_channel_general";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannels();
        requestNativePermissions();
        setupNativeBridge();
        initNfc();
        handleNfcIntent(getIntent());
        handleTargetUrlIntent(getIntent());
    }

    private void initNfc() {
        try {
            mNfcAdapter = NfcAdapter.getDefaultAdapter(this);
            if (mNfcAdapter != null) {
                Intent nfcIntent = new Intent(this, getClass()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
                int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? PendingIntent.FLAG_MUTABLE : 0;
                mNfcPendingIntent = PendingIntent.getActivity(this, 0, nfcIntent, flags);

                IntentFilter ndef = new IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED);
                try {
                    ndef.addDataType("*/*");
                } catch (IntentFilter.MalformedMimeTypeException ignored) {}

                IntentFilter tech = new IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED);
                IntentFilter tag = new IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED);
                mNfcIntentFilters = new IntentFilter[] { ndef, tech, tag };

                mNfcTechLists = new String[][] {
                    new String[] { "android.nfc.tech.Ndef" },
                    new String[] { "android.nfc.tech.NdefFormatable" },
                    new String[] { "android.nfc.tech.NfcA" },
                    new String[] { "android.nfc.tech.NfcB" },
                    new String[] { "android.nfc.tech.NfcF" },
                    new String[] { "android.nfc.tech.NfcV" },
                    new String[] { "android.nfc.tech.IsoDep" },
                    new String[] { "android.nfc.tech.MifareClassic" },
                    new String[] { "android.nfc.tech.MifareUltralight" }
                };
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (mNfcAdapter != null && mNfcAdapter.isEnabled() && mNfcPendingIntent != null) {
            try {
                mNfcAdapter.enableForegroundDispatch(this, mNfcPendingIntent, mNfcIntentFilters, mNfcTechLists);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (mNfcAdapter != null) {
            try {
                mNfcAdapter.disableForegroundDispatch(this);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleNfcIntent(intent);
        handleTargetUrlIntent(intent);
    }

    private void handleNfcIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        if (NfcAdapter.ACTION_NDEF_DISCOVERED.equals(action)
            || NfcAdapter.ACTION_TECH_DISCOVERED.equals(action)
            || NfcAdapter.ACTION_TAG_DISCOVERED.equals(action)) {

            Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
            byte[] idBytes = tag != null ? tag.getId() : null;
            String serialNumber = bytesToHex(idBytes);

            List<String> recordsText = new ArrayList<>();
            String primaryUrl = null;

            Parcelable[] rawMsgs = intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES);
            if (rawMsgs != null && rawMsgs.length > 0) {
                for (Parcelable rawMsg : rawMsgs) {
                    if (rawMsg instanceof NdefMessage) {
                        NdefMessage msg = (NdefMessage) rawMsg;
                        for (NdefRecord record : msg.getRecords()) {
                            String parsed = parseNdefRecord(record);
                            if (parsed != null && !parsed.isEmpty()) {
                                recordsText.add(parsed);
                                if (primaryUrl == null && (parsed.startsWith("http://") || parsed.startsWith("https://") || parsed.contains("vione") || parsed.contains("card"))) {
                                    primaryUrl = parsed;
                                }
                            }
                        }
                    }
                }
            } else if (tag != null) {
                Ndef ndef = Ndef.get(tag);
                if (ndef != null) {
                    try {
                        ndef.connect();
                        NdefMessage msg = ndef.getNdefMessage();
                        if (msg != null) {
                            for (NdefRecord record : msg.getRecords()) {
                                String parsed = parseNdefRecord(record);
                                if (parsed != null && !parsed.isEmpty()) {
                                    recordsText.add(parsed);
                                    if (primaryUrl == null && (parsed.startsWith("http://") || parsed.startsWith("https://") || parsed.contains("vione") || parsed.contains("card"))) {
                                        primaryUrl = parsed;
                                    }
                                }
                            }
                        }
                        ndef.close();
                    } catch (Exception ignored) {}
                }
            }

            try {
                JSONObject json = new JSONObject();
                json.put("serialNumber", serialNumber != null ? serialNumber : "");
                json.put("rawText", recordsText.isEmpty() ? "" : recordsText.get(0));
                json.put("url", primaryUrl != null ? primaryUrl : (recordsText.isEmpty() ? "" : recordsText.get(0)));
                JSONArray recordsArr = new JSONArray();
                for (String r : recordsText) {
                    recordsArr.put(r);
                }
                json.put("records", recordsArr);
                json.put("timestamp", System.currentTimeMillis());

                dispatchNfcToWebView(json.toString());
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private String parseNdefRecord(NdefRecord record) {
        if (record == null) return null;
        short tnf = record.getTnf();
        byte[] type = record.getType();
        byte[] payload = record.getPayload();

        if (tnf == NdefRecord.TNF_WELL_KNOWN) {
            if (Arrays.equals(type, NdefRecord.RTD_URI)) {
                return parseUriRecord(record);
            } else if (Arrays.equals(type, NdefRecord.RTD_TEXT)) {
                return parseTextRecord(record);
            }
        } else if (tnf == NdefRecord.TNF_ABSOLUTE_URI) {
            return new String(payload, StandardCharsets.UTF_8);
        } else if (payload != null && payload.length > 0) {
            return new String(payload, StandardCharsets.UTF_8);
        }
        return null;
    }

    private String parseUriRecord(NdefRecord record) {
        byte[] payload = record.getPayload();
        if (payload == null || payload.length == 0) return null;
        String[] prefixes = new String[] {
            "", "http://www.", "https://www.", "http://", "https://",
            "tel:", "mailto:", "ftp://anonymous:anonymous@", "ftp://ftp.",
            "ftps://", "sftp://", "smb://", "nfs://", "ftp://", "dav://",
            "news:", "telnet://", "imap:", "rtsp://", "urn:", "pop:",
            "sip:", "sips:", "tftp:", "btspp://", "btl2cap://", "btgoep://",
            "tcpobex://", "irdaobex://", "file://", "urn:epc:id:", "urn:epc:tag:",
            "urn:epc:pat:", "urn:epc:raw:", "urn:epc:", "urn:nfc:"
        };
        int prefixIndex = payload[0] & 0xFF;
        String prefix = prefixIndex < prefixes.length ? prefixes[prefixIndex] : "";
        String full = new String(payload, 1, payload.length - 1, StandardCharsets.UTF_8);
        return prefix + full;
    }

    private String parseTextRecord(NdefRecord record) {
        byte[] payload = record.getPayload();
        if (payload == null || payload.length == 0) return null;
        int status = payload[0] & 0xFF;
        int langCodeLen = status & 0x3F;
        return new String(payload, 1 + langCodeLen, payload.length - 1 - langCodeLen, StandardCharsets.UTF_8);
    }

    private String bytesToHex(byte[] bytes) {
        if (bytes == null) return null;
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }

    private void dispatchNfcToWebView(String jsonString) {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        runOnUiThread(() -> {
            try {
                WebView webView = getBridge().getWebView();
                String script = "(function() {" +
                    "  try {" +
                    "    var data = " + jsonString + ";" +
                    "    window.__VIONE_LAST_NFC__ = data;" +
                    "    window.dispatchEvent(new CustomEvent('vione:nfc_tag', { detail: data }));" +
                    "    window.postMessage({ type: 'VIONE_NFC_TAG', detail: data, payload: data }, '*');" +
                    "    console.log('[Native NFC] Dispatched NFC tag to webview:', data);" +
                    "  } catch (err) {" +
                    "    console.error('[Native NFC] Failed to dispatch event:', err);" +
                    "  }" +
                    "})();";
                webView.evaluateJavascript(script, null);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private void requestNativePermissions() {
        List<String> permissions = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.CAMERA);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.RECORD_AUDIO);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.READ_MEDIA_IMAGES);
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        } else {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE);
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }
        }

        if (!permissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    public class NativeBridge {
        @JavascriptInterface
        public void scanQr() {
            MainActivity.this.runOnUiThread(() -> {
                MainActivity.this.startNativeQrScanner();
            });
        }

        @JavascriptInterface
        public boolean isNative() {
            return true;
        }

        @JavascriptInterface
        public void showNotification(String title, String body, String type, String tag, String url) {
            MainActivity.this.runOnUiThread(() -> {
                MainActivity.this.displayNativeNotification(title, body, type, tag, url);
            });
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            MainActivity.this.runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                        ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, PERMISSION_REQUEST_CODE);
                    }
                }
            });
        }

        @JavascriptInterface
        public boolean isNotificationPermissionGranted() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                return ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            // 1. Calls Channel (Max Importance, Heads-up banner, high priority sound & vibration)
            NotificationChannel callChannel = new NotificationChannel(
                CHANNEL_CALLS_ID,
                "Cuộc gọi đến CEO 1983",
                NotificationManager.IMPORTANCE_HIGH
            );
            callChannel.setDescription("Thông báo cuộc gọi thoại & video trực tiếp từ hội viên");
            callChannel.enableVibration(true);
            callChannel.setVibrationPattern(new long[]{0, 500, 250, 500, 250, 500});
            callChannel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(callChannel);

            // 2. Messages Channel (High Importance, Heads-up banner)
            NotificationChannel msgChannel = new NotificationChannel(
                CHANNEL_MESSAGES_ID,
                "Tin nhắn CEO 1983",
                NotificationManager.IMPORTANCE_HIGH
            );
            msgChannel.setDescription("Thông báo tin nhắn đối tác và hội viên");
            msgChannel.enableVibration(true);
            msgChannel.setVibrationPattern(new long[]{0, 200, 100, 200});
            msgChannel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(msgChannel);

            // 3. Meetings Channel (High Importance, Heads-up banner)
            NotificationChannel meetingChannel = new NotificationChannel(
                CHANNEL_MEETINGS_ID,
                "Cuộc hẹn & Gặp mặt B2B",
                NotificationManager.IMPORTANCE_HIGH
            );
            meetingChannel.setDescription("Thông báo cuộc hẹn, lịch gặp và thư mời kết nối B2B");
            meetingChannel.enableVibration(true);
            meetingChannel.setVibrationPattern(new long[]{0, 300, 150, 300});
            meetingChannel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(meetingChannel);

            // 4. Opportunities Channel (High Importance, Heads-up banner)
            NotificationChannel oppChannel = new NotificationChannel(
                CHANNEL_OPPORTUNITIES_ID,
                "Cơ hội hợp tác & Giao thương",
                NotificationManager.IMPORTANCE_HIGH
            );
            oppChannel.setDescription("Thông báo cơ hội hợp tác kinh doanh và kết nối cung cầu");
            oppChannel.enableVibration(true);
            oppChannel.setVibrationPattern(new long[]{0, 250, 150, 250});
            oppChannel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(oppChannel);

            // 5. General Notifications Channel (High Importance)
            NotificationChannel generalChannel = new NotificationChannel(
                CHANNEL_GENERAL_ID,
                "Thông báo chung CEO 1983",
                NotificationManager.IMPORTANCE_HIGH
            );
            generalChannel.setDescription("Thông báo từ Ban Thư Ký và Hiệp hội");
            generalChannel.enableVibration(true);
            generalChannel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(generalChannel);
        }
    }

    private void handleTargetUrlIntent(Intent intent) {
        if (intent == null) return;
        String targetUrl = intent.getStringExtra("target_url");
        if (targetUrl != null && !targetUrl.isEmpty() && getBridge() != null && getBridge().getWebView() != null) {
            runOnUiThread(() -> {
                try {
                    WebView webView = getBridge().getWebView();
                    String safeUrl = targetUrl.replace("'", "\\'");
                    String js = "(function() {" +
                        "  try {" +
                        "    if (window.location.pathname !== '" + safeUrl + "' && !window.location.href.includes('" + safeUrl + "')) {" +
                        "      window.location.href = '" + safeUrl + "';" +
                        "    }" +
                        "    window.dispatchEvent(new CustomEvent('native:navigate', { detail: '" + safeUrl + "' }));" +
                        "  } catch(e) {}" +
                        "})();";
                    webView.evaluateJavascript(js, null);
                } catch (Exception ignored) {}
            });
        }
    }

    public void displayNativeNotification(String title, String body, String type, String tag, String url) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    requestNativePermissions();
                    return;
                }
            }

            String channelId = CHANNEL_GENERAL_ID;
            int priority = NotificationCompat.PRIORITY_HIGH;
            long[] vibration = new long[]{0, 200, 100, 200};
            String category = NotificationCompat.CATEGORY_REMINDER;

            if ("call".equalsIgnoreCase(type)) {
                channelId = CHANNEL_CALLS_ID;
                priority = NotificationCompat.PRIORITY_MAX;
                vibration = new long[]{0, 500, 250, 500, 250, 500};
                category = NotificationCompat.CATEGORY_CALL;
            } else if ("message".equalsIgnoreCase(type) || "dm".equalsIgnoreCase(type)) {
                channelId = CHANNEL_MESSAGES_ID;
                priority = NotificationCompat.PRIORITY_HIGH;
                vibration = new long[]{0, 200, 100, 200};
                category = NotificationCompat.CATEGORY_MESSAGE;
            } else if ("meeting".equalsIgnoreCase(type) || "appointment".equalsIgnoreCase(type)) {
                channelId = CHANNEL_MEETINGS_ID;
                priority = NotificationCompat.PRIORITY_HIGH;
                vibration = new long[]{0, 300, 150, 300};
                category = NotificationCompat.CATEGORY_EVENT;
            } else if ("opportunity".equalsIgnoreCase(type) || "co_hoi".equalsIgnoreCase(type) || "b2b".equalsIgnoreCase(type)) {
                channelId = CHANNEL_OPPORTUNITIES_ID;
                priority = NotificationCompat.PRIORITY_HIGH;
                vibration = new long[]{0, 250, 150, 250};
                category = NotificationCompat.CATEGORY_RECOMMENDATION;
            }

            Intent notifyIntent = new Intent(this, MainActivity.class);
            notifyIntent.setAction(Intent.ACTION_MAIN);
            notifyIntent.addCategory(Intent.CATEGORY_LAUNCHER);
            notifyIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            if (url != null && !url.isEmpty()) {
                notifyIntent.putExtra("target_url", url);
            }

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            int requestCode = (tag != null ? Math.abs(tag.hashCode()) : (int) System.currentTimeMillis());
            PendingIntent pendingIntent = PendingIntent.getActivity(this, requestCode, notifyIntent, flags);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(this, channelId)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title != null ? title : "CEO 1983")
                .setContentText(body != null ? body : "")
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body != null ? body : ""))
                .setPriority(priority)
                .setCategory(category)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setVibrate(vibration)
                .setDefaults(NotificationCompat.DEFAULT_SOUND | NotificationCompat.DEFAULT_LIGHTS);

            if ("call".equalsIgnoreCase(type)) {
                builder.setFullScreenIntent(pendingIntent, true);
            }

            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                int notifId = (tag != null ? Math.abs(tag.hashCode()) : (int) (System.currentTimeMillis() % 100000));
                manager.notify(tag, notifId, builder.build());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void startNativeQrScanner() {
        // Google Play Code Scanner đã được gỡ bỏ theo yêu cầu.
        // Chuyển sang quét qua Camera HTML5 / WebRTC tích hợp trong giao diện ứng dụng.
        dispatchScannedQrErrorToWebView("NATIVE_SCANNER_DISABLED");
    }

    private void dispatchScannedQrToWebView(String rawValue) {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        runOnUiThread(() -> {
            try {
                WebView webView = getBridge().getWebView();
                String escaped = rawValue.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\r", "");
                String script = "(function() {" +
                    "  try {" +
                    "    if (typeof window.onNativeQrScanned === 'function') {" +
                    "      window.onNativeQrScanned('" + escaped + "');" +
                    "    }" +
                    "    window.dispatchEvent(new CustomEvent('vione:qr_scanned', { detail: '" + escaped + "' }));" +
                    "    window.postMessage({ type: 'VIONE_QR_SCANNED', detail: '" + escaped + "', payload: '" + escaped + "' }, '*');" +
                    "    console.log('[Native QR] Dispatched scanned QR:', '" + escaped + "');" +
                    "  } catch (err) {" +
                    "    console.error('[Native QR] Failed to dispatch event:', err);" +
                    "  }" +
                    "})();";
                webView.evaluateJavascript(script, null);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private void dispatchScannedQrCancelToWebView() {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        runOnUiThread(() -> {
            try {
                WebView webView = getBridge().getWebView();
                String script = "(function() {" +
                    "  try {" +
                    "    if (typeof window.onNativeQrCancelled === 'function') {" +
                    "      window.onNativeQrCancelled();" +
                    "    }" +
                    "    window.dispatchEvent(new CustomEvent('vione:qr_cancelled'));" +
                    "  } catch (err) {}" +
                    "})();";
                webView.evaluateJavascript(script, null);
            } catch (Exception ignored) {}
        });
    }

    private void dispatchScannedQrErrorToWebView(String errMsg) {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        runOnUiThread(() -> {
            try {
                WebView webView = getBridge().getWebView();
                String safeMsg = (errMsg != null ? errMsg : "Unknown error").replace("'", "\\'");
                String script = "(function() {" +
                    "  try {" +
                    "    if (typeof window.onNativeQrError === 'function') {" +
                    "      window.onNativeQrError('" + safeMsg + "');" +
                    "    }" +
                    "    window.dispatchEvent(new CustomEvent('vione:qr_error', { detail: '" + safeMsg + "' }));" +
                    "  } catch (err) {}" +
                    "})();";
                webView.evaluateJavascript(script, null);
            } catch (Exception ignored) {}
        });
    }

    private void setupNativeBridge() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

            // Tối ưu hóa hiệu năng phần cứng 60fps - 120fps siêu mượt chuẩn Native
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            webView.setVerticalScrollBarEnabled(false);
            webView.setHorizontalScrollBarEnabled(false);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                settings.setOffscreenPreRaster(true);
            }

            webView.addJavascriptInterface(new NativeBridge(), "AndroidNative");
            webView.addJavascriptInterface(new NativeBridge(), "CEO1983Native");
            webView.addJavascriptInterface(new NativeBridge(), "NativeBridge");
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        setupNativeBridge();
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();

            webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
                @Override
                public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                    // Cho phép tiếp tục tải trang với SSL Self-Signed trên IP nội bộ
                    handler.proceed();
                }
            });

            webView.setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    MainActivity.this.runOnUiThread(() -> {
                        try {
                            List<String> needed = new ArrayList<>();
                            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                                needed.add(Manifest.permission.CAMERA);
                            }
                            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                                needed.add(Manifest.permission.RECORD_AUDIO);
                            }
                            if (!needed.isEmpty()) {
                                ActivityCompat.requestPermissions(MainActivity.this, needed.toArray(new String[0]), PERMISSION_REQUEST_CODE);
                            }
                            request.grant(request.getResources());
                        } catch (Exception e) {
                            try {
                                request.grant(request.getResources());
                            } catch (Exception ignored) {}
                        }
                    });
                }

                @Override
                public boolean onShowFileChooser(
                    WebView webView,
                    ValueCallback<Uri[]> filePathCallback,
                    FileChooserParams fileChooserParams
                ) {
                    if (mFilePathCallback != null) {
                        mFilePathCallback.onReceiveValue(null);
                        mFilePathCallback = null;
                    }
                    mFilePathCallback = filePathCallback;

                    boolean isCapture = fileChooserParams.isCaptureEnabled();
                    String[] acceptTypes = fileChooserParams.getAcceptTypes();
                    boolean isImage = false;
                    if (acceptTypes != null && acceptTypes.length > 0) {
                        for (String type : acceptTypes) {
                            if (type != null && (type.contains("image") || type.contains("camera") || type.equals("*/*"))) {
                                isImage = true;
                                break;
                            }
                        }
                    } else {
                        isImage = true;
                    }

                    Intent takePictureIntent = null;
                    if (isCapture || isImage) {
                        takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                        if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
                            File photoFile = createImageFile();
                            if (photoFile != null) {
                                mCameraImageUri = FileProvider.getUriForFile(
                                    MainActivity.this,
                                    getPackageName() + ".fileprovider",
                                    photoFile
                                );
                                takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, mCameraImageUri);
                                takePictureIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                            }
                        }
                    }

                    Intent contentSelectionIntent = fileChooserParams.createIntent();
                    if (contentSelectionIntent == null) {
                        contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
                        contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
                        contentSelectionIntent.setType(isImage ? "image/*" : "*/*");
                    }

                    Intent[] intentArray = takePictureIntent != null ? new Intent[]{takePictureIntent} : new Intent[0];
                    Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                    chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                    chooserIntent.putExtra(Intent.EXTRA_TITLE, "Chọn máy ảnh hoặc tệp");
                    chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);

                    try {
                        startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE);
                        return true;
                    } catch (Exception e) {
                        if (mFilePathCallback != null) {
                            mFilePathCallback.onReceiveValue(null);
                            mFilePathCallback = null;
                        }
                        return false;
                    }
                }
            });
        }
    }

    private File createImageFile() {
        try {
            String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
            String imageFileName = "JPEG_" + timeStamp + "_";
            File storageDir = getCacheDir();
            return File.createTempFile(imageFileName, ".jpg", storageDir);
        } catch (IOException ex) {
            return null;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (mFilePathCallback == null) {
                super.onActivityResult(requestCode, resultCode, data);
                return;
            }

            Uri[] results = null;
            if (resultCode == RESULT_OK) {
                if (data == null || (data.getData() == null && data.getClipData() == null)) {
                    if (mCameraImageUri != null) {
                        results = new Uri[]{mCameraImageUri};
                    }
                } else if (data.getData() != null) {
                    results = new Uri[]{data.getData()};
                } else if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }
                }
            }

            mFilePathCallback.onReceiveValue(results);
            mFilePathCallback = null;
            mCameraImageUri = null;
            return;
        }

        super.onActivityResult(requestCode, resultCode, data);
    }

    private long mLastBackPressTime = 0;
    private Toast mExitToast = null;

    @Override
    public void onBackPressed() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            String jsCheck = "(function() {" +
                "  try {" +
                "    window.dispatchEvent(new CustomEvent('native:hardware_back'));" +
                "    return window.__VBA_HANDLED_BACK__ === true ? 'handled' : 'home';" +
                "  } catch(e) { return 'error'; }" +
                "})();";

            webView.evaluateJavascript(jsCheck, new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String val) {
                    if (val != null && val.contains("handled")) {
                        return;
                    }

                    long now = System.currentTimeMillis();
                    if (now - mLastBackPressTime < 2000) {
                        if (mExitToast != null) mExitToast.cancel();
                        MainActivity.this.finish();
                    } else {
                        mLastBackPressTime = now;
                        if (mExitToast != null) mExitToast.cancel();
                        mExitToast = Toast.makeText(MainActivity.this, "Chạm lần nữa để thoát ứng dụng", Toast.LENGTH_SHORT);
                        mExitToast.show();
                    }
                }
            });
            return;
        }

        super.onBackPressed();
    }
}
