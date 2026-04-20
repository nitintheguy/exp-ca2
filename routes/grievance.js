const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

const requireAuth = (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    next();
};

router.get('/profile', requireAuth, (req, res) => {
    const users = getUsers();
    const user = users.find(u => u.id === req.session.user.id);
    res.render('profile', { currentPage: 'profile', user, grievances: user.grievances || [] });
});

router.get('/grievance/new', requireAuth, (req, res) => {
    res.render('grievance/new', { currentPage: 'grievance', error: null });
});

router.post('/grievance/new', requireAuth, (req, res) => {
    const { title, category, department, location, state, district, description, issueDate, priority } = req.body;
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === req.session.user.id);

    const grievance = {
        id: Date.now().toString(),
        title,
        category,
        department,
        location: location || '',
        state: state || '',
        district: district || '',
        description,
        issueDate: issueDate || '',
        priority: priority || 'normal',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updates: []
    };

    users[userIndex].grievances.push(grievance);
    saveUsers(users);

    res.redirect(`/grievance/${grievance.id}`);
});

router.get('/grievance/:id', requireAuth, (req, res) => {
    const users = getUsers();
    const user = users.find(u => u.id === req.session.user.id);
    const grievance = user.grievances.find(g => g.id === req.params.id);
    if (!grievance) return res.redirect('/profile');
    res.render('grievance/show', { currentPage: 'grievance', grievance, user });
});

module.exports = router;