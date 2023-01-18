import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();
const dbURL = process.env.DATABASE_URL

const app = express();
const APP_PORT = 5000;
app.use(cors({ origin: true }));
app.use(express.json())
mongoose.Promise = global.Promise;
mongoose.connect(dbURL);
var ObjectId = mongoose.Schema.ObjectId;
// var number = mongoose.Schema.number;
// var Date = mongoose.Schema.Date;
// var String = mongoose.Schema.String;

let userSchema = new mongoose.Schema({
    _id: {type: ObjectId, required: true},
    firstName: {type: String, required: true}, // user's first name
    lastName: {type: String, required: true}, // user's last name
    email: {type: String, required: true}, // user's email
    password: {type: String, required: true} // user's password used only in level 3 and beyond
    // profilePicture? : String // pointer to user's profile picture in cloud storage --> used in Expert level | exlcluding for now
});

let User = mongoose.model("User", userSchema);

let animalSchema = new mongoose.Schema({
    _id: {type: ObjectId, required: true}, // animal's ID
    name: {type: String, required: true}, // animal's name
    hoursTrained: {type: Number, required: true}, // total number of hours the animal has been trained for
    owner: {type: ObjectId, required: true}, // id of the animal's owner
    dateOfBirth: {type: Date, required: true} // animal's date of birth | should be dateOfBirth?
    // profilePicture?: string // pointer to animal's profile picture in cloud storage --> used in Expert level | excluding for now
});

let Animal = mongoose.model("Animal", animalSchema);

let tlogSchema = new mongoose.Schema({
    _id: ObjectId, // training log's id
    date: Date, // date of training log
    description: String, // description of training log
    hours: Number, // number of hours the training log records
    animal: ObjectId, // animal this training log corresponds to
    user: ObjectId // user this training log corresponds to
    // trainingLogVideo?: string // pointer to training log video in cloud storage --> used in Expert level | excluding for now
});

let TrainingLog = new mongoose.model("TrainingLog", tlogSchema);

app.get('/', (req, res) => {
    res.json({"Hello": "World",
            "Version": 2})
})

// level 0
app.get('/api/health', (req, res) => {
    res.json({"healthy": true})
})

// level 1
app.post('/api/user', async (req, res) => {
    // console.log(req.body);
    try {
        var dat = await User.create(req.body);
        try {
            dat.save()
        } catch (err) {
            res.status(500).send("Status: 500 Error adding data to database")
        }
        res.status(200).send("Status: 200")
    }
    catch (err) {
        // console.log(err)
        res.status(400).send("Status: 400 Unable to add data, JSON validation error" )
    }
})

app.post('/api/animal', async (req, res) => {
    // console.log(req.body);
    try {
        var dat = await Animal.create(req.body);
        try {
            dat.save()
        } catch (err) {
            res.status(500).send("Status: 500 Error adding data to database")
        }
        res.status(200).send("Status: 200")
    }
    catch (err) {
        // console.log(err)
        res.status(400).send("Status: 400 Unable to add data, JSON validation error" )
    }
})

app.post('/api/training', async (req, res) => {
    // console.log(req.body);
    try {
        var dat = await TrainingLog.create(req.body);
        try {
            dat.save()
        } catch (err) {
            res.status(500).send("Status: 500 Error adding data to database")
        }
        res.status(200).send("Status: 200")
    }
    catch (err) {
        // console.log(err)
        res.status(400).send("Status: 400 Unable to add data, JSON validation error" )
    }
})

// level 2


app.listen(APP_PORT, () => {
    console.log(`api listening at http://localhost:${APP_PORT}`)
})