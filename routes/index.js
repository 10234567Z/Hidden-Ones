const express = require('express');
const bcrypt = require("bcryptjs")
const router = express.Router();
const User = require("../models/user")
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

router.get('/', (req, res, next) => {
    res.render("index")
})

router.get('/sign-up', (req, res, next) => {
    res.render("signup")
})

router.post('/sign-up', [
    body('cpass').custom(async (value, { req }) => {
        if (value != req.body.pass) {
            throw new Error("Password confirmation does not match password");
        }
    }),
    body('uname').custom(async (value, { req }) => {
        let eUser = await User.findOne({ userName: value })
        if (eUser) {
            throw new Error('Username already exists')
        }
    }),
    asyncHandler(async (req, res, next) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            return res.render("error" , { msg: error.errors[0].msg})
        }
        bcrypt.hash(req.body.pass, 10, async (err, hashedPassword) => {
            if (err) {
                return next(err)
            }
            else {
                const user = new User({
                    firstName: req.body.fname,
                    lastName: req.body.lname,
                    userName: req.body.uname,
                    isMember: false,
                    hash: hashedPassword,
                    isAdmin: req.body.isAdmin,
                })
                await user.save()
                res.redirect('/')
            }
        })

    })
]
)

module.exports = router;