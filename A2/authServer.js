
const express = require("express")
const { handleErr } = require("./errorHandler.js")
const { asyncWrapper } = require("./asyncWrapper.js")
const dotenv = require("dotenv")
dotenv.config();
const userModel = require("./userModel.js")
const { connectDB } = require("./connectDB.js")
const ckparser = require("cookie-parser")
const jwt = require("jsonwebtoken")


const app = express()
app.use(ckparser())

const start = asyncWrapper(async () => {
  await connectDB();


  app.listen(process.env.authServerPORT, (err) => {
    if (err)
      throw new PokemonDbError(err)
    else
      console.log(`Phew! Server is running on port: ${process.env.authServerPORT}`);
  })
})
start()

app.use(express.json())


const bcrypt = require("bcrypt")
app.post('/register', asyncWrapper(async (req, res) => {
  const { username, password, email, isAdmin} = req.body
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  const userWithHashedPassword = { ...req.body, password: hashedPassword }

  const user = await userModel.create(userWithHashedPassword).then((user) => {
    user_id = user._id;
    token = jwt.sign({ _id: user._id}, process.env.TOKEN_SECRET);
  })

  // Update user
  await userModel.updateOne({ _id: user_id}, { userToken: token }, {new: true}).then((user) => {
    console.log("User updated with token");
  });
  const UpdatedUsertoSend = await userModel.findOne({ _id: user_id });
  res.send(UpdatedUsertoSend);

}))


app.post('/login', asyncWrapper(async (req, res) => {
  const { username, password } = req.body
  const user = await userModel.findOne({ username })
  if (!user) {
    console.log("User not found")
    return
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    console.log("Password is incorrect")
    return
  }

  const login = await userModel.findOneAndUpdate({ username: username }, { $set: {isLoggedIn: true }}, {new: true});

  await userModel.updateOne({ _id: user_id}, { userToken: token }, {new: true}).then((user) => {
    console.log("User updated with token");
  });

  res.cookie('userToken', user.userToken);

  res.send({login});
}))

const auth = (req, res, next) => {
  const token = req.cookies.userToken
  if (!token) {
    throw new PokemonBadRequest("Access denied")
  }
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET) // nothing happens if token is valid
    next()
  } catch (err) {
    throw new PokemonBadRequest("Invalid token")
  }
}

app.use(auth)

app.get('/logout', asyncWrapper(async (req, res) => {
  const token = req.cookies.userToken;
  await userModel.findOneAndUpdate({ userToken: token }, { $set: { isLoggedIn: false } }, { new: true }).then((user) => {
    console.log("User logged out");
    res.send(user);
});
}))         // - logout a user / Terminate the logged session.

app.use(handleErr)
