const cacheName = 'v1';

const cacheFiles = [
    './',
    './portfolio.html',
    '/css/cssreset.css',
    '/css/main.css',
    '/css/style.css',
    '/css/util.css'
]

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Installed');

    // e.waitUntil laat de event wachten tot de Promise opgelost is
    e.waitUntil(

        // Open cache
        caches.open(cacheName).then(function(cache) {

            // alle files naar cache
            console.log('[ServiceWorker] Caching cacheFiles');
            return cache.addAll(cacheFiles);
        })
    );
});

//activeren
self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activated');

    e.waitUntil(

        // Alle cache keys (cacheName)
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(thisCacheName) {

                // als een cached item opgeslagen is onder de vorige cache:
                if (thisCacheName !== cacheName) {

                    // verwijder dat cached file
                    console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }));
        })
    );
});


self.addEventListener('fetch', function(e) {
    console.log('[ServiceWorker] Fetch', e.request.url);

    // e.respondWidth Responds to the fetch event
    e.respondWith(

        // Check in cache for the request being made
        caches.match(e.request)


            .then(function(response) {

                // If the request is in the cache
                if ( response ) {
                    console.log("[ServiceWorker] Found in Cache", e.request.url, response);
                    // Return the cached version
                    return response;
                }

                // If the request is NOT in the cache, fetch and cache

                var requestClone = e.request.clone();
                fetch(requestClone)
                    .then(function(response) {

                        if ( !response ) {
                            console.log("[ServiceWorker] No response from fetch ")
                            return response;
                        }

                        var responseClone = response.clone();

                        //  Open the cache
                        caches.open(cacheName).then(function(cache) {

                            // Put the fetched response in the cache
                            cache.put(e.request, responseClone);
                            console.log('[ServiceWorker] New Data Cached', e.request.url);

                            // Return the response
                            return response;

                        }); // end caches.open

                    })
                    .catch(function(err) {
                        console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
                    });


            }) // end caches.match(e.request)
    ); // end e.respondWith
});