const express = require('express')
const axios = require('axios');
const path = require('path');
const mongoose = require("mongoose");

const app = express()
const port = 5000

const { Schema } = mongoose;

app.listen(process.env.PORT || port, async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://jbanh:queene2011@cluster0.luxox6n.mongodb.net/?retryWrites=true&w=majority'
        );
        console.log('Connection Successful')
    } catch (error) {
        console.log('Database Connection Error')
    }
    let db = mongoose.connection;
    let types = []; // Will contain Pokemon types

    // Assign types
    await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json').then(
        docs => {
            docs.data.forEach(type => {
                types.push(type.english)
            })
        }
    )

    console.log(types);

    const pokemonSchema = new Schema({
        "id": {unique: true, required: true, type: Number}, // Pokemon #
        "name": {
            "english": {type: String, maxLength: 20},
            "japanese": String,
            "chinese": String,
            "french": String,
        },
        "type": [{type: String, enum: types}],
        "base": { // Pokestats
            "HP": Number,
            "Attack": Number,
            "Defense": Number,
            "Special Attack": Number,
            "Special Defense": Number,
            "Speed": Number
        },
    });

    const pokeModel = mongoose.model('pokemon', pokemonSchema, "pokemons")

    // Populate Mongo
    await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json').then(
        async pokejson => {
            for (const pokemon of pokejson.data) {
                try {
                    await pokeModel.create(pokemon)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    )

    // Routes
    // Get all the pokemon, return json
    app.get('/api/v1/pokemons', async (req, res) => {
        try {
            const pokedex = await pokeModel.find({}).sort({'id': 'asc'})
            return res.json(pokedex)
        } catch (error) {
            console.error(error)
        }
    })

    // - Create a Pokemon
    app.post('/api/v1/pokemon', async (req, res) => {

    })

    // - Get a Pokemon
    app.get('/api/v1/pokemon/:id', async (req, res) => {

    })
    // app.get('/api/v1/pokemonImage/:id')              // - get a pokemon Image URL
    // app.put('/api/v1/pokemon/:id')                   // - upsert a whole pokemon document
    // app.patch('/api/v1/pokemon/:id')                 // - patch a pokemon document or a
    //   portion of the pokemon document
    // app.delete('/api/v1/pokemon/:id')                // - delete a  pokemon
})