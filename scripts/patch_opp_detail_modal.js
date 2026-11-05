const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/ceo1983_app_fe/src/components/opportunities/modals/OpportunityDetailModal.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Thêm import buildDynamicShareUrl nếu chưa có
if (!content.includes('buildDynamicShareUrl')) {
  content = content.replace(
    'import { toast } from "sonner";',
    'import { toast } from "sonner";\nimport { buildDynamicShareUrl } from "@/lib/share-helper";'
  );
}

// 2. Tìm và thay thế khối nút chia sẻ
const findStr = '<div className="grid grid-cols-2 gap-2 pt-0.5">';
const idx = content.indexOf(findStr);

if (idx !== -1) {
  const endMarker = 'navigator.clipboard.writeText(shareUrl);';
  const endIdx = content.indexOf(endMarker, idx);
  if (endIdx !== -1) {
    const nextLineIdx = content.indexOf('toast.success(', endIdx);
    const blockEnd = content.indexOf('}}', nextLineIdx);

    const oldSub = content.slice(idx, blockEnd + 2);

    const newSub = `<div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  const oppImg = Array.isArray(selectedOpp.images) && selectedOpp.images.length > 0
                    ? selectedOpp.images[0]
                    : (typeof selectedOpp.images === 'string' && selectedOpp.images.startsWith('http') ? selectedOpp.images : undefined);
                  const dynamicUrl = buildDynamicShareUrl({
                    type: 'opportunity',
                    id: selectedOpp.id,
                    title: \`[Cơ Hội Giao Thương B2B] \${selectedOpp.title} — CLB CEO 1983\`,
                    desc: selectedOpp.description || \`Cơ hội hợp tác kinh doanh CEO 1983: \${selectedOpp.title}\`,
                    image: oppImg,
                    targetPath: \`/association/opportunities?id=\${selectedOpp.id}\`,
                  });
                  window.open(\`https://www.facebook.com/sharer/sharer.php?u=\${encodeURIComponent(dynamicUrl)}\`, "_blank");
                  toast.success("Đang mở chia sẻ Facebook với thẻ OpenGraph chuẩn...");
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1877F2] text-white font-bold text-xs shadow-xs hover:brightness-105 active:scale-95 transition cursor-pointer"
              >
                <span>Chia sẻ Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const oppImg = Array.isArray(selectedOpp.images) && selectedOpp.images.length > 0
                    ? selectedOpp.images[0]
                    : (typeof selectedOpp.images === 'string' && selectedOpp.images.startsWith('http') ? selectedOpp.images : undefined);
                  const dynamicUrl = buildDynamicShareUrl({
                    type: 'opportunity',
                    id: selectedOpp.id,
                    title: \`[Cơ Hội Giao Thương B2B] \${selectedOpp.title} — CLB CEO 1983\`,
                    desc: selectedOpp.description || \`Cơ hội hợp tác kinh doanh CEO 1983: \${selectedOpp.title}\`,
                    image: oppImg,
                    targetPath: \`/association/opportunities?id=\${selectedOpp.id}\`,
                  });
                  window.open(\`https://zalo.me/share?url=\${encodeURIComponent(dynamicUrl)}\`, "_blank");
                  toast.success("Đang mở chia sẻ Zalo với thẻ xem trước chuẩn...");
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0068FF] text-white font-bold text-xs shadow-xs hover:brightness-105 active:scale-95 transition cursor-pointer"
              >
                <span>Chia sẻ Zalo</span>
              </button>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const oppImg = Array.isArray(selectedOpp.images) && selectedOpp.images.length > 0
                    ? selectedOpp.images[0]
                    : (typeof selectedOpp.images === 'string' && selectedOpp.images.startsWith('http') ? selectedOpp.images : undefined);
                  const dynamicUrl = buildDynamicShareUrl({
                    type: 'opportunity',
                    id: selectedOpp.id,
                    title: \`[Cơ Hội Giao Thương B2B] \${selectedOpp.title} — CLB CEO 1983\`,
                    desc: selectedOpp.description || \`Cơ hội hợp tác kinh doanh CEO 1983: \${selectedOpp.title}\`,
                    image: oppImg,
                    targetPath: \`/association/opportunities?id=\${selectedOpp.id}\`,
                  });
                  navigator.clipboard.writeText(dynamicUrl);
                  toast.success("Đã sao chép liên kết chia sẻ public chuẩn OpenGraph!", {
                    description: dynamicUrl,
                  });
                }}`;

    content = content.replace(oldSub, newSub);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully patched OpportunityDetailModal.tsx!');
  } else {
    console.error('endMarker not found');
  }
} else {
  console.error('findStr not found');
}

