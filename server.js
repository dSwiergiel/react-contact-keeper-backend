const express = require('express');
const app = express();
const connectDB = require('./config/db.js');
const http = require('http');

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) =>
  res.json({ msg: 'Welcome to the ContactKeeper API' })
);

// separated endpoints to their respective files and using routes to handle
app.use('/api/users', require('./api/users'));
app.use('/api/auth', require('./api/auth'));
app.use('/api/contacts', require('./api/contacts'));

// const server = http.createServer(app);
// server.listen(PORT, () =>
//   console.log(`Server running at: http://localhost:${PORT}`)
// );
app.listen(PORT, () =>
  console.log(`Server running at: http://localhost:${PORT}`)
);
