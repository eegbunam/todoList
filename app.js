//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');

//conect to db
// mongoose.connect("mongodb://localhost:27017/todolistDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
const uri = "mongodb+srv://admin-ebuka:pk5dbHpGwjkOVUkQ@cluster0-emao3.mongodb.net/todolistDB";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})



//create schema

const itemsSchema = {
  name: String
}

//create model based on schema
const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your todolist"
})

const item2 = new Item({
  name: "Hit the + button to add a new item"
})

const item3 = new Item({
  name: "eat Food"
})

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)



const defaultItems = [item1, item2, item3]

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));



app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find({}, function(err, result) {
    if (err) {
      console.log("error finding ");
    } else {

      if (result === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log("coundlnt insert items ");
          } else {
            console.log("items inserted sucessfy");
          }
        })
      }
      res.render("list", {
        listTitle: day,
        newListItems: result
      });
    }
  })



});

app.post("/", function(req, res) {

  const itemName = req.body.newItem
  const listName = req.body.list
  const newItem = Item({
    name: itemName
  })

  if (listName === date.getDate()) {
    newItem.save()
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, result) {
      result.items.push(newItem)
      result.save()
      res.redirect("/" + listName)
    })
  }



});

app.post("/delete", function(req, res) {
  let id = req.body.checkbox
  let listName = req.body.listName

  if (listName === date.getDate()) {
    Item.findByIdAndRemove(id, function(err) {
      if (err) {
        console.log("there was an error deleting");
      }
    })
    res.redirect("/")
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: { items: {_id: id}}},
      function(err, results) {
        if (!err) {
          res.redirect("/" + listName)
        }
      })
  }

})

app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName)

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (err) {
      console.log("there was an error");
    } else {
      if (!foundList) {
        //create new list
        const newList = new List({
          name: customListName,
          items: defaultItems
        })
        newList.save()
        res.redirect("/" + customListName);
      } else {
        //show exsisting list
        console.log("exists");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });

      }
    }
  })

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");

