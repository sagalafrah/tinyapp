/*REQUIRES & CONFIGURATIONS*/
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const {generateRandomString, getUserByEmail, urlsForUser} = require("./helpers");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(cookieSession({name: 'session', secret: 'why-did-the-chicken-cross-the-road'}));
app.use(bodyParser.urlencoded({extended: true}));

/* DATABASE OBJECTS FOR URLS & USERS */

const urlDatabase = {};
const users = {};

/* BASIC ROUTES FOR SET-UP*/

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


/* ROUTES TO ACCESS URLS*/

//The res.render() is used to render a view and sends the rendered HTML string to the client.

app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrls, user: users[userID]};
  if (!userID) {
    return res.status(400).send("Sorry, you have to make an account or log-in to do that!😓");
  }
  
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  if (req.session.userID) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/login');
  }
 
});

//route to render the urls_new.ejs template
app.get('/urls/new', (req, res) => {
  if (req.session.userID) {
    const templateVars = {user: users[req.session.userID]};
    res.render('urls_new', templateVars);
  } else {
    return res.status(403).send("Sorry, you have to make an account or log-in to do that!😓");
  }
});


/* UPDATING/EDITING URLS */

//page to display a single URL and its shortened form generate a link that will redirect to the appropriate longURL.

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urlDatabase, userUrls, shortURL, user: users[userID] };

  if (!urlDatabase[shortURL]) {
    
    return res.status(403).send("Sorry, couldn't find this URL!😥");

  } else if (!userID || !userUrls[shortURL]) {
    
    return res.status(403).send("Sorry, you have to make an account or log-in to do that!😓");
    
  } else {
    res.render('urls_show', templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const newURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(newURL);
  if (!newURL) {
    res.redirect("/urls");
  }
});



/* DELETING URLS */

// route that removes a URL resource. Added permissions conditional so that someone who is not logged in cannot delete a URL.

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    return res.status(400).send("Sorry! You can't delete URLs. Make an account or login maybe? 😊");
  }
});



/* LOGIN AND LOGOUT ROUTES*/

app.get('/login', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }

  const templateVars = {user: users[req.session.userID]};
  res.render('urls_login', templateVars);
});

  
app.post('/login', (req,res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userID = user.userID;
    res.redirect('/urls');
  } else {
    return res.status(400).send("Sorry! Wrong email or password!❌❌❌ Try again.");
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

/* REGISTRATION ROUTES */

app.get('/register', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }

  const templateVars = {user: users[req.session.userID]};
  res.render('urls_registration', templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
  
    if (!getUserByEmail(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.userID = userID;
      res.redirect('/urls');
    } else {
      return res.status(403).send("It appears someone is already using this e-mail...🤭 Try again!");
    }
  
  } else {
    return res.status(403).send("C'mon, you can't just leave it empty! 🙄 Put in an email or a password.");
  }
});
  

/*CONNECTION LISTENER*/

app.listen(PORT, () => {
  console.log(`TinyApp successfully connected & listening on port ${PORT}!`);
});