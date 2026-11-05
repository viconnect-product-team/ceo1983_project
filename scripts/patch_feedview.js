const fs = require('fs');
const file = 'apps/ceo1983_app_fe/src/components/feed/FeedView.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = 'const shareUrl = `${window.location.origin}/share/post/${post.id}`;';
const idx = code.indexOf(target);
if (idx !== -1) {
  const endIdx = code.indexOf('} catch {', idx);
  const replacement = `await executeShare(
        {
          type: "post",
          id: post.id,
          title: \`[Mạng Lưới CEO 1983] \${post.title || \`Bài viết từ Doanh nhân \${post.author?.name || "Hội viên"}\`}\`,
          desc: post.content?.slice(0, 200),
          image: post.images?.[0] || undefined,
          targetPath: \`/association/messages?post=\${post.id}\`,
        },
        () => toast.success("Đã sao chép liên kết bài viết!")
      );\n    `;
  code = code.slice(0, idx) + replacement + code.slice(endIdx);
  fs.writeFileSync(file, code, 'utf8');
  console.log('✓ FeedView handleShare replaced successfully!');
} else {
  console.log('Target not found in FeedView.tsx');
}

