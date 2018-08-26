let restaurant;
let map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
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

  // getting the image from the database
  const img = DBHelper.imageUrlForRestaurant(restaurant);

  // creating the picture element to load images responsively
  const pic = document.getElementById('restaurant-picture')
  let src

  // handling images for view port width of 1025px and above
   src = document.createElement('source')
   src.media = '(min-width: 1025px)'
   src.srcset = `${img}-1600-2x.jpg`
   pic.append(src)

  // handling images for view port width of 641px and above
  src = document.createElement('source')
  src.media = '(min-width: 641px)'
  src.srcset = `${img}-1024-1x.jpg`
  pic.append(src)

  // handling images for view port width of 321px and above
  src = document.createElement('source')
  src.media = '(min-width: 321px)'
  src.srcset = `${img}-640-med.jpg`
  pic.append(src)
  
  // const image = document.getElementById('restaurant-img');
  const image = document.createElement('img')
  image.id = 'restaurant-img'
  // image.src = DBHelper.imageUrlForRestaurant(restaurant);
  // setting the smallest and default image size for the application
  image.src = `${img}-320-small.jpg`
  //image.alt = "An image of "+restaurant.name+" in "+restaurant.neighborhood
  image.alt = `An image of ${restaurant.name} in ${restaurant.neighborhood}`
  pic.append(image)

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

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
  date.innerHTML = review.date;
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
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  // li.innerHTML = restaurant.name;
  var a = document.createElement("a");
  a.setAttribute('href', "/restaurant.html?id="+restaurant.id);
  a.textContent= restaurant.name;
  li.appendChild(a);
  li.setAttribute("aria-current", "page");
  // li.setAttribute("aria-labelledby", restaurant.name);
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

const saveReview = () => {
  // fetching the name from the html element
  const name = document.getElementById("reviewerName").value;
  // negating it with 0 to convert to number
  const rating = document.getElementById("reviewRating").value - 0;
  // fetching the comment from the html element
  const comment = document.getElementById("reviewComment").value;

  console.log("Adding review by: ", name);

  DBHelper.saveReview(self.restaurant.id, name, rating, comment, (error, review) => {
    if(review){
      console.log("Received the review callback", review);
    }
    
    if (error) {
      console.log("Error saving review: ", error);
    }
    // Update the button onclick event to avoid resubmitting it in quick successions
    const btn = document.getElementById("btnSaveReview");
    btn.onclick = event => saveReview();

    // redirecting back to the same page to refresh the page
    window.location.href = "/restaurant.html?id=" + self.restaurant.id;
  });
}
