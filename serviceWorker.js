const staticBloquinho = "bloco-de-notas"
const assets = [
    "/bloco-de-notas",
    "/bloco-de-notas/index.html",
    "/bloco-de-notas/assets/styles/bootstrap.css",
    "/bloco-de-notas/assets/scripts/bootstrap.js",
    "/bloco-de-notas/assets/scripts/script.js",
    "/bloco-de-notas/assets/images/icon-192x192.png",
    "/bloco-de-notas/assets/images/icon-256x256.png",
    "/bloco-de-notas/assets/images/icon-384x384.png",
    "/bloco-de-notas/assets/images/icon-512x512.png",
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
