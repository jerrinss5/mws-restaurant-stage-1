const objectStore = "resto-review";

class IDBHelper {
    // method to open an IDB and return the promise for the same
    static openDB() {
        const dbPromise = idb.open('resto-review-db', 1, function(upgradeDb) {
            switch(upgradeDb.oldVersion) {
              case 0:
                upgradeDb.createObjectStore(objectStore, { keyPath: "id"});
            }
        });
        return dbPromise;
    }

    // method to fetch everything from IDB
    static getFromDB() {
    
        return IDBHelper.openDB().then(db => {
            let tx = db.transaction(objectStore);
            let restoStore = tx.objectStore(objectStore);
            return restoStore.getAll();
        })
    }

    // method to fetch restaurants from IDB by id
    static getFromDBbyID(id){
        return IDBHelper.openDB().then(db => {
            let tx = db.transaction(objectStore);
            let restoStore = tx.objectStore(objectStore);
            // converting the string to number
            return restoStore.get(Number(id));
        })
    }

    // insert the data into the indexed db after making a network fetch call
    static insertToDB(values) {
        const dbPromise = IDBHelper.openDB();

        dbPromise.then(db => {
            let tx = db.transaction(objectStore, 'readwrite');
            let restoStore = tx.objectStore(objectStore);

            if (typeof values.length === "undefined") {
                // just a single value so no need to loop over
                restoStore.put(values);
            }else{
                // looping over the values to insert it to the db
                values.forEach(value => {
                    restoStore.put(value);
                });
            }
            

            return tx.complete;
        });

        return dbPromise;
    }
}