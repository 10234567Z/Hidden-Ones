const express = require('express');
const bcrypt = require("bcryptjs")
const router = express.Router();
const User = require("../models/user")
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const app = express()
router.get('/', (req, res, next) => {
    res.render("index")
})

router.get('/sign-up', (req, res, next) => {
    res.render("signup")
})

router.get('/join-club' , (req , res , next) => {
    res.render("join_club", { user: app.get("CurrentUser")})
})

router.post('/join-club' , [
    body('clubPass').custom(async (value) => {
        if(value !== "deez nuts"){
            throw new Error("Incorrect club password , Entry denied. Login with this account below and join club with correct password")
        }
    }),
    asyncHandler(async (req , res , next) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            const user = app.get('CurrentUser')
            await user.save()
            return res.render("error", { msg: error.errors[0].msg })
        }
        const user = app.get('CurrentUser')
        user.isMember = true;
        await user.save()
        app.set('CurrentUser' , {})
        res.render('success')
    })
])

router.post('/sign-up', [
    body('cpass').custom(async (value, { req }) => {
        if (value != req.body.pass) {
            throw new Error("Password confirmation does not match password");
        }
    }),
    body('uname').custom(async (value) => {
        let eUser = await User.findOne({ userName: value })
        if (eUser) {
            throw new Error('Username already exists')
        }
    }),
    asyncHandler(async (req, res, next) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            return res.render("error", { msg: error.errors[0].msg })
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
                app.set("CurrentUser" , user)
                console.log(req.body.isAdmin)
                res.redirect('/join-club')
            }
        })

    })
]
)


module.exports = router;