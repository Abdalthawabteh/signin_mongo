if(process.env.NODE_ENV !=='production')
{
    require('dotenv').config()
}

const express=require('express');
const app=express();
const passport=require('passport');
const bcrypt=require('bcrypt');
const flash=require('express-flash');
const session=require('express-session');
const methodoverride =require('method-override')
const mongoose=require('mongoose')
const User=require('./model/user')

mongoose.connect('mongodb://localhost:27017/sign-in-page')


const initializepassword=require('./passport_config');
const { Mongoose } = require('mongoose');
initializepassword(
    passport,
    email=>users.find(user=> user.email===email),
    id=>users.find(user=> user.id===id)
)



const users=[];


app.set('view-engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodoverride('_method'))


app.get('/',checkathuntekated,(req,res)=>{
res.render('index.ejs')
})
app.get('/signin',checknotathuntekated,(req,res)=>{
res.render('signin.ejs')
})
app.get('/signup',checknotathuntekated,(req,res)=>{
res.render('signup.ejs')
})
app.post('/signin',checknotathuntekated,passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/signin',
    failureFlash:true
}))
app.post('/signup',checknotathuntekated,async(req,res)=>{
    try{
        const hashpassword= await bcrypt.hash(req.body.password, 10)
        users.push({
            id:Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:hashpassword
        })
        res.redirect('/signin');
    }catch{
        res.redirect('/signup');
    }
})

app.delete('/logout',(req,res)=>{
    req.logout()
    res.redirect('/signin');
})

function checkathuntekated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/signin')
}
function checknotathuntekated(req,res,next){
    if(req.isAuthenticated()){
    return res.redirect('/')
    }
    next()

}

app.listen(3000)

