if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const LocalStrategy = require('passport-local').Strategy
const methodOverride = require('method-override')
const session = require('express-session')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const mongoose=require('mongoose')
const User=require('./model/user')

app.use('/views',express.static('views'))

//connect to database mongoose
mongoose.connect(process.env.DATA_BASE)
const db=mongoose.connection
//set to let ejs files work
app.set('view-engine', 'ejs')
//use flasch to desplay the message when error done 
app.use(express.static(__dirname + '/public'));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//passport athuenticated.
passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy({usernameField:'email'},async function (email, password, done) {
  User.findOne({email },async function (err, user) {
		if (err) return done(err);
		if (!user) return done(null, false, { message: 'Incorrect username.' });
		await bcrypt.compare(password, user.password, function (err, res) {
			if (err) return done(err);
			if (res === false) return done(null, false, { message: 'Incorrect password.' });
			
			return done(null, user);
		});
	});
}));



app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    const{name,email,password:plaintextpass}=req.body

    
  try {
    const password = await bcrypt.hash(plaintextpass, 10)
    const user=await User.create({
      name,email,password
    })
    console.log(user)
    res.redirect('/login')
  } catch(error) {
    if(error.code===11000){
     
      res.redirect('/login');
      return;
    }throw console.log(error)
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)
