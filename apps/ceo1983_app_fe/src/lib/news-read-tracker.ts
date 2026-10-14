// Tracking state for read / unread news items in CEO 1983 app

const READ_NEWS_STORAGE_KEY = "ceo1983_read_news_ids";

export function getReadNewsIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_NEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNewsAsRead(id: string): string[] {
  if (typeof window === "undefined" || !id) return [];
  try {
    const current = getReadNewsIds();
    if (!current.includes(id)) {
      const updated = [id, ...current];
      localStorage.setItem(READ_NEWS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("ceo1983_news_read_updated", {
          detail: { id, readIds: updated },
        })
      );
      return updated;
    }
    return current;
  } catch {
    return [];
  }
}

export function markAllNewsAsRead(ids: string[]): string[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getReadNewsIds();
    const set = new Set([...current, ...ids]);
    const updated = Array.from(set);
    localStorage.setItem(READ_NEWS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("ceo1983_news_read_updated", {
        detail: { readIds: updated },
      })
    );
    return updated;
  } catch {
    return [];
  }
}
