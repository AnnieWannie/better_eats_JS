var express = require('express');
var router = express.Router();

var { check, validationResult } = require("express-validator");

var Restaurant = require("../models/restaurant");
var User = require("../models/user");


router.get('/add', ensureAuthenticated, function(req, res) {
    res.render("add")
})

router.post('/add', ensureAuthenticated, async function(req, res) {
    await check("name", "Name is required").notEmpty().run(req);
    await check("country", "Country is required").notEmpty().run(req);
    await check("province", "Province is required").notEmpty().run(req);
    await check("city", "City is required").notEmpty().run(req);
    await check("rating", "Rating is required").notEmpty().run(req);
    const errors = validationResult(req);

    if (errors.isEmpty()){
        let restaurant = new Restaurant();
        restaurant.name = req.body.name;
        restaurant.country = req.body.country;
        restaurant.province = req.body.province;
        restaurant.city = req.body.city;
        restaurant.description = req.body.description;
        restaurant.rating = req.body.rating;
        restaurant.posted_by = req.user.id;
        restaurant.save(function (err) {
            if (err){
                console.log(err);
                return;
            } else {
                res.redirect("/");
            }
        })
    }else {
        res.render("add", {
            errors: errors.array()
        })
    }
})

router.get("/poprestaurants", ensureAuthenticated, function(req,res){
    res.render("poprestaurants")
        })

router.get("/:id", function(req,res){
    Restaurant.findById(req.params.id, function (err, restaurant){
        User.findById(restaurant.posted_by, function (err, user){
            if (err){
                console.log(err);
            }
            res.render("restaurant", {
                'restaurant': restaurant,
                'postCreator': user
            })
        })
    })
})

router.get("/edit/:id", ensureAuthenticated, function (req,res){
    Restaurant.findById(req.params.id, function (err, restaurant){
        if (restaurant.posted_by != req.user._id) {
            res.redirect("/");
        }
        res.render("edit", {
            "restaurant": restaurant
        })
    })
})

router.post("/edit/:id", ensureAuthenticated, function (req,res){
    let restaurant = {};

    restaurant.name = req.body.name;
    restaurant.country = req.body.country;
    restaurant.province = req.body.province;
    restaurant.city = req.body.city;
    restaurant.description = req.body.description;
    restaurant.rating = req.body.rating;

    let query = {_id: req.params.id}

    Restaurant.findById(req.params.id, function (err, database){
        if (database.posted_by != req.user._id){
            res.redirect("/")
        }else {
            Restaurant.updateOne(query, restaurant, function(err){
            if (err) {
                console.log(err);
                return;
            } else {
                res.redirect("/");
            }
        })
    }})
})


router.get("/delete/:id", ensureAuthenticated, function(req,res){
    Restaurant.findById(req.params.id, function (err, restaurant){
         if(err){
            console.log(err)
         } else if (req.user._id == restaurant.posted_by){
            console.log("req "+ req.user._id + "\n rest " + restaurant.posted_by)
            res.render("deletion", {
                'restaurant': restaurant
            })
         } else{
            res.redirect("/user/invalid")
         }
        })
})

router.post("/delete/:id", ensureAuthenticated, function(req,res){
    if (!req.user._id) {
        res.status(500).send();
      }
  
      let query = { _id: req.params.id };
  
      Restaurant.findById(req.params.id, function (err, restaurant) {
        if (restaurant.posted_by != req.user._id) {
          res.status(500).send();
        } else {

          Restaurant.deleteOne(query, function (err) {
            if (err) {
              console.log(err);
            }
            res.redirect("/");
          });
        }
      });
    });

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/users/invalid");
    }
  }

module.exports = router;