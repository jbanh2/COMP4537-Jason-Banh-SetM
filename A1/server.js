const express = require('express')
const mongoose = require('mongoose')
const axios = require('axios');
const path = require('path');

const app = express()
const port = 5000

const { Schema } = mongoose;

app.listen(process.env.PORT || port, async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://jbanh:queene2011@cluster0.luxox6n.mongodb.net/test'
        );
    } catch (error) {

    }
})

const pokemonSchema = new Schema({
    "_id": Number, // Unique id
    "id": {unique: true, required: true, type: Number}, // Pokemon #
    "name": String,
    "type": {type: String, enum: types},
    "base": {
        "HP": Number,
        "Attack": Number,
        "Defense": Number,
        "Special Attack": Number,
        "Special Defense": Number
    },
    "__v": Number
});

app.get('/api/v1/pokemons?count=2&after=10', (req, res) => {

})     // - get all the pokemons after the 10th. List only Two.
// app.post('/api/v1/pokemon')                      // - create a new pokemon
// app.get('/api/v1/pokemon/:id')                   // - get a pokemon
// app.get('/api/v1/pokemonImage/:id')              // - get a pokemon Image URL
// app.put('/api/v1/pokemon/:id')                   // - upsert a whole pokemon document
// app.patch('/api/v1/pokemon/:id')                 // - patch a pokemon document or a
//   portion of the pokemon document
// app.delete('/api/v1/pokemon/:id')                // - delete a  pokemon