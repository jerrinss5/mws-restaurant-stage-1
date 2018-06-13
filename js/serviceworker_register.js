if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js').then(function(reg){
        console.log('Service Worker registered successfully!!!');
    }).catch(function(){
        console.log('Failed to register service worker!');
    });
}