const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// For this time to check endpoint I am filling users array with some data.
let users = [
  {
    username: "John Doe",
    password: "John123"
  }
];

const isValid = (username) => {
  let userWithSameUsername = users.filter((user) => user.username == username);
  return userWithSameUsername.length > 0;
}

const authenticatedUser = (username, password) => {
  let validUser = users.filter((user) => {
    return (user.password === password && user.username === username)
  })

  return validUser.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (!username || !password) {
    return res.status(400).send("Username and Password required.")
  };

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, "access", { expiresIn: 60 * 60 })

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).send("User has logged in successfully")
  } else {
    return res.status(400).send("Login failed. Check username and password.")
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required as a query parameter" });
  }

  const isUpdate = books[isbn].reviews[username] !== undefined;
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: isUpdate
      ? `Review for ISBN ${isbn} updated successfully`
      : `Review for ISBN ${isbn} added successfully`,
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }

  if (books[isbn].reviews[username] === undefined) {
    return res.status(404).json({ message: "No review by this user for the given ISBN" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review for ISBN ${isbn} by ${username} deleted successfully`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
