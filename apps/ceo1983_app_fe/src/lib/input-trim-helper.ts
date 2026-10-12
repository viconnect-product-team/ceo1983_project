/**
 * Global Stream / Trim Space Helper for CEO 1983 App & CRM
 * Tự động cắt bỏ khoảng trắng thừa đầu cuối (Auto-trim whitespace) cho toàn bộ
 * các ô nhập liệu (<input>, <textarea>) khi người dùng hoàn thành nhập hoặc chuyển ô.
 */

export function trimInputElement(target: EventTarget | null) {
  if (!target || !(target instanceof HTMLElement)) return;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;

  // Bỏ qua các loại input không phải văn bản hoặc cần bảo toàn ký tự (mật khẩu, file, checkbox,...)
  if (
    target instanceof HTMLInputElement &&
    (target.type === "password" ||
      target.type === "file" ||
      target.type === "checkbox" ||
      target.type === "radio" ||
      target.type === "submit" ||
      target.type === "button" ||
      target.type === "reset" ||
      target.type === "color" ||
      target.type === "range")
  ) {
    return;
  }

  const raw = target.value;
  if (typeof raw !== "string") return;

  const trimmed = raw.trim();
  if (trimmed === raw) return;

  // Cập nhật giá trị thông qua prototype descriptor để React Virtual DOM tracker nhận diện thay đổi
  const prototype =
    target instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor?.set) {
    descriptor.set.call(target, trimmed);
  } else {
    target.value = trimmed;
  }

  // Phát sinh sự kiện synthetic để React Hook Form, TanStack Form và state onChange đồng bộ giá trị sạch
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Khởi tạo bộ bắt sự kiện blur/focusout toàn cầu trên document/window
 */
export function setupGlobalInputTrimmer(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleBlur = (e: FocusEvent) => {
    trimInputElement(e.target);
  };

  // Sử dụng capture phase = true để đón đầu mọi sự kiện blur từ bất kỳ phần tử con nào trên cây DOM
  window.addEventListener("blur", handleBlur, true);
  window.addEventListener("focusout", handleBlur, true);

  return () => {
    window.removeEventListener("blur", handleBlur, true);
    window.removeEventListener("focusout", handleBlur, true);
  };
}
