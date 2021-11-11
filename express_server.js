const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');


app.use(cookieParser());

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

const userExists = function(email) {
    for (const user in users) {
      if (users[user].email === email) {
        return true
      }
    } return false;
  };


function generateRandomString() {
  let randomString = "";
  const randomCharacters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    randomString += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
  
  }
  return randomString;
}



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, userID: req.cookies["userID"] };
  res.render("urls_new", templateVars);
});
//make sure that there is a templateVars because you need to pass it as a second argument because we use res.render (every time!)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  // const templateVars = { urls: urlDatabase };
  console.log(req.cookies);
  const templateVars = { urls: urlDatabase, userID: req.cookies["userID"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});
//looking up value of key , get whatever matches the value of the short url key

app.post("/urls/update" , (req, res) => {
  //did update bc shorturls wasnt working!!!triggering correctly
  const shortURL = req.body.shortURL;
  const longURL = req.body.longURL;
  console.log(urlDatabase);
  // console.log(req.body)
  urlDatabase[shortURL] = longURL;
  // when entered on this page, it will update/overwrite the existing key
  console.log(urlDatabase);
});

app.get("/urls/:shortURL/update", (req, res) => {
  //dont have to set a variable
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userID: req.cookies["userID"]};
  res.render('urls_show', templateVars);
});


app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
//redirect allows us not to write the same stuff over and over again!

app.post("/urls/:shortURL/delete", (req, res) => {
  //dont have to set a variable
  delete urlDatabase[req.params.shortURL];
  //pulls short URL from our database of URLs, short URL is the placeholder
  res.redirect("/urls");
});


//Logging In & Out

app.get('/login', (req, res) => {
  
  const templateVars = {
    user: users[req.cookies.user_id],
    email: req.cookies.email
  };
  res.render('login', templateVars);
});

  
app.post('/login', (req,res) => {
  // set a cookie named userID
  res.cookie("userID", req.body.user_id);
  res.redirect(/urls/);
});

app.post('/logout', (req,res) => {
  // set a cookie named userID
  res.clearCookie("userID", req.body.user_id);
  res.redirect(/urls/);
});

//Registration & Signing Up

app.get('/register', (req, res) => {
    const templateVars = {
        username: req.cookies["username"],
      };
  res.render('urls_registration', templateVars);
// res.send('OK')
});

app.post("/register", (req, res) => {
    const submittedEmail = req.body.email;
    const submittedPassword = req.body.password;
  
    if (!submittedEmail || !submittedPassword) {
      res.send(400, "Please provide a valid email and password");
    };
  
    if (userExists(submittedEmail)) {
      res.send(400, "An account already exists for this email address. Please provide a different email address.");
    };
  
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: submittedEmail,
      password: submittedPassword
    };
      res.cookie('user_id', newUserID);
      res.redirect("/urls");
  });
  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});