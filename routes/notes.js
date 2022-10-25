const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');//importing express-validator
const fetchUser = require('../middleware/fetchUser')
const Note = require('../models/Note')

//ROUTE 1: Get all the Notes using: GET "/api/notes/getuser",Login required
router.get('/fetchAllNotes', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

//ROUTE 2:Add a new Note using: POST "/api/notes/addNote",Login required
router.post('/addNote', fetchUser, [
    body('title', 'Enter a valid name').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body
        //If there are errors return bad Request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {//due to this app will not crash
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const saveNote = await note.save()
        res.json(saveNote)

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

//ROUTE 3:Update an existing Note using: PUT "/api/notes/updateNote",Login required
router.put('/updateNote/:id', fetchUser, async (req, res) => {
    const { title, description, tag } = req.body
    try {
        //Create New note object
        const newNote = {}
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        //Find the note to be updated and update it
        let note = await Note.findById(req.params.id)
        if (!note)
            res.status(404).send("Not Found")

        if (note.user.toString() !== req.user.id)
            return res.status(401).send("Not Allowed")

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })

        res.json({ note })

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

//ROUTE 4:Delete an existing Note using: PUT "/api/notes/deleteNote",Login required
router.delete('/deleteNote/:id', fetchUser, async (req, res) => {
    try {
        //Find the note to be deleted and update it
        let note = await Note.findById(req.params.id)
        if (!note)
            res.status(404).send("Not Found")

        //Allow deletion if the user that created the note is requesting to delete it
        if (note.user.toString() !== req.user.id)
            return res.status(401).send("Not Allowed")

        note = await Note.findByIdAndDelete(req.params.id)

        res.json({ "Success": "Note " + note.user.toString() + " has been deleted" })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router