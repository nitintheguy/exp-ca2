const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');

const requireAuth = (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    next();
};

// PROFILE — show all grievances of logged-in user
router.get('/profile', requireAuth, async (req, res) => {
    const grievances = await Grievance.find({ submittedBy: req.session.user.id });
    res.render('profile', {
        currentPage: 'profile',
        user: req.session.user,
        grievances
    });
});


router.get('/track-status', requireAuth, async (req, res) => {
    console.log('Session user id:', req.session.user.id); // ADD THIS
    const grievances = await Grievance.find({ submittedBy: req.session.user.id });
    console.log('Grievances found:', grievances.length); // ADD THIS
    res.render('track-status', { currentPage: 'track', grievances, user: req.session.user });
});
// NEW GRIEVANCE — form
router.get('/grievance/new', requireAuth, (req, res) => {
    res.render('grievance/new', { currentPage: 'grievance', error: null });
});

// NEW GRIEVANCE — submit
router.post('/grievance/new', requireAuth, async (req, res) => {
    const { title, category, department, location, state, district, description, issueDate, priority } = req.body;

    const grievance = await Grievance.create({
        title,
        category,
        department,
        location: location || '',
        state: state || '',
        district: district || '',
        description,
        issueDate: issueDate || '',
        priority: priority || 'normal',
        submittedBy: req.session.user.id
    });

    res.redirect(`/grievance/${grievance._id}`);
});

// SHOW GRIEVANCE
router.get('/grievance/:id', requireAuth, async (req, res) => {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance || grievance.submittedBy !== req.session.user.id)
        return res.redirect('/profile');
    res.render('grievance/show', {
        currentPage: 'grievance',
        grievance,
        user: req.session.user
    });
});

module.exports = router;