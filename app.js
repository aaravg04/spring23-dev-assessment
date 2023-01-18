import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

dotenv.config();
const dbURL = process.env.DATABASE_URL

const app = express();
const APP_PORT = 5000;
app.use(cors({ origin: true }));
app.use(express.json())
mongoose.Promise = global.Promise;
mongoose.connect(dbURL);
var ObjectId = mongoose.Schema.ObjectId;
const salt = 5;
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
            dat["password"] = await bcrypt.hash(dat["password"], salt)
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
        // level 2
        let animalId = dat["animal"];
        let ownerId = dat["user"];
        if (Animal.find({"_id": animalId})["owner"] != ownerId) {
            res.status(400).sent("Status 400 Animal and Owner mismatch")
        }
        // end L2
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
app.get('/api/admin/users', async (req, res) => {
    // return all users in database (without passwords)
    // request should be formatted as {pageSize: int, lastId: id}
    try {
        let nPages = req.params["pageSize"];
        let lastId = req.params["lastId"];
        let response; 
        if (lastId == null) {
            response = await User.find().limit(nPages).select(["-password"]);
        } else {
            response = await User.find({"_id": lastId}).limit(nPages).select(["-password"]);
        }

        let nLastId = response[response.length - 1]["_id"];
        res.status(200).send({"pages": response, "lastId": nLastId});

    } catch (err) {
        res.status(500).send("Status 500 Error")
    }
})

app.get('/api/admin/animals', async (req, res) => {
    // return all users in database (without passwords)
    // request should be formatted as {pageSize: int, lastId: id}
    try {
        let nPages = req.body["pageSize"];
        let lastId = req.body["lastId"];
        let response; 
        if (lastId == null) {
            response = await Animal.find().limit(nPages);
        } else {
            response = await Animal.find({"_id": lastId}).limit(nPages);
        }

        let nLastId = response[response.length - 1]["_id"];
        res.status(200).send({"pages": response, "lastId": nLastId});

    } catch (err) {
        res.status(500).send("Status 500 Error")
    }
})

app.get('/api/admin/training', async (req, res) => {
    // return all users in database (without passwords)
    // request should be formatted as {pageSize: int, lastId: id}
    try {
        let nPages = req.body["pageSize"];
        let lastId = req.body["lastId"];
        let response; 
        if (lastId == null) {
            response = await TrainingLog.find().limit(nPages);
        } else {
            response = await TrainingLog.find({"_id": lastId}).limit(nPages);
        }

        let nLastId = response[response.length - 1]["_id"];
        res.status(200).send({"pages": response, "lastId": nLastId});

    } catch (err) {
        res.status(500).send("Status 500 Error")
    }
})

// level 3
app.post("/api/user/login", async (req, res) => {

    // request formatted as {"email": email, "password", password}
    // password encrypted with bcrypt thingy
    let email = req.body["email"]
    let password = req.body["password"]
    console.log(email, password);

    try {
        // hash password using salt from original hash stored with data to see if it matches
        // assuming that there is exactly 1 login/user per email with no repeat loggings
        let emailUser = await User.find({"email": email})[0];
        console.log(emailUser) 
        bcrypt.compare(password, emailUser["password"]).then(r => {
            if (r) {
                res.status(200).send("Status 200")
            } else {
                res.status(403).send("Status 403 Invalid email password combo")
            }
        })

    } catch (err) {
        res.status(403).send("Status 403 Invalid email password combo")
    }

})

app.post("/api/user/verify", async (req, res) => {

    // json web token

})

app.listen(APP_PORT, () => {
    console.log(`api listening at http://localhost:${APP_PORT}`)
})