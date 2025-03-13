const express=require('express');
const db=require('./database');
const app=express();
const bodyParser = require("body-parser");
const PORT= 4000;

const signuproute=require("./Routes/signup");
const loginroute=require("./Routes/login");
const userroute=require("./Routes/users");
const addressroute=require('./Routes/address');
const cardroute=require('./Routes/card');
const verifyroute=require('./Routes/verifysignup');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));
app.use('/sign',signuproute);
app.use('/login',loginroute);
app.use('/fetch',userroute);
app.use('/add',addressroute);
app.use('/card',cardroute);
app.use('/verify',verifyroute);

app.listen(PORT,()=>{
    console.log(`Server running on Port:${PORT}`);
})