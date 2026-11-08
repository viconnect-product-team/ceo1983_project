import { describe, it, expect } from "vitest";
import {
  organizeCommentsTree,
  formatCommentTime,
  renderMentionableText,
  type FeedComment,
} from "../../components/feed/CommentTreeSection";

describe("Feed Threaded Comment Tree & Mention Processing", () => {
  const sampleComments: FeedComment[] = [
    {
      id: "comment-root-1",
      postId: "post-1",
      authorId: "user-1",
      authorName: "Nguyễn Văn A",
      authorAvatar: "",
      content: "Chúc mừng sự kiện Đại hội thành công!",
      parentId: null,
      createdAt: "2026-11-08T08:00:00Z",
    },
    {
      id: "comment-reply-1",
      postId: "post-1",
      authorId: "user-2",
      authorName: "Trần Thị B",
      authorAvatar: "",
      content: "Cảm ơn anh @Nguyễn Văn A rất nhiều!",
      parentId: "comment-root-1",
      createdAt: "2026-11-08T08:15:00Z",
    },
    {
      id: "comment-reply-2",
      postId: "post-1",
      authorId: "user-3",
      authorName: "Lê Văn C",
      authorAvatar: "",
      content: "Hẹn gặp lại quý anh chị!",
      parentId: "comment-root-1",
      createdAt: "2026-11-08T08:30:00Z",
    },
    {
      id: "comment-root-2",
      postId: "post-1",
      authorId: "user-4",
      authorName: "Phạm Văn D",
      authorAvatar: "",
      content: "Bài chia sẻ rất bổ ích và sâu sắc.",
      parentId: null,
      createdAt: "2026-11-08T09:00:00Z", // Newest root
    },
  ];

  describe("organizeCommentsTree", () => {
    it("should nest replies under their respective root comment", () => {
      const tree = organizeCommentsTree(sampleComments);
      // There are 2 root comments
      expect(tree.length).toBe(2);

      // Root comment 2 was created later (09:00), so it should be on top
      expect(tree[0].id).toBe("comment-root-2");
      expect(tree[0].children.length).toBe(0);

      // Root comment 1 was created earlier (08:00)
      expect(tree[1].id).toBe("comment-root-1");
      expect(tree[1].children.length).toBe(2);

      // Replies should be chronological (reply-1 at 08:15 before reply-2 at 08:30)
      expect(tree[1].children[0].id).toBe("comment-reply-1");
      expect(tree[1].children[1].id).toBe("comment-reply-2");
    });

    it("should treat comments with nonexistent parentId as root comments", () => {
      const orphanComment: FeedComment = {
        id: "comment-orphan",
        postId: "post-1",
        authorId: "user-5",
        authorName: "Hội viên E",
        authorAvatar: "",
        content: "Bình luận độc lập",
        parentId: "non-existent-parent",
        createdAt: "2026-11-08T09:30:00Z",
      };

      const tree = organizeCommentsTree([orphanComment]);
      expect(tree.length).toBe(1);
      expect(tree[0].id).toBe("comment-orphan");
    });
  });

  describe("formatCommentTime", () => {
    it("should return 'Vừa xong' for recent or missing timestamps", () => {
      expect(formatCommentTime()).toBe("Vừa xong");
      const justNow = new Date().toISOString();
      expect(formatCommentTime(justNow)).toBe("Vừa xong");
    });

    it("should return formatted date for timestamps older than 7 days", () => {
      const oldDate = "2025-01-01T00:00:00Z";
      const formatted = formatCommentTime(oldDate);
      expect(formatted).toMatch(/^\d{2}[/-]\d{2}$/);
    });
  });

  describe("renderMentionableText", () => {
    it("should parse text and identify @mention tags", () => {
      const text = "Xin chào @Phạm Văn Vũ và @Nguyễn An!";
      const elements = renderMentionableText(text);
      expect(elements).not.toBeNull();
      expect(Array.isArray(elements)).toBe(true);
    });

    it("should return null for empty text", () => {
      expect(renderMentionableText("")).toBeNull();
    });
  });
});
