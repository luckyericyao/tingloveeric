export const defaultSitePasscode = "5599";

export function sitePasscode() {
  return process.env.LOVE_SITE_PASSCODE || defaultSitePasscode;
}
