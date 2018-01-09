var express               = require("express"),
    mongoose              = require("mongoose"),
    User                  = require("./models/user"),
    Discussion            = require("./models/discussion"),
    Comment               = require("./models/comment"),
    Feedback              = require("./models/feedback"),
    bodyParser            = require("body-parser"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    app                   = express(),
    methodOverride        = require("method-override");

mongoose.connect("mongodb://localhost/sr_portal_test2");

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));


// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Sample secret dialog",
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});


// =====================================================================================
// AUTH
// login
app.get("/login", function(req, res) {
    res.render("login");
});
// login logic
app.post("/login",passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login"
}), function(req, res){
});
// logout
// LOGOUT Route
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login")
})
// =======================================================================================

// ROUTES
app.get("/", function(req, res){
    res.redirect("/home");
});
app.get("/home", function(req, res){
    res.render("home");
});
app.get("/contact", function(req, res){
    res.render("contact");
});
app.get("/downloads", isLoggedIn, function(req, res){
    res.render("downloads");
});
// =======================================================================================
// DISCUSSION
//INDEX
app.get("/discussions", isLoggedIn, function(req, res){
    Discussion.find({}, function(err, allDiscussions){
        if(err){
            console.log(err);
        } else {
            res.render("discussions/index", {discussions: allDiscussions, currentUser: req.user});
        }
    });
});

//CREATE
app.post("/discussions", isLoggedIn, function(req, res){
    var name = req.body.name;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newDiscussion = {name: name, description: description, author:author};
    Discussion.create(newDiscussion, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/discussions");
        }
    });
});

//NEW


//SHOW
app.get("/discussions-:id", isLoggedIn, function(req, res) {
    Discussion.findById(req.params.id).populate("comments").exec(function(err, foundDiscussion){
        if(err){
            console.log(err)
        } else {
            res.render("discussions/show", {discussion: foundDiscussion});
        }
    });
});


// UPDATE
app.put("/discussions/:id", checkOwnership, function(req, res){
    Discussion.findByIdAndUpdate(req.params.id, req.body.discussion, function(err, updatedDiscussion){
        if(err){
            res.redirect("/discussions");
        } else {
            res.redirect("/discussions-"+ req.params.id);
        }
    })
})
// DESTROY
app.delete("/discussions/:id", checkOwnership, function(req, res){
    Discussion.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/discussions");
        } else {
            res.redirect("/discussions");
        }
    })
});

// ========================================================================================
// COMMENTS ROUTES

app.post("/discussions/:id/comments", isLoggedIn, function(req, res){
    Discussion.findById(req.params.id, function(err, discussion) {
        if(err){
            console.log(err);
            res.redirect("/discussions");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    comment.author.id =req.user._id;
                    comment.author.username =req.user.username;
                    comment.save();
                    discussion.comments.push(comment);
                    discussion.save();
                    res.redirect("/discussions-" + discussion._id);
                }
            });
        }
    })
});

// =======================================================================================
// =======================================================================================
//DOWNLOAD LINKS
app.get('/download_MATLAB', isLoggedIn, function(req, res){
  var file = __dirname + '/upload-folder/example.zip';
  res.download(file); // Set disposition and send it.
});
// =======================================================================================

// FEEDBACK
app.post("/feedback", function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var message = req.body.message;
    var newFeedback = {name: name, email: email, message: message};
    Feedback.create(newFeedback, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/contact")
        }
    });
});



function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function checkOwnership(req, res, next){
    if(req.isAuthenticated()){
        Discussion.findById(req.params.id, function(err, foundDiscussion) {
            if(err){
                res.redirect("back");
            } else {
                if(foundDiscussion.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back")
    }
}


app.listen(3000, function(){
    console.log("Server Started");
});