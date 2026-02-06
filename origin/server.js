const express = require('express');
const app = express();
const PORT = 3000;

app.use((req, res, next)=>{
    console.log(`[ORIGIN] Received request for ${req.url}`);
    next();
})

app.use((req, res, next)=>{
    setTimeout(next, 500);
})
app.get('/:id', (req, res)=>{
    const id = req.params.id;
    res.json({
        id: id,
        payload: "x".repeat(1024),
        timestamp: Date.now()
    });
});

app.listen(PORT, ()=>{
    console.log(`Origin server running on port ${PORT}`)
})