var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
});

module.exports = mongoose.model("Feedback", feedbackSchema);