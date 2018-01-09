var express 			  = require("express"),
	mongoose			  = require("mongoose"),
	User                  = require("./models/user"),
	bodyParser			  = require("body-parser"),
	passport              = require("passport"),
	LocalStrategy         = require("passport-local"),
    Feedback              = require("./models/feedback"),
    passportLocalMongoose = require("passport-local-mongoose"),
	app 				  = express();

mongoose.connect("mongodb://localhost/sr_portal_test2");

app.set("view engine", "ejs");
app.use(express.static("public"));
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

app.get("/", function(req, res) {
    res.redirect("/register")
})
// Feedbacks
app.get("/feedbacks", function(req, res){
    Feedback.find({}, function(err, feedbacks){
        if(err){
            console.log(err);
        } else {
            res.render("feedbacks", {feedbacks: feedbacks});
        }
    });
})

// show signup form
app.get("/register", function(req, res) {
    res.render("register");
})
// User sign UP handling
app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/");
            console.log("registration successfull");
        });
    });
});

app.listen(3000, function(){
	console.log("Server Started");
});