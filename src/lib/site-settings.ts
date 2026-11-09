export const SITE_SETTINGS_VERSION = "2026-11-08"
export const SITE_SETTINGS_VERSION_KEY = "glasscn-settings-version"

/** Bump the version to reset saved site settings once, before palette/theme hydration. */
export const siteSettingsResetScript = `try{if(localStorage.getItem(${JSON.stringify(SITE_SETTINGS_VERSION_KEY)})!==${JSON.stringify(SITE_SETTINGS_VERSION)}){["glasscn-palette","glasscn-custom-css","theme","glass-preferences"].forEach(function(k){localStorage.removeItem(k)});localStorage.setItem(${JSON.stringify(SITE_SETTINGS_VERSION_KEY)},${JSON.stringify(SITE_SETTINGS_VERSION)})}}catch(e){}`
