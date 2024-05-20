const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const cors = require('cors');
const { error } = require('console');
require("dotenv").config
const port = 4000;


app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://tnithin9640:21731a3547@cluster0.e9tz6lx.mongodb.net/");

//Api creation

app.get("/", (req, res) => {
    res.send("express is running");
})


const Users = mongoose.model('Users', {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    rollno: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

//Craeting endpoint for registering the user
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "an existing user found with same email adress" });
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.name,
        email: req.body.email,
        rollno: req.body.rollno,
        phone: req.body.phone,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })

})

//creating user login endpoint
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token })
        }
        else {
            res.json({
                success: false, error: "wrong password"
            });
        }
    }
    else {
        res.json({ success: false, errors: "wrong Email Id" });
    }
})

// Add a new endpoint for changing password
app.post('/change-password', async (req, res) => {
    try {
        const { userId, previousPassword, newPassword } = req.body;

        // Find the user by ID
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, errors: "User not found" });
        }

        // Check if the previous password matches the current password
        const passCompare = previousPassword === user.password;
        if (!passCompare) {
            return res.json({ success: false, error: "Previous password is incorrect" });
        }

        // Update the password
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, errors: "Internal server error" });
    }
});


app.listen(port, (error) => {
    if (!error) {
        console.log("server running at port : " + port)
    }
    else {
        console.log("error :" + error)
    }
})