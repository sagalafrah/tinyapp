/* My Setup */
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cookieSession = require('cookie-session');
app.use(cookieSession({name: 'session', secret: 'why-did-the-chicken-cross-the-road'}));
const bcrypt = require('bcrypt');


/* My Functions */

const generateRandomString = () => {
  let randomString = "";
  const randomCharacters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    randomString += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));

  }
  return randomString;
};

const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  let userUrls = {};

  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }

  return userUrls;
};


/* My Objects */

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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




/* My Routes */
//get routes:
//post routes:



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
//explanation


app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrls, user: users[userID] };
  if (!userID) {
    return res.status(400).send("Sorry, you have to make an account or log-in to do that!");
  }
  
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  
  if (req.session.userID) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    return res.status(403).send("Sorry, you have to make an account or log-in to do that!");
  }
         
});


app.get('/urls/new', (req, res) => {
  if (req.session.userID) {
    const templateVars = {user: users[req.session.userID]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//explanation


//explanation

//NOTE: make sure that there is a templateVars because you need to pass it as a second argument because we use res.render (every time!)

/* Editing */

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urlDatabase, userUrls, shortURL, user: users[userID] };

  if (!urlDatabase[shortURL]) {
    
    return res.status(403).send("Sorry, couldn't find this URL!");

  } else if (!userID || !userUrls[shortURL]) {
    
    return res.status(403).send("Sorry, you have to make an account or log-in to do that!");
    
  } else {
    res.render('urls_show', templateVars);
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect('/urls');
  } else {
    return res.status(400).send("Sorry, you have to make an account or log-in to do that!");
  }
});

app.get("/u/:shortURL", (req, res) => {
//Anyone should be able to access this
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    return res.status(400).send("Sorry, couldn't find this URL!");
  }
});
//redirect allows us not to write the same stuff over and over again!

app.post("/urls/:shortURL/delete", (req, res) => {
  //have to set a variable, thats why it was an error
    const userID = req.session.user_id;
    const userUrls = urlsForUser(userID, urlDatabase);
    if (Object.keys(userUrls).includes(req.params.shortURL)) {
      const shortURL = req.params.shortURL;
      delete urlDatabase[shortURL];
      res.redirect('/urls');
    } else {
      return res.status(400).send("Sorry, you have to make an account or log-in to do that!");
    }
  });


//Logging In & Out

app.get('/login', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }

  const templateVars = {user: users[req.session.userID]};
  res.render('urls_login', templateVars);
});

  
app.post('/login', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send("Sorry! Email cannot be found.");
  }
  
  if (user.password !== password) {
    return res.status(403).send("Wrong password! Try again.");
  }

  req.session.userID = user.userID;
  res.redirect('/urls');
});



app.post('/logout', (req,res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls');
});

//Registration & Signing Up

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
        password: req.body.password
      };
      req.session.userID = userID;
      res.redirect('/urls');
    } else {
      return res.status(403).send("Someone is already using this email. Try another one?");
    }

  } else {
    return res.status(403).send("C'mon, don't leave it empty! Please type in an email & password!");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});