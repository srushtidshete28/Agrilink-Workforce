const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Import routes
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const farmerRoutes = require('./routes/farmers');
const notificationRoutes = require('./routes/notifications.js');

const app = express();

app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://sakshirpatil24:Sakshi7646@cluster0.lyxz0xu.mongodb.net/agrilink?retryWrites=true&w=majority&appName=Cluster0') 
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'agrilink_secret_key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://sakshirpatil24:Sakshi7646@cluster0.lyxz0xu.mongodb.net/agrilink?retryWrites=true&w=majority&appName=Cluster0'}),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));


const PORT = process.env.PORT || 3000;

// Serve static files from 'public' (already exists)

app.use('/css', express.static(path.join(__dirname, 'public/css'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

app.use('/js', express.static(path.join(__dirname, 'public/js'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));


// Serve HTML files from 'views'
app.use(express.static(path.join(__dirname, 'views')));

// Route for root path to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use('/', authRoutes);

app.get('/dashboard-farmer', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/dashboard-farmer.html'));
});

app.get('/dashboard-worker', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/dashboard-worker.html'));
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).send('User  registered');
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  const user = await User.findOne({ username });

  // Check if user exists and if the password matches
  if (!user || user.password !== password) {
      return res.status(401).send('Invalid credentials');
  }

  // If login is successful, you can send a success message or user data
  res.status(200).send('Login successful');
});

app.use((req, res, next) => {
  res.status(404).send('Sorry, that route does not exist.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); // <-- THIS LINE MUST EXIST
});