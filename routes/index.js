const express = require('express');
const bcrypt = require("bcryptjs")
const router = express.Router();
const User = require("../models/user")
const Message = require("../models/message")
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const app = express()
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;


router.get('/', (req, res, next) => {
    res.render("index", { user: req.user })
})

router.get('/sign-up', (req, res, next) => {
    res.render("signup")
})

router.get('/join-club', (req, res, next) => {
    res.render("join_club", { user: req.user || app.get("CurrentUser") })
})

router.get('/login', (req, res, next) => {
    res.render('login')
})

router.get('/fail', (req, res, next) => {
    res.render('fail')
})

router.get('/create', (req, res, next) => {
    res.render('create')
})

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ userName: username });
            if (!user) {
                return done(null, false, { message: "Incorrect username" });
            };
            const match = await bcrypt.compare(password, user.hash)
            if (!match) {
                return done(null, false, { message: "Incorrect Password" })
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        };
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    };
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/fail'
}))

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

router.post("/create", [
    body('message')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Message is not long enough"),
    body('title')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Title is not long enough"),
    asyncHandler(async (req, res, next) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            return res.render("error", { msg: error.errors[0].msg })
        }
        const currentdate = new Date();
        const datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();

        const message = new Message({
            title: req.body.title,
            timestamp: datetime,
            text: req.body.message,
            user: req.user._id
        })
        await message.save()
        res.redirect('/')
    })
])

router.post('/join-club', [
    body('clubPass').custom(async (value) => {
        if (value !== "deez nuts") {
            throw new Error("Incorrect club password , Entry denied. Login with this account below and join club with correct password")
        }
    }),
    asyncHandler(async (req, res, next) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            const user = req.user || app.get('CurrentUser')
            await user.save()
            return res.render("error", { msg: error.errors[0].msg })
        }
        const user = req.user || app.get('CurrentUser')
        user.isMember = true;
        await user.save()
        app.set('CurrentUser', {})
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
                app.set("CurrentUser", user)
                res.redirect('/join-club')
            }
        })

    })
]
)


module.exports = router;