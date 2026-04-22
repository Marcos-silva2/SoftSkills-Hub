const CACHE = 'softskills-v9';
const ASSETS = [
    '/SoftSkills-Hub/',
    '/SoftSkills-Hub/index.html',
    '/SoftSkills-Hub/painel.aprendiz.html',
    '/SoftSkills-Hub/painel-gestor.html',
    '/SoftSkills-Hub/css/global.css',
    '/SoftSkills-Hub/css/gestor.css',
    '/SoftSkills-Hub/css/aprendiz.css',
    '/SoftSkills-Hub/js/api.js',
    '/SoftSkills-Hub/js/theme.js',
    '/SoftSkills-Hub/js/utils.js',
    '/SoftSkills-Hub/emoji/Logo.png'
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
