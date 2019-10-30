//config
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const mongoose =  require("mongoose");
const admin = require("./routes/admin");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagens")
const postagens = mongoose.model("postagens");
require("./models/Categoria");
const categorias = mongoose.model("categorias");
const usuarios = require("./routes/usuario")
const passport = require("passport");
require("./config/auth")(passport);


//Session
app.use(session({
    secret: "appnode",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//middleware
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null; 
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine("handlebars", handlebars({defaultLayout:'main'}))
app.set("view engine", 'handlebars')

//mongodb
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogApp").then(()=>{
    console.log("conectou");
}).catch((err)=>{
    console.log("Ocorreu um erro "+ err);
});

//public
app.use(express.static(path.join(__dirname,"bootstrap")));

//middleware
app.use((req, resp, next)=>{
    next();
});

//rotasmodels
app.use("/admin", admin)
app.use("/usuarios", usuarios)

//rotas
app.get("/", (req, res)=>{
    postagens.find().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("index", {postagens:postagens});
    }).catch((err)=>{
        console.log(err);
        res.flash("error_msg", "Houve um erro interno");
        res.redirect("/404");
    });
});
app.get("/404", (req,res)=>{
    res.send("ERRO 404!");
});

const port = 8089;
app.listen(port, ()=>{
    console.log("servidor rodando!");
});

app.get("/postagem/:titulo",(req,res)=>{
    postagens.findOne({titulo: req.params.titulo}).then((postagens)=>{
        if(postagens){
            res.render("postagem/index", {postagens:postagens});
        }else{
            req.flash("error_msg", "Essa postagem não existe");
            res.redirect("/");
        }
    }).catch((err)=>{
        req.flash("error_msg", "Essa postagem não foi exivida corretamente");
    })
});

app.get("/categorias", (req,res)=>{
    categorias.find().sort({nome:"asc"}).then((categorias)=>{
        res.render("categorias/index",{categorias:categorias});
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao buscar categorias");
        res.redirect("/")
    });
});

app.get("/categorias/:nome", (req,res)=>{
    categorias.findOne({nome: req.params.nome}).then((categoria)=>{
        console.log(categoria);
        if(categoria){
            postagens.find({categoria:categoria._id}).then((postagens)=>{
                console.log(postagens);
                res.render("categorias/postagens", {postagens:postagens, categorias:categoria});
            }).catch((err)=>{
                req.flash("error_msg", "não havia categoria para filtrar");
                res.redirect("/");
            });
        }else{
            req.flash("error_msg", "não havia categoria para filtrar");
            res.redirect("/");
        }
    });
});