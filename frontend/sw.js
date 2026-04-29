const CACHE = 'softskills-v15';
const ASSETS = [
    '/SoftSkills-Hub/',
    '/SoftSkills-Hub/index.html',
    '/SoftSkills-Hub/aprendiz.html',
    '/SoftSkills-Hub/gestor.html',
    '/SoftSkills-Hub/styles/global.css',
    '/SoftSkills-Hub/styles/login.css',
    '/SoftSkills-Hub/styles/gestor.css',
    '/SoftSkills-Hub/styles/aprendiz.css',
    '/SoftSkills-Hub/scripts/core/api.js',
    '/SoftSkills-Hub/scripts/core/theme.js',
    '/SoftSkills-Hub/scripts/core/dom.js',
    '/SoftSkills-Hub/scripts/core/format.js',
    '/SoftSkills-Hub/scripts/core/feedback.js',
    '/SoftSkills-Hub/scripts/core/animations.js',
    '/SoftSkills-Hub/scripts/core/pwa.js',
    '/SoftSkills-Hub/assets/icons/Logo.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    if (e.request.url.includes('onrender.com') || e.request.url.includes('fonts.')) return;
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
