// this module does NOT include a complete set of dependencies
// the including module must be based on app-container and
// include what is necessary, this module is broken out like this
// so it can be used in test environments where necessary
module.exports = function(container,test) {
    var debug = require('debug')('login'),
        AppContainer = require('app-container'),
        User = AppContainer.userModel(),
        app = container.app(),
        passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy;

    passport.use(new LocalStrategy(
        function(username,password,done) {
            debug('login(%s,%s)',username,(!!password ? '****' : ''));
            User.findOne({
                email: username
            },function(err,user){
                if(err) {
                    return done(err);
                }
                debug('found user %s',user);
                if(!user) {
                    return done(null,false,{ message: 'Unknown username or password.'});
                }
                user.validatePassword(password,function(err,res){
                    if(!res) {
                        return done(null, false, { message: 'Unknown username or password.' });
                    }
                    return done(null,user);
                });
            });
        }
    ));

    app.post('/login',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
       })
    );

    if(test) {
        app.get('/logout', function(req, res){
          req.logout();
          res.redirect('/');
        });
    }
};