let restaurant;
var map;

//  www.sitepoint.com/google-maps-javascript-api-the-right-way/
document.addEventListener('DOMContentLoaded', (event) => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { 
      console.error(error);
    } else {
      fillBreadcrumb();
    }
  });
  // make JS responsive for GoogleMap using matchMedia 
  const mq = window.matchMedia("(min-width: 769px)");
  if (mq.matches) {
    addMapToApp();
  } else {
    document.getElementById('map-container').style.minHeight = '120px';
    document.getElementById('map-container').style.height = '120px';
  }
});

function grabGoogleMapsJS() {
  var scriptMap = document.createElement('script');
  scriptMap.type = 'text/javascript';
  scriptMap.src = 'https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyCkztJBGXVEEZPAtlOkFhUT1CrKSi1WJg4&libraries=places&callback=initMap';
  scriptMap.defer = true;
  scriptMap.async = true;
  return scriptMap;
}

function addMapToApp() {
  var mapJs = grabGoogleMapsJS();
  console.log('Loading Google Map Js file: ' + mapJs);
  // a simple toggle show/hide button properties
  // medium.com/@lorenzozaccagnini/improve-google-map-performance-in-your-pwa-fe24a6b3a37b
  document.getElementById('map').style.display = 'block';
  document.getElementById('toggle-map').style.display = 'none';

  const mq = window.matchMedia("(max-width: 768px)");
  if (mq.matches) {
    document.getElementById('map-container').style.minHeight = '320px';
    document.getElementById('map-container').style.height = '320px';
  }
  document.getElementsByTagName('head')[0].appendChild(mapJs);
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURLWithoutFillingHTML((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

fetchRestaurantFromURLWithoutFillingHTML = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      callback(null, restaurant)
    });
  }
}

/** www.w3schools.com/howto/howto_css_modals.asp
 *  Modal for adding review
 */
addReviewModal();

function addReviewModal() {
  // Get the modal
  var modal = document.getElementById('modalAddReview');
  // Get the button that opens the modal
  var btn = document.getElementById("buttonAddReview");
  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("modal-close")[0];
  // When the user clicks on the button, open the modal
  btn.onclick = function () {
    modal.style.display = "block";
  }
  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}


// fetch data from JSON url
function postData(url, data) {
  return fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    .then(res => res.json());
}


 // button action for favorite -> unfavorite button

var buttonToggleFavourite = document.getElementById("buttonToggleFavourite");

buttonToggleFavourite.onclick = function () {
  // stackoverflow.com/questions/46268312/toggle-javascript-functions-on-same-button
  buttonToggleFavourite.classList.toggle("favorite");
  buttonToggleFavourite.classList.toggle("unfavorite");

  var text = buttonToggleFavourite.firstChild;

  if (text.data == "Favorite")  {
    text.data = "Unfavorite" ;
  } 
  else {
    text.data = "Favorite" ;
  }

  const restaurant_id = getParameterByName('id');
  
  var url = 'http://localhost:1337/restaurants/' + restaurant_id + '/?is_favorite=' + (text.data == "Favorite");
   
  fetch(url, {
      method: 'PUT',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    .then(res => {res.json()})
    .catch(error => {
      console.error('Error:', error);
      storeFavIDB(url);
    });

  changeIDBFavorite(restaurant_id, text);
}

// store favorite request in IDB
function storeFavIDB(url) {
   
  //open database
  const request = indexedDB.open('restaurant-cachedIDB-v1', 1);

  request.onerror = function (event) {
    console.error("indexedDB error");
  };

  request.onupgradeneeded = function (event) {
    var db = event.target.result;
    var store = db.createObjectStore('restaurant-favorite-v1', {
      keyPath: "id"
    });
    var storeForReviews = db.createObjectStore('restaurant-review-v1', {
      keyPath: "id"
    });
  };

  request.onsuccess = function (event) {
    var db = event.target.result;

    var tx = db.transaction('restaurant-favorite-v1', 'readwrite');
    var store = tx.objectStore('restaurant-favorite-v1');

    var favoriteIDB = {
      url : url,
      id : new Date().getTime()
    };
        
    var tx = db.transaction('restaurant-favorite-v1', 'readwrite');
    var store = tx.objectStore('restaurant-favorite-v1');
    store.put(favoriteIDB);
  };
}


// change the favorite value of restaurant in IndexedDB
function updateCursorForFav(cursor, text) {
  var changeFav = cursor.value;
  changeFav.is_favorite = (text.data == "Favorite")
  var request = cursor.update(changeFav);
  return request;
}

function changeIDBFavorite(restaurant_id, text) {

  var db;
  const request = indexedDB.open('restaurant-db-v1', 1);
    
  request.onerror = function (event) {
      console.error("indexedDB error");
  };

  request.onsuccess = function (event) {

      db = event.target.result;

      var tx = db.transaction('restaurant-store-v1', 'readwrite');
      var store = tx.objectStore('restaurant-store-v1');

      store.openCursor().onsuccess = function (event) {
          var cursor = event.target.result;

          if (!cursor) return;

              if (cursor.value.id == restaurant_id) {

                var request = updateCursorForFav(cursor, text);

                  request.onsuccess = function () {
                      console.log("Update restaurant favorite for id: " + restaurant_id);
                  };
              };
              cursor.continue();
           
      };
  };
}


 //add review in modal

 function addReview() {
  //stackoverflow.com/questions/11563638/how-do-i-get-the-value-of-text-input-field-using-javascript/30637312
  var name = document.getElementById('name').value;
  var rating = document.getElementById('rating').value;
  var comments = document.getElementById('comments').value;

  const restaurant_id = getParameterByName('id');

  var url = 'http://localhost:1337/reviews/';

  var data = {
    restaurant_id: restaurant_id, 
    name: name, 
    rating: rating, 
    comments: comments
  };

  postData(url, data)
  .catch(error => {
    console.error('Error:', error);
    storeCallForAddReviewInIDB(url, data, restaurant_id);
  });
  
  addNewReviewToIDB(data, name, rating, comments, restaurant_id);

  console.log("Close modal");
  document.getElementById('modalAddReview').style.display = "none";
}

 //Cache add review request in indexedDB
 
function storeCallForAddReviewInIDB(url, data, restaurant_id) {

  const request = indexedDB.open('restaurant-cachedIDB-v1', 1);

  request.onerror = function (event) {
    console.error("indexedDB error");
  };

  request.onupgradeneeded = function (event) {

    var db = event.target.result;

    var store = db.createObjectStore('restaurant-review-v1', {
      keyPath: "id"
    });
    var storeForFavorite = db.createObjectStore('restaurant-favorite-v1', {
      keyPath: "id"
    });
  };
  request.onsuccess = function (event) {
    var db = event.target.result;

    var tx = db.transaction('restaurant-review-v1', 'readwrite');
    var store = tx.objectStore('restaurant-review-v1');

    var reviewIDB = {
      restaurant_id : data.restaurant_id,
      name : data.name,
      rating : data.rating,
      comments : data.comments,
      id : new Date().getTime()
    };
    

    console.log("Adding review for restaurant with id " + restaurant_id + "  to indexDB with id " + reviewIDB.id);

    var tx = db.transaction('restaurant-review-v1', 'readwrite');
    var store = tx.objectStore('restaurant-review-v1');

    store.put(reviewIDB);
  };
}


// create time stamps for update 
function createTimeStamps(data) {
  data.createdAt = new Date();
  data.updatedAt = new Date();
}

// append child node for new review
function addNodeForReview(data) {
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(data));
}



//Update restaurant store in IndexedDB with new review

function addNewReviewToIDB(data, name, rating, comments, restaurant_id) {

  var db;
  const request = indexedDB.open('restaurant-db-v1', 1);

  request.onerror = function (event) {
    console.error("indexedDB error");
  };

  request.onsuccess = function (event) {

    db = event.target.result;

    var tx = db.transaction('restaurant-store-v1', 'readwrite');
    var store = tx.objectStore('restaurant-store-v1');

    store.openCursor().onsuccess = function (event) {
      var cursor = event.target.result;

      if (cursor) {
        console.log("Trying to find id " + restaurant_id + " and getting cursor for object store for id " + cursor.value.id + ": " + cursor.value);

        if (cursor.value.id == restaurant_id) {

          var newEntry = cursor.value;

          createTimeStamps(data);
          
          newEntry.reviews.push(data);

          //updates the value at the current position of the cursor in the object store
          var request = cursor.update(newEntry);

          request.onsuccess = function () {

            addNodeForReview(data);

            console.log("adding new review for this restaurant with id : " + restaurant_id);
          };
        };
        cursor.continue();
      }
    };
  };
}


 // Send data to the server upon connection

postCachedDataUponConnection();

function postCachedDataUponConnection() {
  
  var db;
  const request = indexedDB.open('restaurant-cachedIDB-v1', 1);

  request.onerror = function (event) {
    console.error("indexedDB error: ");
  };

  request.onupgradeneeded = function (event) {
    var db = event.target.result;
    var storeForFavorite = db.createObjectStore('restaurant-favorite-v1', {
      keyPath: "id",
      autoIncrement: true
    });
    var storeForReviews = db.createObjectStore('restaurant-review-v1', {
      keyPath: "id",
      autoIncrement: true
    });
  };

  request.onsuccess = function (event) {
    db = event.target.result;

    var tx = db.transaction('restaurant-review-v1', 'readwrite');
    var store = tx.objectStore('restaurant-review-v1');

    console.log("Get offline object from store for reviews with read write access to indexedDB");

    store.openCursor().onsuccess = function (event) {

      // store the result of opening the database in the db variable
      var cursor = event.target.result;

      if (!cursor) return;
        
        var url = 'http://localhost:1337/reviews/';

        var data = {};
          data.restaurant_id = cursor.value.restaurant_id;
          data.name = cursor.value.name;
          data.rating = cursor.value.rating;
          data.comments = cursor.value.comments;
        

        // fetch each review from idb and post it 
        postData(url, data).then(response => {
            console.log('delete entry for reviews with id ' + +cursor.value.id);

            var tx = db.transaction('restaurant-review-v1', 'readwrite');
            var store = tx.objectStore('restaurant-review-v1');

            // delete idb row
            var callForErase = store.delete(cursor.value.id);

            callForErase.onsuccess = function (event) {
              console.log('reviews entry deleted for this id: ' + +cursor.value.id);
            };
          })
          .catch(error => {
            console.log('Could not delete the reviews entry for this id ' + +cursor.value.id);
          });

        cursor.continue();
      
    };

    tx = db.transaction('restaurant-favorite-v1', 'readwrite');
    store = tx.objectStore('restaurant-favorite-v1');

    console.log("Get offline object from store for favorite with read write access to indexedDB");

    store.openCursor().onsuccess = function (event) {
      var cursor = event.target.result;

      if (!cursor)  return;
        

        fetch(cursor.value.url, {
            method: 'PUT',
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          })
          .then(res => res.json())
          .then(response => {
            console.log('Delete favorite entry for this id: ' + +cursor.value.id);

            var tx = db.transaction('restaurant-favorite-v1', 'readwrite');
            var store = tx.objectStore('restaurant-favorite-v1');

            // delete idb row
            var callForErase = store.delete(cursor.value.id);

            callForErase.onsuccess = function (event) {
            console.log('Favorite entry in idb is deleted for this id: ' + +cursor.value.id);
            };
          })
          .catch(error => {
            console.log('Could not delete favorite  entry for this id: ' + +cursor.value.id);
          });

        cursor.continue();
      
    };
  };
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = "Restaurant " + restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  //developer.mozilla.org/en-US/docs/Web/API/Element/classList
  var text = buttonToggleFavourite.firstChild;
  if (restaurant.is_favorite) {
    buttonToggleFavourite.classList.add("favorite");
    console.log("Setting favorite for restaurant");
    text.data = "Favorite";
  } else {
    console.log("Setting unfavorite for restaurant");
    buttonToggleFavourite.classList.add("unfavorite");
    text.data = "Unfavorite";
  }

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = (new Date(review.updatedAt)).toLocaleDateString("en-US");
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

