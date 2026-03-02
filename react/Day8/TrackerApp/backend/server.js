const jsonServer = require("json-server")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const verifyToken = require("./middleware/authMiddleware")

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, "db.json"))
const middlewares = jsonServer.defaults()

const secretKey = "superSecretKey"

server.use(cors())
server.use(jsonServer.bodyParser)
server.use(middlewares)

/* ---------------- REGISTER ---------------- */

server.post("/register", async (req, res) => {
  const { name, email, password } = req.body
  const db = router.db

  const existingUser = db.get("users").find({ email }).value()

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
    role: "user"
  }

  db.get("users").push(newUser).write()

  res.status(201).json({ message: "User registered successfully" })
})

/* ---------------- LOGIN ---------------- */

server.post("/login", async (req, res) => {
  const { email, password } = req.body
  const db = router.db

  const user = db.get("users").find({ email }).value()

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" })
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secretKey,
    { expiresIn: "1h" }
  )

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
})

/* ---------------- PROTECTED TRACKING ROUTES ---------------- */

server.use("/tracking", verifyToken)

server.post("/tracking", (req, res) => {
  const db = router.db
  const newItem = {
    id: Date.now(),
    title: req.body.title,
    amount: req.body.amount,
    userId: req.user.id
  }

  db.get("tracking").push(newItem).write()
  res.status(201).json(newItem)
})

server.get("/tracking", (req, res) => {
  const db = router.db
  const userItems = db
    .get("tracking")
    .filter({ userId: req.user.id })
    .value()

  res.json(userItems)
})

server.put("/tracking/:id", (req, res) => {
  const db = router.db
  const item = db
    .get("tracking")
    .find({ id: Number(req.params.id), userId: req.user.id })
    .value()

  if (!item) {
    return res.status(404).json({ message: "Item not found" })
  }

  db.get("tracking")
    .find({ id: Number(req.params.id) })
    .assign(req.body)
    .write()

  res.json({ message: "Updated successfully" })
})

server.delete("/tracking/:id", (req, res) => {
  const db = router.db

  db.get("tracking")
    .remove({ id: Number(req.params.id), userId: req.user.id })
    .write()

  res.json({ message: "Deleted successfully" })
})

/* ---------------- START SERVER ---------------- */

server.use(router)

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})