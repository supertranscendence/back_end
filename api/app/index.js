const express = require('express');

const app = express();

app.get('/api',(req,res)=>{
    res.send('Hello, Docker world');
});

app.listen(3000,()=> console.log('Server is running'));