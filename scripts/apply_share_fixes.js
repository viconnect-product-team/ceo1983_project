const fs = require('fs');
const path = require('path');

// 1. Cập nhật apps/ceo1983_app_fe/src/routes/association.events.tsx
const eventsFile = 'apps/ceo1983_app_fe/src/routes/association.events.tsx';
let eventsContent = fs.readFileSync(eventsFile, 'utf8');

if (!eventsContent.includes('Share2,')) {
  eventsContent = eventsContent.replace('AlertTriangle,', 'AlertTriangle,\n  Share2,');
}
if (!eventsContent.includes('executeShare')) {
  eventsContent = eventsContent.replace(
    'import { formatDisplayDate } from "@/lib/date-format";',
    'import { formatDisplayDate } from "@/lib/date-format";\nimport { executeShare } from "@/lib/share-helper";'
  );
}

const calendarTarget = `{!isPast && (
              <button
                type="button"
                onClick={(evt) => {
                  evt.stopPropagation();
                  toast.success("Đã đồng bộ sự kiện vào Calendar trên điện thoại thành công!");
                }}`;

const shareSnippet = `{!isPast && (
              <button
                type="button"
                onClick={(evt) => {
                  evt.stopPropagation();
                  executeShare(
                    {
                      type: "event",
                      id: event.id,
                      title: \`[Sự Kiện CEO 1983] \${event.title}\`,
                      desc: \`\${eventDateStr} tại \${event.place || "Hà Nội"}. \${event.description || ""}\`,
                      image: displayImg || undefined,
                      targetPath: \`/association/events?id=\${event.id}\`,
                    },
                    () => toast.success("Đã sao chép liên kết sự kiện để chia sẻ!")
                  );
                }}
                className="px-2 py-[3.16px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-[31.61px] outline outline-[0.74px] outline-offset-[-0.74px] outline-slate-200 dark:outline-slate-700 flex justify-start items-center gap-1 transition cursor-pointer"
                title="Chia sẻ sự kiện"
              >
                <Share2 className="size-3 text-[#003B95] dark:text-blue-400" />
                <span className="text-[#003B95] dark:text-blue-400 text-[9.48px] font-bold font-sans leading-3">Chia sẻ</span>
              </button>
            )}
            `;

if (!eventsContent.includes('title="Chia sẻ sự kiện"')) {
  // Try CRLF or LF replacement
  if (eventsContent.includes(calendarTarget)) {
    eventsContent = eventsContent.replace(calendarTarget, shareSnippet + calendarTarget);
  } else {
    const crlfCalendar = calendarTarget.replace(/\n/g, '\r\n');
    const crlfShare = shareSnippet.replace(/\n/g, '\r\n');
    eventsContent = eventsContent.replace(crlfCalendar, crlfShare + crlfCalendar);
  }
}
fs.writeFileSync(eventsFile, eventsContent, 'utf8');
console.log('✓ Updated association.events.tsx');

// 2. Cập nhật apps/ceo1983_app_fe/src/components/feed/FeedView.tsx
const feedFile = 'apps/ceo1983_app_fe/src/components/feed/FeedView.tsx';
let feedContent = fs.readFileSync(feedFile, 'utf8');

if (!feedContent.includes('executeShare')) {
  feedContent = feedContent.replace(
    'import { resolveMediaUrl, fetchNestApi } from "@/lib/api-client";',
    'import { resolveMediaUrl, fetchNestApi } from "@/lib/api-client";\nimport { executeShare } from "@/lib/share-helper";'
  );
}

// Thay thế đoạn share trong handleShare
const oldShareBlock = `      const shareUrl = \`\${window.location.origin}/share/post/\${post.id}\`;
      if (navigator.share) {
        await navigator.share({
          title: post.author.name ? \`Bi vi?t c?a \${post.author.name}\` : "CEO 1983 Feed",
          text: post.content,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(" sao chp lin k?t bi vi?t");
      }`;

// Tìm pattern /share/post/ trong handleShare
feedContent = feedContent.replace(
  /const shareUrl = `\${window\.location\.origin}\/share\/post\/\${post\.id}`;[\s\S]*?toast\.success\(".*?bi vi\?t"\);[\s\S]*?}/,
  `await executeShare(
        {
          type: "post",
          id: post.id,
          title: \`[Mạng Lưới CEO 1983] Bài viết từ \${post.author?.name || "Hội viên"}\`,
          desc: post.content?.slice(0, 200),
          image: post.images?.[0] || undefined,
          targetPath: \`/association/messages?post=\${post.id}\`,
        },
        () => toast.success("Đã sao chép liên kết bài viết!")
      );
    }`
);
fs.writeFileSync(feedFile, feedContent, 'utf8');
console.log('✓ Updated FeedView.tsx');

// 3. Cập nhật apps/ceo1983_app_fe/src/routes/association.training.tsx
const trainingFile = 'apps/ceo1983_app_fe/src/routes/association.training.tsx';
let trainingContent = fs.readFileSync(trainingFile, 'utf8');

if (!trainingContent.includes('executeShare')) {
  trainingContent = trainingContent.replace(
    'import { formatDisplayDate } from "@/lib/date-format";',
    'import { formatDisplayDate } from "@/lib/date-format";\nimport { executeShare } from "@/lib/share-helper";'
  );
}

const oldTrainingShare = `onClick={() => {
                          navigator.clipboard.writeText(meetingUrl);
                          toast.success("Đã copy link phòng họp vào clipboard!");
                        }}`;

const newTrainingShare = `onClick={() => {
                          executeShare(
                            {
                              type: "training",
                              id: t.id,
                              title: \`[Đào Tạo CEO 1983] \${t.title}\`,
                              desc: t.description || "Chuyên đề nâng tầm lãnh đạo thực chiến CLB CEO 1983",
                              image: t.cover_image || undefined,
                              targetPath: \`/association/training?id=\${t.id}\`,
                            },
                            () => toast.success("Đã sao chép liên kết khóa đào tạo!")
                          );
                        }}`;

if (trainingContent.includes(oldTrainingShare)) {
  trainingContent = trainingContent.replace(oldTrainingShare, newTrainingShare);
} else {
  const crlfOld = oldTrainingShare.replace(/\n/g, '\r\n');
  const crlfNew = newTrainingShare.replace(/\n/g, '\r\n');
  trainingContent = trainingContent.replace(crlfOld, crlfNew);
}

fs.writeFileSync(trainingFile, trainingContent, 'utf8');
console.log('✓ Updated association.training.tsx');

