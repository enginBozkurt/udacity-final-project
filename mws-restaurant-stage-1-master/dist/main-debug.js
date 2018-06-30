let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  updateRestaurants();
  fetchNeighborhoods();
  fetchCuisines();
  startIntersectionObserver();

//the viewport is at least 769 pixels wide
  const mql = window.matchMedia( "(min-width: 769px)" );
  if (mql.matches) {
    console.log('Minimum width is 769px so map will be shown');
    addMapToApp();
  }
});

function addMapToApp() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyCkztJBGXVEEZPAtlOkFhUT1CrKSi1WJg4&libraries=places&callback=initMap';
  script.defer = true;
  script.async = true;
  console.log('Adding Google Map JavaScript file: ' + script);
  document.getElementById('map').style.display = 'block';
  document.getElementById('toggle-map').style.display = 'none';
  document.getElementsByTagName('head')[0].appendChild(script);
}

/**
 * Intersection Observer API
 * https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */
startIntersectionObserver = () => {
  console.log('Starting intersection observer');

  // TODO: implement intersection observer
 }

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { 
      console.error(error);
    } else {
      addMarkersToMap(restaurants);
    }
  })
}


//Update page and map for current restaurants

updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { 
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

// Image lazy loading

// Attach observer for image lazy loading
lazyLoadingObserver = () => {
	const restaurantImages = document.querySelectorAll('.restaurant-img');
	const observerConfig = {
		rootMargin: '50px 0px',
		threshold: 0.01
	};
	observer = new IntersectionObserver(onIntersection, observerConfig);
	restaurantImages.forEach( image => observer.observe(image));
};

// Lazy load images once rest of the page has fully loaded
function onIntersection(entries) {

	entries.forEach(entry => {
	  	if (entry.intersectionRatio > 0) {

			observer.unobserve(entry.target);

			if(entry.target.getAttribute('data-src')) {
				entry.target.setAttribute('src', entry.target.getAttribute('data-src'));
			}
		}
	});
  }

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  if (self.map) {
    addMarkersToMap(restaurants);
    lazyLoadingObserver();
  }
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('div');

  if(li) {
    li.className += (li.className ? ' col-large' : 'col-large') + " restaurant-card";
  }

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name + " Restaurant";
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
// addMarkersToMap = (restaurants = self.restaurants) => {
addMarkersToMap = (restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
