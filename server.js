const express=require('express');
const db=require('./database');
const app=express();
const bodyParser = require("body-parser");
const PORT= 4000;

const session = require("express-session");
const passport = require("passport");
const signuproute=require("./Routes/signup");

const userroute=require("./Routes/users");
const addressroute=require('./Routes/address');
const cardroute=require('./Routes/card');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));
app.use('/sign',signuproute);

app.use('/fetch',userroute);
app.use('/add',addressroute);
app.use('/card',cardroute);


app.use(session({ secret: process.env.JWT_SECRET_KEY, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.listen(PORT,()=>{
    console.log(`Server running on Port:${PORT}`);
})