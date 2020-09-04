const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();
router.get("/", (req, res) => {
  res.status(200).sendFile("/signup.html", {
    root: "."
  });
});

router.get("/login", (req, res) => {
  res.status(200).sendFile("/login.html", {
    root: "."
  });
});

router.post("/signup", async (req, res) => {
  //console.log("hi");
  const {
    username,
    password
  } = req.body
  //console.log(req.body);
  console.log(username, password);
  // Create a new user
  try {
    const user = new User({
      name: username,
      password
    });
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({
      user,
      token
    });
    //res.end("done");
  } catch (error) {
    //console.log(error);
    res.status(400).json({
      error: 'error occured'
    });
  }
});

router.post("/login", async (req, res) => {
  //Login a registered user
  //console.log(req.headers.token)
  try {
    const {
      username,
      password
    } = req.body;
    const user = await User.findByCredentials(username, password);
    if (!user) {
      return res
        .status(200)
        .send({
          error: "Login failed! Check authentication credentials"
        });
    }
    const token = await user.generateAuthToken();
    //console.log(token);
    res.send({
      user,
      token
    });
  } catch (error) {
    res.status(200).send({
      error: 'not found'
    });
  }
});

express().use(function (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({
      error: "No credentials sent!"
    });
  }
  next();
});

router.get("/me", auth, async (req, res) => {
  // View logged in user profile
  res.json(req.user);
});

router.post("/users/me/logout", auth, async (req, res) => {
  // Log user out of the application
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/users/me/logoutall", auth, async (req, res) => {
  // Log user out of all devices
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;