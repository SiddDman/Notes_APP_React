const express = require('express')
const User = require('../models/User')
const router = express.Router()
const { body, validationResult } = require('express-validator');//importing express-validator
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');//y not var(in tutorial taken var)
var fetchUser = require('../middleware/fetchUser')



const JWT_SECRET = '$iddIs@WebDev'
//JWT helps in facilitating secure communication btw client and user
//if user1 changes his username in search bar to user2 expecting to get  user2's info,JWT will note that the signature of user1 has changed
//and so will not send him any data of user2 

//ROUTE 1: Create a User using : POST "/api/auth/createUser". No login required
//Making array for validations
router.post('/createUser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters long').isLength({ min: 5 }),
], async (req, res) => {

    let success = false

    //If there are errors return bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {//due to this app will not crash
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        //Check whether the user with same email exists already
        let user = await User.findOne({ email: req.body.email })//used await as this is a promise
        // console.log(user)
        if (user) {
            return res.status(400).json({ success, error: 'Sorry a user with this email already exists,try a new email' })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt)

        //Create new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        //data/document retrieval from MongoDB would be fastest if we retireve it using ID
        success = true
        res.json({ success, authToken })//sending response

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

//ROUTE 2: Authenticate a User using: POST"/api/auth/login" No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false
    //If there are errors return bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {//due to this app will not crash
        return res.status(400).json({ errors: errors.array() });
    }

    //using destructuring to get email and password from body
    const { email, password } = req.body
    try {
        let user = await User.findOne({ email })//Await is IMP HERE
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials." })
        }
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials." })
        }

        //payload is data I will send to user
        const payload = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(payload, JWT_SECRET)//Await is IMP HERE
        success = true
        res.json({ success, authToken })//sending response

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }

})

//ROUTE 3:Get logged in User details using: POST"/api/auth/getUser" Login required

router.post('/getUser', fetchUser, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId).select("-password")
        res.send(user)

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})


module.exports = router