const objectStore = "resto-review";
const objectStore2 = "review-addition"
const objectStore3 = "pending-reviews"

class IDBHelper {
    // method to open an IDB and return the promise for the same
    static openDB() {
        const dbPromise = idb.open('resto-review-db', 3, upgradeDb => {
            switch(upgradeDb.oldVersion) {
              case 0:
                upgradeDb.createObjectStore(objectStore, { keyPath: "id"});
              case 1:
                upgradeDb.createObjectStore(objectStore2, { autoIncrement : true });
              case 3:
                upgradeDb.createObjectStore(objectStore3, { autoIncrement : true });
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

    // inserting the review data into the review db
    static insertToReviewDB(values) {
        // opening the indexed db
        return IDBHelper.openDB().then(db => {
            let tx = db.transaction(objectStore2, 'readwrite');
            let reviewStore = tx.objectStore(objectStore2);

            // caching the values to the indexed DB
            reviewStore.put(values);

            // returning the promise for insertion
            return tx.complete;
        });
    }
    
    // temoprarily storing the pending request list
    static insertToPendingList(url, method, body) {
        return IDBHelper.openDB().then(db => {
            let tx = db.transaction(objectStore3, 'readwrite');
            let pendingStore = tx.objectStore(objectStore3);

            pendingStore.put({
                data : {
                    url,
                    method,
                    body
                }
            }).then(() => {
                console.log('successfully added to the pending db');
                IDBHelper.nextPending();
            }).catch(error => {
                console.log('Some error occurred: ', error);
            });
        })
    }

    static nextPending() {
        IDBHelper.commitPending(IDBHelper.nextPending);
    }

    static commitPending(callback) {
        IDBHelper.openDB().then(db => {
            let tx = db.transaction(objectStore3, 'readwrite');
            let pendingStore = tx.objectStore(objectStore3).openCursor();
            
            let url;
            let method;
            let body;

            pendingStore.then(cursor => {
                if(!cursor) {
                    return;
                }

                url = cursor.value.data.url;
                method = cursor.value.data.method;
                body = cursor.value.data.body;
                
                // the database has invalid content and needs to be removed
                if ((!url || !method) || (method === "POST" && !body)) {
                    cursor.delete().then(() => {
                        callback();
                    });
                    return;
                };

                const data = {
                    body: JSON.stringify(body),
                    method: method
                }

                console.log('data that would be posted: ',data);

                fetch(url, data).then(response => {
                    console.log('received the following response: ',response);
                    if (!response.ok && !response.redirected){
                        return;
                    }
                    console.log('Successfully sent request to ', url, ' and received back ', response);
                }).then(() => {
                    const deleteStoreTx = db.transaction(objectStore3, 'readwrite');
                    const deleteStore = deleteStoreTx.objectStore(objectStore3).openCursor();

                    deleteStore.then(cursor => {
                        cursor.delete().then(() => {
                            console.log("Deleting the pending data from queue");
                            console.log("calling the callback function")
                            callback();
                        });
                    })
                    
                })
            }).catch(error => {
                console.log("Some error occurred getting cursor for pending db: ",error);
                return;
            })

            

        })
    }
}