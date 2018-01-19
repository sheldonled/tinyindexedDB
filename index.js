(function(window) {
  'use strict';

  const tinyIndexedDB = function (dbName, dbVersion, mainStoreName) {
    this.indexedDB = (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB);
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.mainStoreName = mainStoreName;

    const openDB = (storeName) => {
      const req = this.indexedDB.open(dbName, dbVersion);
      return new Promise((resolve, reject) => {
        req.onerror = event => reject(event);
        req.onsuccess = event => resolve(event.target.result);
        req.onupgradeneeded = event => {
          const db = event.target.result;
          const objectStore = db.createObjectStore(this.mainStoreName, { keyPath: "id" });
          objectStore.createIndex("id", "id", {unique:false});
          resolve(db);
        };
      });
    };

    const getByID = (id, storeName) => {
      return openDB(storeName).then(db => {
        const transaction = db.transaction(storeName),
              objectStore = transaction.objectStore(storeName),
              reqCursor = objectStore.get(id);
        let result;
        return new Promise((resolve, reject) => {
          reqCursor.onsuccess = event => result = event.target.result;
          reqCursor.onerror = event => reject(event);
          transaction.oncomplete = event => resolve(result);
          db.close();
        });
      });
    };
    
    const getByName = (itemName, storeName) => this.getAllItems(storeName).then(items => items.filter(item => item.name === itemName));

    const getLastId = storeName => this.getAllItems(storeName).then(items => items.reduce((lastId,item) => Math.max(item.id, lastId), 0));

    
    this.getAllItems = storeName => {
      storeName = storeName || this.mainStoreName;
      return openDB(storeName).then(db => {
        const items = [],
              transaction = db.transaction(storeName),
              objectStore = transaction.objectStore(storeName),
              reqCursor = objectStore.openCursor();
        return new Promise((resolve, reject) => {
          reqCursor.onsuccess = event => {
            if (!event.target.result) {
              return;
            }
            items.push(event.target.result.value);
            event.target.result.continue();
          };
          reqCursor.onerror = event => reject(event);
          transaction.oncomplete = event => resolve(items);
          db.close();
        });
      });
    };

    this.get = function (id, name, storeName) {
      storeName = storeName || this.mainStoreName;
      if(id){
        return getByID(id, storeName).then(item => item);
      }
      return getByName(name, storeName).then(items => items);
    };


    this.set = (item, storeName) => {
      storeName = storeName || this.mainStoreName;

      return Promise.all([
        getLastId(storeName), 
        openDB(storeName)
      ]).then(values => {
        const newId      = values[0]+1,
              db          = values[1],
              transaction = db.transaction([storeName], "readwrite"),
              objectStore = transaction.objectStore(storeName);
              
        if (!item.created) item.created = Date.now();
        item.modified = Date.now();
        if(!item.id) item.id = newId;
          
        const request = objectStore.put(item);
        return new Promise((resolve, reject) => {
          request.onerror = event => reject(event);
          request.onsuccess = event => resolve(event);
        });
      })
    };
    
    this.delete = (id, name, storeName) => {
      storeName = storeName || this.mainStoreName;

      return Promise.all([
        this.get(id, name, storeName), 
        openDB(storeName)
      ]).then(values => {
        const item   = values[0],
              db     = values[1];
        
        return new Promise((resolve, reject) => {
          if(!item) reject(false);

          const deletedID = (item.length) ? item[0].id : item.id;
          if (!deletedID) reject(false);
          const request = db.transaction([storeName], "readwrite").objectStore(storeName).delete(deletedID);
          request.onerror = event => reject(event);
          request.onsuccess = event => resolve(event);
        });
      });
    };

    //Opening/Closing check
    openDB(this.mainStoreName).then(db => db.close());
  };

  window.tinyIndexedDB = tinyIndexedDB;

})(this);
