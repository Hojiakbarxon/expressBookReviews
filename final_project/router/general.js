const express = require('express');
const books = require('./booksdb.js');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// I used this keys in multiple route heandlers so decided it to move it here.

let bookKeys = Object.keys(books);

public_users.post("/register", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
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

  return res.status(200).send(JSON.stringify(book, null, 4));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  let author = req.params.author;


  let booksOfAuthor = [];
  for (let x of bookKeys) {
    if (books[x].author === author) {
      booksOfAuthor.push(books[x])
    };
  };

  return res.status(200).send(booksOfAuthor)
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let title = req.params.title;
  let searchedBook = {};

  for (let x of bookKeys) {
    if (books[x].title === title) {
      searchedBook = books[x];
      break;
    }
  };

  return res.status(200).send(JSON.stringify(searchedBook));
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

module.exports.general = public_users;
