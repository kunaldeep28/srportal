var mongoose = require("mongoose");
var discussionSchema = new mongoose.Schema({
    name: String,
    description: String,
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ],
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Discussion", discussionSchema);