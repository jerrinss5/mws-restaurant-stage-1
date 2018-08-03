const staticCacheName = "resto-review-static-v1";

// cache the below pages for offline access
self.addEventListener('install', event => {
    var urlsToCache = [
        "/",
        "/index.html",
        "/restaurant.html",
        "/css/styles.css",
        "/js/dbhelper.js",
        "/js/main.js",
        "/js/restaurant_info.js",
        "/js/serviceworker_register.js",
        "/js/idb.js",
        "/js/idb_helper.js",
        "/img/1-320-small.jpg",
        "/img/2-320-small.jpg",
        "/img/3-320-small.jpg",
        "/img/4-320-small.jpg",
        "/img/5-320-small.jpg",
        "/img/6-320-small.jpg",
        "/img/7-320-small.jpg",
        "/img/8-320-small.jpg",
        "/img/9-320-small.jpg",
        "/img/10-320-small.jpg",
        "/manifest.json",
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
    // console.log(event.request);

    const requestedURL = new URL(event.request.url);

    if (requestedURL.pathname.startsWith('/restaurant.html')) {
        event.respondWith(serveReviews(event.request));
        return;
      }

    // checking if the requested url is not for the REST API
    // if it is not try to serve from cache and if not present in cache serve from the web
    if (requestedURL.port !== "1337"){
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).then(response => {
                    let responseClone = response.clone();
                    caches.open(staticCacheName).then(cache => {
                        cache.put(event.request, responseClone)
                    })
                    return response;
                }).catch(error => {
                    console.log(`some error occured while fetching: ${error}`)
                });
            })
        )
    }
});

function serveReviews(request) {
  
    return caches.open(staticCacheName).then(function(cache) {
      return cache.match(request).then(function(response) {
        if (response) return response;
  
        return fetch(request).then(function(networkResponse) {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    });
  }