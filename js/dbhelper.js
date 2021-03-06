/**
 * Common database helper functions.
 */

class DBHelper {
  /**
   * Database URL.
   */
  static get DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch restaurants using Fetch API
   */
  static fetchRestaurants(callback, id){
    let fetchURL
    if (id){
      fetchURL = DBHelper.DATABASE_URL + "/" + id;
    }else{
      fetchURL = DBHelper.DATABASE_URL;
    }

    // trying to first fetch from the indexed db
    let restoPromise;
    if (id){
      restoPromise = IDBHelper.getFromDBbyID(id);
    }else{
      restoPromise = IDBHelper.getFromDB();
    }
    
    restoPromise.then(restaurants => {
      // checking if the database has any restaurant element
      if (typeof restaurants != "undefined" && restaurants.length > 9) {
        console.log('Data fetched from Indexed DB')
        callback(null, restaurants);
      }else if(typeof restaurants != "undefined" && typeof restaurants.length === "undefined" && id) {
        console.log('Data fetched from Indexed DB')
        callback(null, restaurants);
      }
      else{
        console.log('Not present in the indexed db, storing it on indexed db');
        fetch(fetchURL).then(response => {response.json().then(restaurants => {
          IDBHelper.insertToDB(restaurants).then(() => {
            console.log('Value successfully inserted into IDB');
          }).catch(error => {
            console.log(`Something went wrong when inserting to the IDB: ${error}`);
          });
          callback(null, restaurants);
        });
        }).catch(error => {
          callback(`Unable to fetch with ${error}`, null);
        });
      }
      
    }).catch(error => {
      console.log(`Some error occurred: ${error}`);
    })
  }

  /**
   * Fetch all restaurants.
   */
  /*
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }
*/
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants;
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    }, id);
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(restaurants_list, callback) {
    if(restaurants_list){
      const neighborhoods = restaurants_list.map((v, i) => restaurants_list[i].neighborhood)
      // Remove duplicates from neighborhoods
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
      callback(null, uniqueNeighborhoods);
    }else{
      // Fetch all restaurants
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Get all neighborhoods from all restaurants
          const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
          // Remove duplicates from neighborhoods
          const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
          callback(null, uniqueNeighborhoods);
        }
      });
    }
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(restaurants_list, callback) {
    if (restaurants_list){
      // Get all cuisines from all restaurants
      const cuisines = restaurants_list.map((v, i) => restaurants_list[i].cuisine_type)
      // Remove duplicates from cuisines
      const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
      callback(null, uniqueCuisines);
    }else{
      // Fetch all restaurants
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Get all cuisines from all restaurants
          const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
          // Remove duplicates from cuisines
          const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
          callback(null, uniqueCuisines);
        }
      });
    }
    
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph){
      return (`/img/${restaurant.photograph}`);
    }
    return (`/img/${restaurant.id}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /******* Add Review Section  ********/

  static saveReview(id, name, rating, comment, callback) {
    // stop clicks on the submit button until callback
    const btn = document.getElementById("btnSaveReview");
    btn.onclick = null;

    // generating the post body as per the documentation
    const body = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: comment
    }

    // storing the request call first to pending request flow before making the network call
    IDBHelper.insertToPendingList('http://localhost:1337/reviews', 'POST', body, callback);
  }
}