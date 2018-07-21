const staticCacheName = "resto-review-static-v1";

// cache the below pages for offline access
self.addEventListener('install', event => {
    var urlsToCache = [
        "/",
        "/index.html",
        "/restaurant.html",
        "/review.html",
        "/css/styles.css",
        "/js/dbhelper.js",
        "/js/main.js",
        "/js/restaurant_info.js",
        "/js/serviceworker_register.js",
        "https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff",
        "https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff"
    ]

    event.waitUntil(caches.open(staticCacheName).then(cache => {
      return cache
        .addAll(urlsToCache)
        .catch(error => {
          console.log("Failed to open cache: " + error);
        });
    }));
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