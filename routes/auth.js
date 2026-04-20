const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const requireAuth = (req, res, next) => {
    console.log('Session user:', req.session.user);
    console.log('Session ID:', req.sessionID);
    if (!req.session.user) return res.redirect('/login');
    next();
};

const USERS_FILE = path.join(__dirname, '../data/users.json');
const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

router.get('/', (req, res) => {
    if (req.session.user) {
        const users = getUsers();
        const user = users.find(u => u.id === req.session.user.id);
        const grievances = user ? user.grievances : [];
        return res.render('index', { currentPage: 'home', grievances });
    }
    res.render('index', { currentPage: 'home' });
});
router.get('/login', (req, res) => res.render('login', { currentPage: 'login', error: null }));
router.get('/signup', (req, res) => res.render('signup', { currentPage: 'signup', error: null }));



router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, password } = req.body;
        const users = getUsers();

        if (users.find(u => u.email === email)) {
            return res.render('signup', { currentPage: 'signup', error: 'Email already registered.' });
        }

        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            email,
            mobile,
            passwordHash: await bcrypt.hash(password, 10),
            role: 'citizen',
            grievances: [],
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        req.session.user = {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            mobile: newUser.mobile,
            role: newUser.role
        };

        req.session.save((err) => {
            if (err) console.error(err);
            res.redirect('/profile');
        });

    } catch (err) {
        console.error(err);
        res.render('signup', { currentPage: 'signup', error: 'Something went wrong. Try again.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const users = getUsers();

        const user = users.find(u => u.email === identifier || u.mobile === identifier);
        if (!user) {
            return res.render('login', { currentPage: 'login', error: 'No account found with that email or mobile.' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.render('login', { currentPage: 'login', error: 'Incorrect password.' });
        }

        req.session.user = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobile: user.mobile,
            role: user.role
        };

        req.session.save((err) => {
            if (err) console.error(err);
            res.redirect('/profile');
        });

    } catch (err) {
        console.error(err);
        res.render('login', { currentPage: 'login', error: 'Something went wrong. Try again.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;