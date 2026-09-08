export function accessConfiguration() {
  const guestPasscode = process.env.LOVE_SITE_PASSCODE;
  const ownerPasscode = process.env.LOVE_OWNER_PASSCODE;
  const secret = process.env.LOVE_SESSION_SECRET;
  if (!guestPasscode || guestPasscode.length < 8 || !secret || secret.length < 32) return null;
  if (ownerPasscode && (ownerPasscode.length < 12 || ownerPasscode === guestPasscode)) return null;
  return { guestPasscode, ownerPasscode, secret };
}
