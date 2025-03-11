const express=require('express');
const db=require('./database');
const app=express();
const PORT= 4000;

app.listen(PORT,()=>{
    console.log(`Server running on Port:${PORT}`);
})