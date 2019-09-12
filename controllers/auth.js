const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.signup = async (req, res) => {
    const userExists = await User.findOne({ email: req.body.email });

    if (userExists)
        return res.status(403).json({ error: 'Email is taken!' });

    const user = await new User(req.body);

    await user.save((err, user) => {
        if(err) {
            return res.status(400).json({ 
                err: errorHandler(err) });
        }

        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({ user });
    });

    res.status(200).json({ message: 'Signup success! Please login.' });
}

exports.signin = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: "User with that email does not exist. Please signup."
            });
        }

        if(!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and Password don't match."
            });
        }
        
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.cookie("t", token, { expire: new Date() + 9999 });
        const { _id, name, email, role } = user;
        return res.json({ token, user: { _id, email, name, role } });
    });
}

exports.signout = (req, res) => {
    res.clearCookie("t");
    res.json({ message: "Signout success." });
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth"
});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;

    if(!user) {
        return res.status(403).json({ error: "Access denied." });
    }

    next();
}

exports.isAdmin = (req, res, next) => {
    if(req.profile.role === 0) {
        return res.status(403).json({ error: "Admin resource!, access denied." });
    }

    next();
}