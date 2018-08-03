if (navigator.serviceWorker) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(function(reg){
            console.log('Service Worker registered successfully!!!', reg);
        }).catch(regError => {
            console.log('Failed to register service worker!', regError);
        });
    })
}

// ref: https://developers.google.com/web/fundamentals/primers/service-workers/registration
// delaying service worker after the page has been loaded to improve the page performance.