require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const learnRoutes = require('./routes/learn');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', learnRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));