const express = require('express');
const app = express();
const PORT = 3000;



// Set EJS as the templating engine
app.set('view engine', 'ejs');



// Serve static files from the 'public' folder
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.render('index', { currentPage: 'home' });
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});