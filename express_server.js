const express = require("express");
const bcrypt = require('bcrypt');
const getUserByEmail = require('./helpers.js');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

//Makes the request body data human readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Uses cookies that expire after the browser is closed
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


//Sets ejs as the view engine
app.set("view engine", "ejs");



//used to create a random shortURL id
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

//Adds new user object to users databse with a random ID
const addNewUser = function(users, email, password) {
  const userId = generateRandomString();
  const newUser = {
    id: userId,
    email,
    password
  };
  users[userId] = newUser;
  return userId;
};

const urlDatabase = {
  '9sm5xK': { longURL: "http://www.google.com", userID: "aJ48lW"  },
  '32xVn2': { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" }
};

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "alisonhussey@gmail.com",
    password: "asd"
  }
};

//encrypts passwords in users database
for (let userId in users) {
  users[userId].password = bcrypt.hashSync(users[userId].password, 10);
}

//a JSON string representing the entire urlDatabase object.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//returns urls saved for a given user
const urlsForUser = function(id) {
  const urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};

//sends data to /urls
app.get("/urls", (req, res) => {
  const user = users[req.session['user_id']];
  if (user) {
    const urls = urlsForUser(user.id);
    const templateVars = { user: users[req.session['user_id']], urls: urls };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Adds a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session['user_id']] };
  const user = users[req.session['user_id']];
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Renders information about a single URL.
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //shortURL: key of longURL inside the urlDatabase
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[req.session['user_id']];
  if (user) {
    const urls = urlsForUser(user.id);
    const templateVars = { user: users[req.session['user_id']], shortURL, longURL, urls};
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

//a POST Route to Receive the Form Submission for a url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session['user_id']};
  res.redirect(`/urls/${shortURL}`);
});

//Redirects any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
});

//Deletes a URL if user is logged in, otherwise sends an error
app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  const user = users[req.session['user_id']];
  if (user) {
    delete urlDatabase[key];
    res.redirect("/urls");
  } else {
    res.status(403).send("You must login to do this");
    res.redirect("/login");
  }
});


//Edits a URL if user is logged in, otherwise sends an error
app.post("/urls/:shortURL/update", (req, res) => {
  const key = req.params.shortURL;
  const longURL = req.body.longURL;
  const user = users[req.session['user_id']];
  if (user) {
    urlDatabase[key] = {longURL: longURL, userID: user.id};
    res.redirect("/urls");
  } else {
    res.status(403).send("You must login to do this");
    res.redirect("/login");
  }
});

//renders login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session['user_id']] };
  res.render("login", templateVars);
});

//checks if user is in database, checks password, returns cookie, redirects to homepage
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const user = getUserByEmail(users, email);
  if (!user) {
    res.status(403).send('Error - User Not Found');
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send('Error - Password Incorrect');
  } else {
    req.session['user_id'] = user.id;
    res.redirect("/urls");
  }
});

//deletes cookie session and redirects to urls page upon logout
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//renders register page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session['user_id']] };
  res.render("register", templateVars);
});

//adds user id to user object, creates cookie for user_id, redirects to homepade
app.post("/register", (req, res) => {
  console.log("req.body: ", req.body);
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);
  const user = getUserByEmail(users, email);
  if (email.length === 0 && password.length === 0) {
    res.status(400).send('Error - Must fill out info');
  } else if (!user) {
    const userId = addNewUser(users, email, password);
    req.session['user_id'] = userId;
    res.redirect("/urls");
  } else {
    res.status(400).send('Error - User already exists.');
  }
  console.log(users);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});