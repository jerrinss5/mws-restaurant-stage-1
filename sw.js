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
        "/manifest.json",
        "/icons/like-1.svg",
        "/icons/like-2.svg",
        "https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff",
        "https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff",
        "https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
        "https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2"
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
    // also only caching localhost files and a google maps api required for working offline
    if (requestedURL.port !== "1337" && (requestedURL.hostname === "localhost" || requestedURL.href === "https://maps.googleapis.com/maps/api/js?libraries=places&callback=initMap")){
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
    return caches.open(staticCacheName).then(cache => {
      return cache.match(request, {ignoreSearch: true}).then(response => {
        if (response) return response;
  
        return fetch(request).then(networkResponse => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }).catch(error => {
            console.log('some error occurred saving review from fetch: ',error);
        });
      });
    });
  }