class DBHelper{static get DATABASE_URL(){return"http://localhost:8000/data/restaurants.json"}static fetchRestaurants(t){fetch("http://localhost:1337/restaurants").then(function(t){return t.json()}).then(function(e){t(null,e)}).catch(function(e){t(e,null)})}static fetchRestaurantById(t,e){DBHelper.fetchRestaurants((n,a)=>{if(n)e(n,null);else{const n=a.find(e=>e.id==t);n?e(null,n):e("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(t,e){DBHelper.fetchRestaurants((n,a)=>{if(n)e(n,null);else{const n=a.filter(e=>e.cuisine_type==t);e(null,n)}})}static fetchRestaurantByNeighborhood(t,e){DBHelper.fetchRestaurants((n,a)=>{if(n)e(n,null);else{const n=a.filter(e=>e.neighborhood==t);e(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(t,e,n){DBHelper.fetchRestaurants((a,l)=>{if(a)n(a,null);else{let a=l;"all"!=t&&(a=a.filter(e=>e.cuisine_type==t)),"all"!=e&&(a=a.filter(t=>t.neighborhood==e)),n(null,a)}})}static fetchNeighborhoods(t){DBHelper.fetchRestaurants((e,n)=>{if(e)t(e,null);else{const e=n.map((t,e)=>n[e].neighborhood),a=e.filter((t,n)=>e.indexOf(t)==n);t(null,a)}})}static fetchCuisines(t){DBHelper.fetchRestaurants((e,n)=>{if(e)t(e,null);else{const e=n.map((t,e)=>n[e].cuisine_type),a=e.filter((t,n)=>e.indexOf(t)==n);t(null,a)}})}static urlForRestaurant(t){return`./restaurant.html?id=${t.id}`}static imageUrlForRestaurant(t){return t.photograph||(t.photograph=10),`/dist/${t.photograph}.webp`}static mapMarkerForRestaurant(t,e){return new google.maps.Marker({position:t.latlng,title:t.name,url:DBHelper.urlForRestaurant(t),map:e,animation:google.maps.Animation.DROP})}}