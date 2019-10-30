module.exports = {isAdmin: function(req, res, next){
    if(req.isAuthenticated() && req.usarios.isAdmin == 1){
        return next();
    }

    req.flash("error_msg", "Você deve estar logado e ser admin para entrar aqui");
    res.redirect("/");
}}