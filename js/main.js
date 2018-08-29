let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.fetchRestaurants((error, restaurants_list) => {
    fetchNeighborhoods(restaurants_list);
    fetchCuisines(restaurants_list);
  });
  
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = (restaurants_list) => {
  DBHelper.fetchNeighborhoods(restaurants_list, (error, neighborhoods) => {
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
fetchCuisines = (restaurants_list) => {
  DBHelper.fetchCuisines(restaurants_list, (error, cuisines) => {
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
  // ref for role: https://stackoverflow.com/questions/50503677/proper-use-of-aria-role-for-google-maps
  const map_attr = document.getElementById('map');
  map_attr.setAttribute("role", "application");
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
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
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  // getting the image from the database
  const img = DBHelper.imageUrlForRestaurant(restaurant);

  // spitting the image on the .
  img_split = img.split('.')

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  //image.src = DBHelper.imageUrlForRestaurant(restaurant);
  // setting the smallest and default image size for the application as larger image size is not needed
  image.src = img_split[0] + "-320-small.jpg"
  image.alt = "An image of "+restaurant.name+" in "+restaurant.neighborhood
  li.append(image)

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  // converting the fav value from string to boolean
  const isFav = (restaurant["is_favorite"] && restaurant["is_favorite"].toString() === "true") ? true : false;
  const favoriteDiv = document.createElement("div");
  favoriteDiv.className = "favorite-icon";
  const favorite = document.createElement("button");

  // depending of the fav value load the respective image
  favorite.style.background = isFav?
  `url("/icons/like-2.svg") no-repeat`
  :`url("/icons/like-1.svg") no-repeat`;

  favorite.innerHTML = isFav?
  `${restaurant.name} is a favorite`
  :`${restaurant.name} is not a favorite`;

  favorite.id = "favorite-icon-" + restaurant.id;
  favorite.onclick = event => favoriteClickHandler(restaurant.id, !isFav);
  favoriteDiv.append(favorite);
  li.append(favoriteDiv);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  // setting the attribute to indicate this being a button rather than a link href
  more.setAttribute("role", "button");
  more.setAttribute("tabindex", "0");
  more.setAttribute("aria-pressed", "false");
  more.setAttribute("aria-label", restaurant.name);
  li.append(more)

  return li
}

/**
 * Function to handle the favorite button click
 */
const favoriteClickHandler = (id, newState) => {
  // checking if the values belong to the current list of resto
  const restaurant = self
    .restaurants
    .filter(r => r.id === id)[0];
  if (!restaurant)
    return;
  // making call to the IDB Helper file to persist the click info
  IDBHelper.updateFavClick(id, newState);
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
