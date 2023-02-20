const express = require('express');
const path = require('path');
const router = express.Router()

router.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, '..', 'public/home/index.html'))
})
router.get('/css/main.css', (req,res)=>{
    res.sendFile(path.join(__dirname, '..','../css/main.css'))
})
router.get('/index.js', (req,res)=>{
    res.sendFile(path.join(__dirname, '..', 'public/home/index.js'))
})
router.get('/evaluate', (req,res)=>{
    res.sendFile(path.join(__dirname, '..', 'public/evaluation/index.html'))
})
router.get('/evaluate/index.js', (req,res)=>{
    res.sendFile(path.join(__dirname, '..', 'public/evaluation/index.js'))
})

module.exports = router