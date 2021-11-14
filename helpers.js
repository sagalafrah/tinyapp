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
module.exports = {generateRandomString, getUserByEmail, urlsForUser};