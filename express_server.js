/* My Setup */
const express = require("express");
const app = express();
const PORT = 8080; 
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cookieSession = require('cookie-session')
app.use(cookieSession({name: 'session', secret: 'why-did-the-chicken-cross-the-road'}));


/* My Functions */

function generateRandomString() {
  let randomString = "";
  const randomCharacters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    randomString += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
  
  }
  return randomString;
}

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



app.get('/urls/new', (req, res) => {
  if (req.session.userID) {
    const templateVars = {user: users[req.session.userID]};
    res.render('urls_new', templateVars);
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
    return res.status(400).send("Sorry, you have to make an account or log-in to do that!")
  }
  
  res.render('urls_index', templateVars);
});

//explanation

//NOTE: make sure that there is a templateVars because you need to pass it as a second argument because we use res.render (every time!)

/* Editing */

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL], 
      user: users[req.session["user_id"]],};
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect('/urls');
  } else {
    return res.status(400).send("Sorry, you have to make an account or log-in to do that!")
  }
});





app.post("/urls", (req, res) => { 
  const userID = req.cookies["user_id"]
  if (userID) {
    res.send("Ok");  
    res.redirect('/urls')
  } else {
    return res.status(403).send("Please log-in to access.")
  }
         
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
  res.render('urls_login', templateVars);
});

  
app.post('/login', (req,res) => {
    const email = req.body.email
    const password = req.body.password
    const user = getUser(email) //will return user object if it has an email, if not, will return undefined
   if (!user) {
    return res.status(403).send("Sorry! Email cannot be found.")
   }
   console.log(user.password, password)
if (user.password !== password) {
console.log('wrong')
return res.status(403).send("Wrong password! Try again.")
}
console.log(req.body.user_id)
  res.cookie("user_id", user.id);
  res.redirect(/urls/);
});



app.post('/logout', (req,res) => {
  // set a cookie named userID
  res.clearCookie("user_id");
  res.redirect(/urls/);
});

//Registration & Signing Up

app.get('/register', (req, res) => {
    const templateVars = {
        user: users[req.cookies["user_id"]],
      };
  res.render('urls_registration', templateVars);
// res.send('OK')
});

app.post("/register", (req, res) => {
    const submittedEmail = req.body.email;
    const submittedPassword = req.body.password;
  
    if (!submittedEmail || !submittedPassword) {
        // res.status(400).send("Please provide a valid email and password");
    return res.status(400).send("Please provide a valid email and password");
    };
  
    if (userExists(submittedEmail)) {
      return res.status(400).send("An account already exists for this email address. Please provide a different email address.");
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