const BUILD_VERSION = '2026.10.09.562';
const CACHE_PREFIX = 'hotb-app-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_VERSION}`;
const OFFLINE_SHELL = './index.html';
const CANONICAL_LAUNCH = './?source=pwa&launch=562';
const LEGACY_SHELL = './hotb-fresh.html';
const CORE_FILES = ['./index.html','./hotb-fresh.html','./manifest.webmanifest','./pwa-update.js','./styles.css','./evaluation-cleanup.css','./hotb-night-fixes.css','./observation-publish-v2.css','./observation-publish-v2.js','./practice-focus-integration.js','./app.js','./practice-scheduler.js','./team-recommendations.js','./practice-bypass.js'];
/* Branch safeguard: full production service worker remains unchanged while assistant-coach Focus is developed in isolated helper files. */
