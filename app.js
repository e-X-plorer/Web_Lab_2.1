const express = require('express');
const app = express();
const port = 3000;
const fetch = require('node-fetch');
const mongo = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'weather';
const client = new mongo(mongoUrl);
let db;

client.connect(function(err) {
    console.log('Connected successfully to server');
    db = client.db(dbName);
});

app.use(express.static('public'));

app.get('/favourites', async function(req, res) {
    let id = req.query.id;
    if (id) {
        db.collection('weather').find({ id: id }).toArray((err, docs) => res.send(docs));
    } else {
        db.collection('weather').find({}).toArray((err, docs) => res.send(docs));
    }
});

app.post('/favourites', async function(req, res) {
    let id = req.query.id;
    let result = await db.collection('weather').insertOne({ id: id });
    res.send(result);
});

app.delete('/favourites', async function(req, res) {
    let id = req.query.id;
    let result = await db.collection('weather').deleteOne({ id: id });
    res.send(result);
});

app.get('/weather/coordinates', async function(req, res) {
    let lat = req.query.lat;
    let long = req.query.long;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=bb00e2c76a482605b246251414383c30`)
        .then(response => response.json()).then(json => {
            if (json.cod == 404)
                res.status(404);
            res.send(json);
        });
});

app.get('/weather/city', async function(req, res) {
    let city = req.query.q;
    let id = req.query.id;
    if (id) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?id=${id}&units=metric&appid=bb00e2c76a482605b246251414383c30`)
            .then(response => response.json()).then(json => {
                if (json.cod == 404)
                    res.status(404);
                res.send(json);
            });
    }
    else {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=bb00e2c76a482605b246251414383c30`)
            .then(response => response.json()).then(json => {
                if (json.cod == 404)
                    res.status(404);
                res.send(json);
            });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});