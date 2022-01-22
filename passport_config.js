const localStrategy=require('passport-local').Strategy;
const bcrypt=require('bcrypt');

function initialize(passport,getUserByEmail,getUserById)
{
 const finduser=async(email,password,done)=>{
     const user=getUserByEmail(email)
     if(user==null){
         return done(null,false,{message:'no user with this email'})
     }

     try{
    
         if(await bcrypt.compare(password,user.password)){
             return done(null,user);
         }else
         {
             return done(null,false,{message:'incorecct password'});
         }
     }catch(e){
         return done(e);
     }
 }
 passport.use(new localStrategy({usernameField:'email'},finduser))
 passport.serializeUser((user,done)=>done(null,user.id))
 passport.deserializeUser((id,done)=>{
     return done(null,getUserById(id))
    })
}
module.exports=initialize;