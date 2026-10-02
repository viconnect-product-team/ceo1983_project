const fs = require('fs');
const path = require('path');

const iconPath = path.join(__dirname, '..', 'apps', 'ceo1983_app_fe', 'public', 'apple-touch-icon.png');
const outPath = path.join(__dirname, '..', 'apps', 'ceo1983_app_fe', 'public', 'ceo1983.mobileconfig');

const iconB64 = fs.readFileSync(iconPath).toString('base64');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>
${iconB64}
            </data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>CEO 1983</string>
            <key>PayloadDescription</key>
            <string>Cài đặt ứng dụng CLB Doanh Nhân CEO 1983 lên màn hình chính</string>
            <key>PayloadDisplayName</key>
            <string>CEO 1983 WebClip</string>
            <key>PayloadIdentifier</key>
            <string>com.ceo1983.app.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>2B9C3A8C-D8D2-48BD-A7EA-81E75C5E218E</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>https://14.225.217.232:5444/association</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Cấu hình cài đặt ứng dụng Hiệp hội Doanh nhân CEO 1983 trực tiếp lên iPhone</string>
    <key>PayloadDisplayName</key>
    <string>Cài Đặt App CEO 1983</string>
    <key>PayloadIdentifier</key>
    <string>com.ceo1983.app.profile</string>
    <key>PayloadOrganization</key>
    <string>CLB Doanh Nhân CEO 1983 (HanoiBA)</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>9E5B2D6F-4A3C-4E1B-8D7F-3A1C2E5B7D9E</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

fs.writeFileSync(outPath, xml);
console.log('MobileConfig successfully created at:', outPath);
