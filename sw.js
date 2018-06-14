var staticCacheName = 'resto-review-static-v1';

// cache the below pages for offline access
self.addEventListener('install', function(event){
    var urlsToCache = [
        '/',
        'restaurant.html',
        'js/main.js',
        'sw.js',
        'js/serviceworker_register.js',
        'js/',
        'js/dbhelper.js',
        'js/restaurant_info.js',
        'css/styles.css',
        'data/restaurants.json',
        'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
        'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
    ];

    event.waitUntil(
        caches.open(staticCacheName).then(function(cache){
            return cache.addAll(urlsToCache);
        })
    );
});

// responding with an entry from the cache if there is a match
self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request).then(function(response){
            if (response) return response;
            return fetch(event.request);
        })
    )
});