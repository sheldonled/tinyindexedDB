# tinyIndexedDB
A lib built to learn IndexedDB. Promise based. Very opinionated and not ready for production ;)

It's built to be small, still work in progress, not sure what this will be used for.
## Demo:
I built this [pen on Codepen](https://codepen.io/sheldonled/pen/zpmjXJ) to test this thing out =)

## Example of usage

Right now the lib is built to be exported to the window object:
### Init and add something
```
//db name, db version, main store name (like a table in Relational DB)
myDB: new tinyIndexedDB("myLocalDB", 1, "myMainStoreName");

//meant to be used as add and update (should rely on an ID or other key attribute)
myDB.set({
  name: "An amazin name",
  attr: "An amazing attribute"
})
.then(r => //console.log the r)
.catch(e => //console.log the e);
```
### Retrieve something

Get the item by ID, ideally make this more flexible with the name param)

Again not passing the storeName param will go to the main store name
```
myDB.get(id,name,storeName)

//Get all items in a store or in the main store if you don't pass the param
myDB.getAllItems()
.then(items => items.forEach(item => console.log(item)))
.catch(e => console.log(e));
```
### Deleting something

Same idea of deleting, and same problem (shouldn't rely on the name but generic attribute)
```
myDB.delete(id, name, storeName)
```


TODO
- [ ] Make it for more general use
- [ ] learn from existent libraries
