const mongoose = require("mongoose")
const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const Todo = require('./models/todo');
const ejsMate = require('ejs-mate');
const session = require('express-session')
//const Joi = require('joi');
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user');
const catchAsync = require("./utils/catchAsync");
const ExpressError = require('./utils/ExpressError');

const isLoggedin = function (req, res, next) {
    if (!req.isAuthenticated()) {
       //req.session.returnTo = req.originalUrl
       req.flash('error', "you need to be logged in")
       return res.redirect('/login')
    }
    next();
 }

//db connect
mongoose.connect('mongodb://localhost:27017/todoapp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Todo Database connected");
});

//express and other app config
const app = express();

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))
//To parse form data in POST request body:
app.use(express.urlencoded({ extended: true }))
// To parse incoming JSON in POST request body:
app.use(express.json())
// Views folder and EJS setup:
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

//session
const sessionConfig = {
    secret : 'asecret',
    resave : false,
    saveUninitialized : true,
    cookie:{
        httpOnly : true,
        expires : Date.now() + 1000 * 60 *60 *24 * 7,
        maxAge : 1000 * 60 *60 *24 * 7
    }
}
app.use(session(sessionConfig))

//passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//flash
app.use(flash());
app.use((req,res,next) =>{
    //console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})



//routes
app.get("/", (req, res) => {
    res.render("todos/home")
})


app.get("/todo/:id/list/new",isLoggedin, async(req, res) => {
    const id = req.params.id
    const user = await User.findById(id)
    res.render("todos/new", {user})
})

app.post("/todo/:id/list",isLoggedin,catchAsync( async (req,res)=>{
    const id = req.params.id
    const user = await User.findById(id)
    const {item} = req.body
    const newTodo = new Todo({item});
    newTodo.author = user._id;
    user.todos.push(newTodo)
    await newTodo.save()
    await user.save()
    req.flash("success", "made todo")
    res.redirect("/todo/"+user._id+"/list/new")
  }))
  

app.get("/todo/:id",isLoggedin, async(req, res) => {
    const user = await User.findById(req.params.id).populate("todos")
    res.render("todos/index",{user})
})

// app.get("/todo/:id/edit",isLoggedin, async(req, res) => {
//     const user = await User.findById(req.params.id).populate("todos")
//     res.render("todos/edit", {user})

// })

// app.patch("/todo/:id",isLoggedin, async(req, res) => {
//     console.log(req)
//     const user = await User.findById(req.params.id).populate("todos")
//     res.redirect("/todo/"+ user._id + "/edit")

// })











//register
app.get("/register", (req,res)=>{
    res.render("users/register")
 })

 app.post("/register",catchAsync( async(req,res)=>{
    try {
        const {email,username,password} = req.body
        const user = User({email, username}) 
        const registeredUser = await User.register(user,password)
        req.login(registeredUser, (err) => {
            if (err) { return next(err); }
            req.flash("success", "logged in successfully")
            res.redirect("/todo/"+registeredUser._id+"/list/new")
        });
       
    } catch (e) {
        req.flash("error", e.message)
        res.redirect("/register")
    }
 }))

 //login
 app.get("/login", (req,res)=>{
    res.render("users/login")
 })

 app.post("/login",passport.authenticate('local', { failureFlash: true, failureRedirect: "/login" }),catchAsync( async(req,res)=>{
    //req.flash("success", "welcome back")
    const user = await User.findById(req.user._id)
   res.redirect("/todo/"+ user._id +"/list/new")
 }))

 app.get("/logout",(req, res, next) => {
    req.logout();
    res.redirect('/')
})




 //error handling
app.all('*', (req, res, next) => {
    //next(new ExpressError('Page Not Found', 404))
    res.send("page not found")
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


//localhost port listen
app.listen(3000, () => {
    console.log("TODO APP SERVER RUNNING")
})