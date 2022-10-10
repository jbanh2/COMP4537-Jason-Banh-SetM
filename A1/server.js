const express = require('express')
const axios = require('axios');
const path = require('path');
const mongoose = require("mongoose");
const {exec} = require("child_process");

const app = express();
const port = 5000;

const { Schema } = mongoose;

app.listen(process.env.PORT || port, async () => {
    try {
        // Password:0IJz8N0ERBKHLFFg
        await mongoose.connect(
            'mongodb+srv://admin:0IJz8N0ERBKHLFFg@cluster0.luxox6n.mongodb.net/?retryWrites=true&w=majority'
        );
        mongoose.connection.dropDatabase();
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

    // Schema Creation
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

    // Model
    const pokeModel = mongoose.model('pokemon', pokemonSchema, "pokemons")

    // Populate Mongo
    await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json').then(
        async pokejson => {
            for (const pokemon of pokejson.data) {
                pokemon.base['Special Defense'] = pokemon.base['Sp. Defense']
                pokemon.base['Special Attack'] = pokemon.base['Sp. Attack']
                try {
                    await pokeModel.create(pokemon)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    )

    // Routes
    // Get pokemon
    app.get('/api/v1/pokemons', async (req, res) => {
        try {
            const pokedex = await pokeModel.find({}).sort({'id': 'asc'}).skip(req.query.after).limit(req.query.count)
            return res.json(pokedex)
        } catch (error) {
            console.error(error)
        }
    })

    // - Create a Pokemon
    app.post('/api/v1/pokemon', async (req, res) => {
        try {

        } catch (error) {
            console.error(error)
        }
    })

    // - Get a Pokemon
    app.get('/api/v1/pokemon/:id', async (req, res) => {

    })

    // - Get a pokemon Image URL
    app.get('/api/v1/pokemonImage/:id', async (req, res) => {
        try {

        } catch {

        }
    })

    // - Upsert a whole pokemon document
    app.put('/api/v1/pokemon/:id')

    // - Patch a pokemon document or a portion of the pokemon document
    app.patch('/api/v1/pokemon/:id')

    // - Delete a  pokemon
    app.delete('/api/v1/pokemon/:id')
})
