const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// I used this keys in multiple route heandlers so decided it to move it here.

let bookKeys = Object.keys(books);

public_users.post("/register", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      res.status(200).send("User has been registered successfully")
    } else {
      res.status(409).send("User already exists")
    }
  } else {
    res.status(400).send("Unable to register user.")
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  if (!books) return res.status(404).json({ message: "No books available yet" })

  res.status(200).send(JSON.stringify(books, null, 4))
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }

  return res.status(200).send(JSON.stringify({ isbn, ...book }, null, 4));
});



public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const result = Object.entries(books)
    .filter(([isbn, book]) => book.author === author)
    .map(([isbn, book]) => ({ isbn, ...book }));

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found for the given author" });
  }
  return res.status(200).send(JSON.stringify(result, null, 4));
});



// Get book details based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const result = Object.entries(books)
    .filter(([isbn, book]) => book.title === title)
    .map(([isbn, book]) => ({ isbn, ...book }));

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found for the given title" });
  }
  return res.status(200).send(JSON.stringify(result, null, 4));
});



//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = req.params.isbn;

  let reviewsOfTheBook = {};

  for (let x of bookKeys) {
    if (x == isbn) {
      reviewsOfTheBook = books[x].reviews
      break
    };
  };

  return res.status(200).send(JSON.stringify(reviewsOfTheBook))
});

// Helper: call our own API with Axios (async/await)
const fetchWithAxios = async (path, res) => {
  try {
    const response = await axios.get(`http://localhost:5000${path}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: "Error fetching data", error: error.message });
  }
};

// Task 10: all books
public_users.get('/async/books', (req, res) => fetchWithAxios('/', res));

// Task 11: by ISBN
public_users.get('/async/isbn/:isbn', (req, res) =>
  fetchWithAxios(`/isbn/${encodeURIComponent(req.params.isbn)}`, res));

// Task 12: by author
public_users.get('/async/author/:author', (req, res) =>
  fetchWithAxios(`/author/${encodeURIComponent(req.params.author)}`, res));

// Task 13: by title
public_users.get('/async/title/:title', (req, res) =>
  fetchWithAxios(`/title/${encodeURIComponent(req.params.title)}`, res));

module.exports.general = public_users;
