//jshint esversion:6
require("dotenv").config();
//Needs to be called as early as possible in the file because if you make a environment variable and it's not configured, it won't work
//Do 'touch .env' inside the terminal. It is a hidden file.
const mongoose = require("mongoose");
const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

//Don't need to require passport-local

const app = express();

//Allows EJS to look inside the views folder
app.set("view engine", "ejs");

//Commands that allow us to use body-parser and EJS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Express-Session middleware
// Express session code must be entered here:
app.use(
  session({
    secret: "This is the secret.",
    resave: false,
    // Better for login sessions and reducing server storage usage to set saveUnintialized to false
    saveUninitialized: false,
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

//Connect to Mongoose
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
  useNewUrlParser: true,
});

// // Create strategy to authenticate users and also serialise/de-serialise users
// // Serialise places the user and their ID into the cookie that is sent
// passport.use(User.createStrategy());

// // Serialize and Deserialize user
// passport.serializeUser(function (user, cb) {
//   cb(null, user);
// });

// passport.deserializeUser(function (id, cb) {
//   User.findById(id)
//     .then(function (user) {
//       cb(null, user);
//     })
//     .catch(function (err) {
//       cb(err, null);
//     });
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       //   clientID: process.env.CLIENT_ID,
//       //   clientSecret: process.env.CLIENT_SECRET,
//       //   callbackURL: "http://localhost:3000/auth/google/secrets",
//       //   userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
//     },
//     function (accessToken, refreshToken, profile, cb) {
//       console.log(profile);
//       // findOrCreate is not an actual function. It is psuedo code.
//       // We will have to install a npm package called findOrCreate and the code below will work
//       User.findOrCreate({ googleId: profile.id }, function (err, user) {
//         return cb(err, user);
//       });
//     }
//   )
// );

// ===========================================================================================================================

// SCHEMA AND MODEL

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String,
});

// Will hash/salt passwords and will save users into our MongoDB database
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

// GET AND POST

app.get("/index", function (req, res) {
  res.render("index");
});

app.get("/GamePage", function (req, res) {
  res.render("GamePage");
});

app.get("/Playlist", function (req, res) {
  res.render("Playlist");
});

app.get("/NewReleases", function (req, res) {
  res.render("NewReleases");
});

app.get("/GamesByTag", function (req, res) {
  res.render("GamesByTag");
});

app.get("/Retro", function (req, res) {
  res.render("Retro");
});

// LOGIN AND REGISTER

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    req.login(user, function (error) {
      if (error) {
        console.log(error.message);
        return res.redirect("/register");
      }
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/register");
  }
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async (req, res) => {});

// LOGIN WITH GOOGLE AND TWITTER

// Google
app.get("/auth/google", function (req, res) {
    // Scope tells google what we want and in this case we just want the user's profile
    // The authenticate middleware needs access to the req and res objects in order to handle the authentication flow
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
  });
  
  // This get request is made by google when it tries to redirect the user back to our website
  app.get(
    "/auth/google/profile",
    passport.authenticate("google", { failureRedirect: "/Error" }),
    function (req, res) {
      // Successful authentication, redirect to secrets page or any other desired page
      res.redirect("/Profile");
    }
  );

// Twitter


// LISTEN

app.listen(3000, function () {
  console.log("Server is now running on port 3000");
});
