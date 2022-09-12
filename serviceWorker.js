const staticBloquinho = "bloco-de-notas"
const assets = [
    "/",
    "/index.html",
    "/assets/styles/bootstrap.css",
    "/assets/scripts/bootstrap.js",
    "/assets/scripts/script.js",
    "/assets/images/icon-192x192.png",
    "/assets/images/icon-256x256.png",
    "/assets/images/icon-384x384.png",
    "/assets/images/icon-512x512.png",
]

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticBloquinho).then(cache => {
            cache.addAll(assets)
        })
    )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request)
        })
    )
})