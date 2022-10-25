const jwt = require('jsonwebtoken');
//Should be stored as a environment variable(.env.local),shouldnt be hardcoded.Store it like we stored the apiKey in Newsapp
const JWT_SECRET = '$iddIs@WebDev'
//
const fetchUser = (req, res, next) => {
    //Get the user from the jwt token and add id to the requested object
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ error: "Pease authenticate using a valid token." })
    }

    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user
        next()
    } catch (error) {
        res.status(401).send({ error: "Pease authenticate using a valid token." })
    }
}

module.exports = fetchUser