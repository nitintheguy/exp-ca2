const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const app = express();
const PORT = 3000;

// 1. Settings & Static Files
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. Session Configuration (Essential for persistence)
app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: 'nivaran-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// 3. Trailing slash redirect (Keep URL clean)
app.use((req, res, next) => {
    if (req.path.endsWith('/') && req.path.length > 1) {
        return res.redirect(301, req.path.slice(0, -1));
    }
    next();
});

// 4. THE GLOBAL AUTH BRIDGE
// This MUST sit right above the routes to bridge req.session to res.locals
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// 5. MAIN ROUTES
app.get('/', (req, res) => {
    res.render('index', { currentPage: 'home' }); 
});

app.get('/about', (req, res) => {
    res.render('about', { currentPage: 'about' });
});

app.get('/track-status', (req, res) => {
    // res.locals.user (set above) handles the Guest vs Auth toggle in the EJS
    res.render('track-status', { currentPage: 'track-status' });
});

// 6. DEV LOGIN (Use this to force the "NM" state)
app.get('/dev-login', (req, res) => {
    req.session.user = {
        firstName: "Nitin",
        lastName: "Mishra",
        role: "citizen"
    };
    req.session.save((err) => {
        if (err) return next(err);
        res.redirect('/track-status');
    });
});
 
// 7. LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// 8. EXTERNAL ROUTER INTEGRATION
// These routers will now inherit the session and res.locals from above
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/grievance'));

app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));