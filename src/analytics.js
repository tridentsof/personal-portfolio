/**
 * Google Analytics 4 (GA4) Telemetry & Event Tracking Module
 * Target Property: G-WXC9KNMPJB
 */

/**
 * Safely dispatches a GA4 event to window.gtag or dataLayer without crashing if blocked.
 * @param {string} eventName - GA4 event name (e.g., 'select_content', 'contact_click')
 * @param {Record<string, any>} [eventParams={}] - Additional event parameters
 */
export function trackEvent(eventName, eventParams = {}) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...eventParams
      });
    }
  } catch (err) {
    // Gracefully handle any browser extension or adblocker restrictions
    console.debug('[GA4] Event dispatch skipped:', err);
  }
}

/**
 * Tracks portfolio section/tab navigation
 * @param {string} sectionName - 'about' | 'experience' | 'certifications' | 'skills' | 'contact' | 'overview'
 */
export function trackSectionView(sectionName) {
  trackEvent('select_content', {
    content_type: 'portfolio_section',
    item_id: sectionName,
    section_name: sectionName
  });

  const origin = (typeof window !== 'undefined' && window.location?.origin) || '';
  const pagePath = `/#${sectionName}`;

  // Also dispatch a virtual page_view for SPA routing analytics
  trackEvent('page_view', {
    page_title: `TRIDENT — ${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`,
    page_location: origin ? `${origin}${pagePath}` : pagePath,
    page_path: pagePath
  });
}

/**
 * Tracks external contact actions (email, phone, LinkedIn, GitHub, Facebook)
 * @param {'email' | 'phone' | 'linkedin' | 'github' | 'facebook'} channel
 * @param {string} targetUrlOrValue
 */
export function trackContactClick(channel, targetUrlOrValue) {
  trackEvent('contact_click', {
    channel,
    target: targetUrlOrValue
  });
}

/**
 * Tracks UI preference toggles (Language, Lighting, Audio)
 * @param {string} settingName - 'language' | 'lighting' | 'audio'
 * @param {string|boolean} value
 */
export function trackPreferenceChange(settingName, value) {
  trackEvent('user_preference_change', {
    setting: settingName,
    value: String(value)
  });
}

/**
 * Tracks tactile keyboard switch interactions
 * @param {'typing_keys' | 'hero_action_button'} trigger
 * @param {number} strokeCount
 */
export function trackKeyboardInteraction(trigger, strokeCount = 1) {
  trackEvent('keyboard_thock_interaction', {
    trigger,
    stroke_count: strokeCount
  });
}

/**
 * Tracks 3D perspective / camera angle switching
 * @param {string} perspectiveName
 * @param {'next' | 'prev' | 'direct'} direction
 */
export function trackCameraAngleSwitch(perspectiveName, direction = 'direct') {
  trackEvent('camera_angle_switch', {
    perspective_name: perspectiveName,
    direction
  });
}

/**
 * Tracks Software Engineering Manifesto interactions
 * @param {'chip_open' | 'read_more' | 'source_external_click'} action
 */
export function trackManifestoInteraction(action) {
  trackEvent('manifesto_interaction', {
    action
  });
}

/**
 * Tracks interactive item / tag / certificate clicks
 * @param {'certificate' | 'skill_tag'} itemType
 * @param {string} itemName
 */
export function trackContentInspection(itemType, itemName) {
  trackEvent('inspect_content', {
    item_type: itemType,
    item_name: itemName
  });
}

/**
 * Starts an engagement timer that emits milestones (15s, 30s, 60s, 120s, 300s)
 */
export function initEngagementTimer() {
  if (typeof window === 'undefined') return;
  const milestones = [15, 30, 60, 120, 300];
  milestones.forEach((sec) => {
    setTimeout(() => {
      // Only track if page is currently visible
      if (document.visibilityState === 'visible') {
        trackEvent('user_engagement_milestone', {
          duration_seconds: sec
        });
      }
    }, sec * 1000);
  });
}
