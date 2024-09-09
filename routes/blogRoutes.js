const express = require('express');
const multer = require('multer');
const path = require('path');
const Blog = require('../models/Blog');
const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Routes
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.render('index', { blogs });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        res.render('blog', { blog });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/add', (req, res) => {
    res.render('add');
});

router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { title, description, content } = req.body;
        const newBlog = new Blog({
            title,
            description,
            content,
            image: req.file ? req.file.path : ''
        });
        await newBlog.save();
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        res.render('edit', { blog });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, content } = req.body;
        const blog = await Blog.findById(req.params.id);
        if (req.file) blog.image = req.file.path;
        blog.title = title;
        blog.description = description;
        blog.content = content;
        await blog.save();
        res.redirect(`/blogs/${blog._id}`);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
