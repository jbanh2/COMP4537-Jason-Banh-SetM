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
        mongoose.connection.db.dropDatabase();
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

    // Read/Write to local db
    const { writeFile, readFile } = require('fs')
    const util = require('util')
    const writeFileAsync = util.promisify(writeFile)
    const readFileAsync = util.promisify(readFile)

    // Create local empty db
    var pokedexJSON = []

    try {
        // Read the local pokedex and store entries
        pokedexJSON = await readFileAsync('./pokedex.json', 'utf-8')
        if (!pokedexJSON) {
          console.log("Could not read the file");
          return
        }
        pokedexJSON = JSON.parse(pokedexJSON)
        console.log(pokedexJSON);
      } catch (error) {
        console.log(error);
      }
      console.log(`Pokeapplistening on port ${port}`)

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
    // Get pokemons
    app.get('/api/v1/pokemons', async (req, res) => {
        try {
            const pokedex = await pokeModel.find({}).sort({'id': 'asc'}).skip(req.query.after).limit(req.query.count)
            return res.json(pokedex)
        } catch (error) {
            console.error(error)
            return res.json(error)
        }
    })

    // - Create a Pokemon
    app.post('/api/v1/pokemon', async (req, res) => {
        try {
            await pokeModel.create(req.body)
            console.log("After Create")
        } catch (error) {
            console.error(error)
            return res.json(error)
        }
    })

    // - Get a Pokemon
    app.get('/api/v1/pokemon/:id', async (req, res) => {
        let paramId = req.params.id
        try {
            // Check local database first
            for (var i; i < pokedexJSON.length; i++) {
                // Return pokemon if found
                if (pokedexJSON[i].id === paramId) {
                    return res.json(pokedexJSON[i])
                }
            }

            // Get Pokemon from server if does not exist
            const pokemon = await pokeModel.find({id: paramId}).exec()
            if (pokemon.length === 0) {
                throw("Pokemon not found!")
            }
            
            // Add the new pokemon
            pokedexJSON.push(pokemon)

            // Update File
            writeFileAsync('./pokedex.json', JSON.stringify(pokedexJSON), 'utf-8')
            .then(() => {
             })
            .catch((err) => { console.log(err); })

            // Return request
            res.json(pokemon)
        } catch (error) {
            console.error(error)
            return res.json(error)
        }
    })

    // - Get a pokemon Image URL
    app.get('/api/v1/pokemonImage/:id', async (req, res) => {
        let imageURL = "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/" + parseImageID(req.body.id)
        try {
            res.json(imageURL)
        } catch (error) {
            console.error(error)
            return res.json(error)
        }
    })

    // - Upsert a whole pokemon document
    app.put('/api/v1/pokemon/:id', async (req, res) => {
        let pokeID = req.body.id
        try {
            await pokeModel.updateOne({id: pokeID}, req.body, {upsert: true})
        } catch (error) {
            console.error(error)
            return res.json(error)
        }
    })

    // - Patch a pokemon document or a portion of the pokemon document
    app.patch('/api/v1/pokemon/:id', async (req, res) => {
        let pokeID = req.body.id
        let pokeEntry = req.body
        try {
            // Iterate through local pokedex
            for (var i; i < pokedexJSON.length; i++) {
                // If found overrite values
                if (pokedexJSON[i].id === pokeID) {
                    pokedexJSON[i] === pokeEntry
                }
            }
            return res.json(pokedexJSON)
        } catch (error) {
            console.error(error)
            return res.json(error)
        }
    })

    // This is a change

    // - Delete a pokemon
    app.delete('/api/v1/pokemon/:id', async (req, res) => {
        let pokeID = req.body.id
        try {
            for (var i; i < pokedexJSON.length; i++) {
                if (pokedexJSON[i].id === pokeID) {
                    delete pokedexJSON[i]
                    res.json("Successfully deleted pokemon!")
                }
            }
        } catch (error) {
            console.error(error)
            return res.json(error)
        }
    })
})

function parseImageID(id) {
    /**
     * Pads id with proper 0's to return a valid image URL
     *
     * @type {string}
     */
    let idString = "" + id
    return idString.padStart(3, '0')
}
