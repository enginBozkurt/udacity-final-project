(function() {
  'use strict';
  //https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker
  var filesToCache = [
    '.',
    '/',
    'css/styles.css',
    'js/dbhelper.js',
    'js/main.js',
    'js/restaurant_info.js',
    'img/1.webp',
    'img/2.webp',
    'img/3.webp',
    'img/4.webp',
    'img/5.webp',
    'img/6.webp',
    'img/7.webp',
    'img/8.webp',
    'img/9.webp',
    'img/10.webp',
    'data/restaurants.json',
    'index.html',
    'restaurant.html',
    'dist/1.webp',
    'dist/2.webp',
    'dist/3.webp',
    'dist/4.webp',
    'dist/5.webp',
    'dist/6.webp',
    'dist/7.webp',    
    'dist/8.webp',
    'dist/9.webp',
    'dist/10.webp',
    'dist/logo-512px.png',
    'dist/logo-192px.png',
    'dist/dbhelper.js',
    'dist/main.js',
    'dist/restaurant_info.js',
    'dist/styles.css',
    'manifest.json',
  ];

  var staticCacheName = 'restaurants-cache-v2';

  var allCaches = [
    staticCacheName   
  ];
  
  //Cache the application shell in the "install" event handler in the service worker
  self.addEventListener('install', function(event) {
    console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(
      caches.open(staticCacheName)
      .then(function(cache) {
        return cache.addAll(filesToCache);
      })
    );
  });
  //delete outdated caches
  self.addEventListener('activate', function(event) {
    event.waitUntil(
      // Get all the cache keys (cacheName)
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('restaurants-') &&
                   !allCaches.includes(cacheName);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    ); 
  });

//open database
function openDatabase() {
  const dbName = 'restaurant-db-v1';
  const storeName = 'restaurant-store-v1';
  // creating/opening our database
  const request = indexedDB.open(dbName, 1);
  return {request, storeName};
}
//we are fetching restaurants across the network and assing reviews to them
function fetchRestsWithReviews() {
  fetch('http://localhost:1337/restaurants').then(function (response) {
    //A request is a stream and can only be consumed once. Since we are consuming this once by cache 
    //and once by the browser for fetch, we need to clone the response
    var clonedResponse = response.clone();
    //convert the response body to a JSON object
    clonedResponse.json().then(function (data) {
      //open database
      const { request, storeName } = openDatabase();
      request.onupgradeneeded = function (event) {
        var db = event.target.result;
        var store = db.createObjectStore(storeName, { keyPath: "id" });
      };
      request.onsuccess = function (event) {
        // we are iterating over restaurant reviews based on the id value of restaurant across the network
        data.forEach(function (item) {
          fetch('http://localhost:1337/reviews/?restaurant_id=' + item.id).then(function (response2) {
            var clonedResponse2 = response2.clone();
            //convert the response body to a JSON object
            clonedResponse2.json().then(function (data2) {
              data2.forEach(function (item2) {
                console.log('reviews ' + JSON.stringify(item2));
              });
              //assigns the reviews to the related restaurant
              item.reviews = data2;
              var db = event.target.result;
              var tx = db.transaction(storeName, "readwrite");
              var store = tx.objectStore(storeName);
              store.put(item);
            });
          });
        });
      };
    });
  });
}

  //we first check the cache for the requested resource (with caches.match) 
  //and then, if that fails, we send the request to the network
  self.addEventListener('fetch', function(event) {
      event.respondWith(
        caches.match(event.request, { "ignoreSearch": "true" }).then(function(response) {
          var createDbPromise = function(url) {
            return new Promise((resolve, reject) => {
              if (url.includes("http://localhost:1337/restaurants") && !url.includes("is_favorite"))
              {
                //indexedDB create/open database
                const { request, storeName } = openDatabase();
                //when a request returns an error
                request.onerror = function(event) {
                    reject(request.error);
                }
                // creating an IndexedDB to store our data:
                request.onupgradeneeded = function(event) {
                    var db = event.target.result;
                    //creating an objectStore to hold restaurants info
                    var store = db.createObjectStore(storeName, {keyPath: "id"});

                    //we are fetching restaurants across the network and assing reviews to them
                    fetchRestsWithReviews();
                };
                // indexedDB on success
                request.onsuccess = function(event) {
                    console.log('Database initialized succesfully');
                    // store the result of opening the database in the db variable
                    var db = event.target.result;
                    // open a read/write db transaction, ready for adding the data
                    var tx = db.transaction(storeName, "readwrite");
                    var store = tx.objectStore(storeName);
                    // returns an IDBRequest object containing all objects in the object store
                    const getAllObjects = store.getAll();
                    var objectStorePromise = new Promise(function(resolve, reject) {
                      getAllObjects.onsuccess = function(event) {
                          resolve(event.target.result);
                      };
                      getAllObjects.onerror = function(event) {
                          reject(getAllObjects.error);
                      };
                    });
                    
                    tx.onerror = function() {
                        console.log(tx.error);
                    };

                    tx.oncomplete = function() {
                        //close database
                        db.close();
                        objectStorePromise.then(result => {
                          console.log("IndexedDB store includes " + JSON.stringify(result));
                          resolve(result);
                        }, function(err) {
                          console.log("Error in indexedDB store: " + err);
                          reject(err);
                        });                        
                    };
                }
              } 
              else {
                console.log('indexedDB usage fail for url: ' + url);
                reject();
              }
            });
          }
          return response ||
            createDbPromise(event.request.url)
            .then(result => {
              console.log('Could not find in cache: ' + event.request.url);
              //the constructor of a response expects a Blob object
              //adds result information of response to it and returns a new response with the modified content 
              var jsone = JSON.stringify(result);
              var blob = new Blob([jsone], {
                type: 'application/json'
              });
              var response = new Response(blob);
              console.log('Returning data for ' + event.request.url + ' from indexedDB: ' + response);
              return response;
            }, function (err) {
              console.log('Fetch across network from url: ' + event.request.url);
              return fetch(event.request)
                .then(response => {
                  console.log('Returning data ' + event.request.url + ' from server after indexedDB failure: ' + response);
                  return response;
                });
            }) ||
            fetch(event.request)
            .then(response => {
              console.log('Returning data for ' + event.request.url + ' from origin: ' + response);
              return response;
            });
          }, function (err) {
            console.log('Failure with cache for url: ' + event.request.url);
            // a new request for cache
            return fetch(event.request)
              .then(response => {
                console.log('A new request ' + event.request.url + ' from server after failed cache: ' + response);
                return response;
              });
          })
      );
  });
  
})();



