const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'microlearning_secret_key',
  resave: false,
  saveUninitialized: false,
}));

// In-memory users and courses
const users = [];
const courses = [
  { id: 'coding', title: 'Learn How to Code', description: 'Basics of programming.' },
  { id: 'editing', title: 'Photo & Video Editing', description: 'Get creative with editing.' }
];

// Middleware to check if logged in
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Home page
app.get('/', (req, res) => {
  res.render('home', { user: req.session.user });
});

// Signup
app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('signup', { error: 'All fields required.' });
  }
  if (users.find(u => u.username === username)) {
    return res.render('signup', { error: 'Username taken.' });
  }
  users.push({ username, password });
  req.session.user = { username };
  res.redirect('/courses');
});

// Login
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.render('login', { error: 'Invalid credentials.' });
  }
  req.session.user = { username };
  res.redirect('/courses');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Course selection page
app.get('/courses', requireLogin, (req, res) => {
  res.render('courses', { user: req.session.user, courses });
});

// Course page
app.get('/courses/:id', requireLogin, (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).send('Course not found');
  }
  res.render('course', { user: req.session.user, course });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Micro-learning demo running on http://localhost:${PORT}`);
});
