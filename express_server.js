/* My Setup */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cookieSession = require('cookie-session')
app.use(cookieSession({name: 'session', secret: 'why-did-the-chicken-cross-the-road'}));


/* My Functions */
const userExists = (email) => {
    for (const user in users) {
        if (users[user].email === email) {
            return true;
        }
    } return false;
};

const getUser = (email) => {
    for (const user in users) {
        if (users[user].email === email) {
            return users[user];
        }
    } return;
};

function generateRandomString() {
  let randomString = "";
  const randomCharacters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    randomString += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
  
  }
  return randomString;
}

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




/* ROUTES*/ /*Get Routes*/

app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"]
  if (userID) {
    const templateVars = { 
      urls: urlDatabase, 
      user: users[userID], };
    
  res.render("urls_new", templateVars);
  } else {
res.redirect("/login")

  }
  // const templateVars = { 
  //     urls: urlDatabase, 
  //     user: users[req.cookies["user_id"]], };
    
  // res.render("urls_new", templateVars);
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
 const templateVars = {
  urls: urlDatabase,
  user: users[req.cookies["user_id"]],
};
res.render('urls_index', templateVars);
});

// app.get("/urls/:shortURL", (req, res) => {
//   const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
//   res.render("urls_show", templateVars);
// });
//looking up value of key , get whatever matches the value of the short url key

// app.put("/urls/update" , (req, res) => {
//   //did update bc shorturls wasnt working!!!triggering correctly
//   const shortURL = req.body.shortURL;
//   const longURL = req.body.longURL;
//   const templateVars = {shortURL, longURL, 
//     user: users[req.cookies["user_id"]],}
//   console.log(req.body)
//   urlDatabase[shortURL] = longURL;
//   // when entered on this page, it will update/overwrite the existing key
//   console.log(urlDatabase);
//   res.redirect('/urls', templateVars)
// });

app.get("/urls/:shortURL", (req, res) => {
//   //dont have to set a variable
  const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL], 
      user: users[req.cookies["user_id"]],};
  res.render('urls_show', templateVars);
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