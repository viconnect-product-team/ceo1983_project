export const formatVNTime = (date: Date): string => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const vnDate = new Date(utc + 3600000 * 7);
  const hh = String(vnDate.getHours()).padStart(2, '0');
  const mm = String(vnDate.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

export function parsePersonId(personId: string) {
  const kindChar = personId.substring(0, 1);
  const idVal = personId.substring(2);
  let targetKind = 'connection';
  let targetUserId: string | null = null;
  let targetCardId: string | null = null;
  let targetGuestId: string | null = null;

  if (kindChar === 'u') {
    targetKind = 'connection';
    targetUserId = idVal;
  } else if (kindChar === 'c') {
    targetKind = 'saved_card';
    targetCardId = idVal;
  } else if (kindChar === 'g') {
    targetKind = 'guest_contact';
    targetGuestId = idVal;
  }

  return { targetKind, targetUserId, targetCardId, targetGuestId };
}

export function composePersonId(targetKind: string, targetUserId: string | null, targetCardId: string | null, targetGuestId: string | null) {
  if (targetKind === 'connection' && targetUserId) return `u:${targetUserId}`;
  if (targetKind === 'saved_card' && targetCardId) return `c:${targetCardId}`;
  if (targetKind === 'guest_contact' && targetGuestId) return `g:${targetGuestId}`;
  return '';
}

