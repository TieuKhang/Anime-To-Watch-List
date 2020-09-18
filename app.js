// package to code node js in an easier way
const express = require("express");

// package that works with database
const mongoose = require("mongoose");

// package that allows parsing info sent from the post request
const bodyParser = require("body-parser");

// initialize app
const app = express();

// initialize parsing info sent from the post request
app.use(bodyParser.urlencoded({ extended: true }));

// connect to database
mongoose.connect("mongodb+srv://admin-tieukhang:Tieukhang3004@animecluster.9i43a.mongodb.net/listitem", { useNewUrlParser: true });

// connect to ejs
app.set('view engine', 'ejs');

// initialize Schema
const animeList = new mongoose.Schema({
    name: String
});

// initialize Model
const animeModel = mongoose.model("animeList", animeList);

// 1st default data
const intro = new animeModel({
    name:'Welcome to my webpage'
});

// 2nd default data
const outro = new animeModel({
    name: 'Delete any message'
});

// array consist of default data
const defaultList = [intro, outro];

// get request
app.get("/", function (req, res) {
    // read data of database
    animeModel.find({}, function (err, defaultAnime) {
        // check length of array to know if adding default data is necessary
        if (defaultAnime.length == 0) {
            animeModel.insertMany(defaultList, function (err) {
                if (!err) {
                    console.log("Successfully add data!"); 
                }
            })
            res.redirect("/");
        }
        else {
            // render ejs file
            res.render("list", {listName:"up-to-date" , listItem: defaultAnime });
        }
        console.log(defaultAnime);
    });
});

//create a custom anime schema
const customAnimeSchema = new mongoose.Schema({
    customName: String,
    customAnimeList: [animeList]
});

//create a custom anime model
const customAnimeModel = mongoose.model("customAnimeModel", customAnimeSchema);

//render a custom anime list on a custom page
app.get("/:customList", function (req, res) {
    const customList = req.params.customList;
    // check if the custom list has already existed
    customAnimeModel.findOne({ customName: customList }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const defaultCustomAnime = new customAnimeModel({
                    customName: customList ,
                    customAnimeList: defaultList
                });
                defaultCustomAnime.save();
                res.redirect("/" + customList);
            }
            else {
                res.render("list", { listName: foundList.customName  , listItem: foundList.customAnimeList });
            }
        }
    });
});

console.log(customAnimeModel);

// add item to list
app.post("/", function (req, res) {
    // data from post request
    const addAnime = req.body.addingItem; // new item being added
    const trackList = req.body.trackCurrentList; // name of the current list
    // create new data
    const newAnime = new animeModel({
        name: addAnime
    });
    // check which List to add item to
    if (trackList === "up-to-date") {
        // save new data to default lsit
        newAnime.save();
        res.redirect("/");
    }
    else {
        // add new item to custom list
        customAnimeModel.findOne({ customName: trackList }, function (err, foundList) {
                foundList.customAnimeList.push(newAnime);
                foundList.save();
                res.redirect("/" + trackList);
        })
    }
});

//delete item by post method
app.post("/delete", function (req, res) {
    // checkbox ID
    const deleteItem = req.body.checkbox;
    // current custom List
    const customDelete = req.body.customCheckbox;
    if (customDelete === "up-to-date") {
        // delete item from custom lsit
        animeModel.findByIdAndRemove(deleteItem, function (err) {
            if (!err) {
                console.log("succesfully delete item!");
                res.redirect("/");
            }
        });
    }
    else {
        //delete item from custom list
        customAnimeModel.findOneAndUpdate({ customName: customDelete }, { $pull: { customAnimeList: { _id: deleteItem } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + customDelete);
            }
        });
    }
});
console.log(animeModel);

app.listen(process.env.PORT || 3000, function () {
    console.log("Server is runnning on port 3000!");
});

