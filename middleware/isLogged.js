const isLoggedin = function (req, res, next) {
   if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl
      req.flash('error', "you need to be logged in")
      return res.redirect('/login')
   }
   next();
}





