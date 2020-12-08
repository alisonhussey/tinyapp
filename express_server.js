const express = require("express");
const app = express();
const PORT = 8080;

//Makes the request body data human readable (install body-parser)
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


//Sets ejs as the view engine
app.set("view engine", "ejs");

//used to create a random shortURL id
function generateRandomString() {
return Math.random().toString(36).substring(2, 8)
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//sends data to /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

//a JSON string representing the entire urlDatabase object.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Adds a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Renders information about a single URL.
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
  const key = req.params.shortURL
  delete urlDatabase[key];
  res.redirect("/urls");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});