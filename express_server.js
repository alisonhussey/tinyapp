const express = require("express");
const app = express();
const PORT = 8080;

//Makes the request body data human readable (install body-parser)
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());


//Sets ejs as the view engine
app.set("view engine", "ejs");

//used to create a random shortURL id
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

function addNewUser(users, email, password) {
  const userId = generateRandomString();
  const newUser = {
    id: userId,
    email,
    password
  };
  users[userId] = newUser;
  return userId;
}

function findUserByEmail(users, email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

const urlDatabase = {
  '9sm5xK': "http://www.google.com",
  '32xVn2': "http://www.lighthouselabs.ca"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


//a JSON string representing the entire urlDatabase object.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//sends data to /urls
app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  //console.log(templateVars)
  res.render("urls_index", templateVars);
});

//Adds a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

//Renders information about a single URL.
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //shortURL: key of longURL inside the urlDatabase
  const longURL = urlDatabase[shortURL]; //
  const templateVars = { user: users[req.cookies["user_id"]], shortURL, longURL };
  res.render("urls_show", templateVars);
});

//a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Redirects any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Deletes a url from the database and redirects back to the url listing the databse
app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  delete urlDatabase[key];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const key = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[key] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const value = req.body.username;
  res.cookie("username", value);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

//adds user id to user object, creates cookie for user_id, redirects to homepade
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  

  const user = findUserByEmail(users, email);

  if (email.length === 0 && password.length === 0) {
    res.status(400).send('Error - Must fill out info');
  } else if (!user) {
    const userId = addNewUser(users, email, password);
    res.cookie('user_id', userId);
    res.redirect("/urls");
  } else {
    res.status(400).send('Error - User already exists.');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});