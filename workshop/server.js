const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;
const SECRET = "nkA$SD89&&282hd";

const server = express();

server.use(cookieParser());
server.use(express.urlencoded());

server.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

server.get("/", (req, res) => {
  const token = req.cookies.user;
  if (token) {
    const user = jwt.verify(token, SECRET);
    res.send(`<h1>Hello ${user.email}</h1><a href="/log-out">Log out</a>`);
  } else {
    res.send(`<h1>Hello world</h1><a href="/log-in">Log in</a>`);
  }
});

server.get("/log-in", (req, res) => {
  res.send(`
    <h1>Log in</h1>
    <form action="/log-in" method="POST">
      <label for="email">Email</email>
      <input type="email" id="email" name="email">
    </form>
  `);
});

server.post("/log-in", (req, res) => {
  const email = req.body.email;
  const token = jwt.sign({ email }, SECRET);
  res.cookie("user", token, { maxAge: 600000 });
  res.redirect("/profile");
});

server.get("/log-out", (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

server.use((req, res, next) => {
  const token = req.cookies.user;
  if (token) {
    const user = jwt.verify(token, SECRET);
    req.user = user;
  }
  next();
});

function checkAuth(req, res, next) {
  if (!req.user) {
    res.status(401).send(`<h1>Please <a href="/log-in">log in</a></h1>`);
  } else {
    next();
  }
}

server.get("/profile", checkAuth, (req, res) => {
  res.send(`<h1>Hello ${req.user.email}</h1>`);
});

server.get("/profile/settings", checkAuth, (req, res) => {
  const token = req.cookies.user;
  const user = jwt.verify(token, SECRET);
  res.send(`<h1>Settings for ${user.email}</h1>`);
});

server.get("/error", (req, res, next) => {
  const fakeError = new Error("uh oh");
  fakeError.status = 403;
  next(fakeError);
});

function handleErrors(error, req, res, next) {
  console.error(error);
  if (!error.status) {
    res.status(500).send("<h1>OOPS!<h1>");
  } else {
    res.status(error.status).send(`<h1>Something went wrong</h1>`);
  }
  //console.log(error.status);
}
server.use(handleErrors);

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
