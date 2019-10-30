const express = require("express");
const router = express.Router();
const mongoose  = require("mongoose");
const bcrypt = require("bcryptjs");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const passport = require("passport");

router.get("/registro", (req, res)=>{
    res.render("usuarios/registro")

});

router.post("/registro", (req, res)=>{
    const erros = [] 
    if(!req.body.nome || req.body.nome == null || req.body.nome == undefined){
        erros.push({texto:"Nome inválido"}); 
     }
     if(!req.body.email || req.body.email == null || req.body.email == undefined){
        erros.push({texto:"Email inválido"}); 
     }
     if((!req.body.senha || req.body.senha == null || req.body.senha == undefined)){
        erros.push({texto:"Senha inválido"}); 
     }
     if(req.body.senha < 6){
        erros.push({texto:"Senha deve ter no minimo 6 caracters"}); 
     }
     if(req.body.senha != req.body.confirmaSenha){
        erros.push({texto:"Senhas não são compativeis"}); 
     }

     if(erros.length > 0){
        res.render("usuarios/registro", {erros:erros});
     }else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash("error_msg", "Esse email já foi cadastrado");
                res.redirect("usuarios/registro");
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });
                bcrypt.genSalt(10, (erro, salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                        if(erro){
                            req.flash("error_msg", "erro ao hash a senha do usuario");
                            res.redirect("/");
                        }else{
                            novoUsuario.senha = hash;
                            novoUsuario.save().then(()=>{
                                console.log("Salvo dado com sucesso");
                                req.flash("success_msg", "Usuario criado com sucesso")
                                res.redirect("/admin/categorias");
                            }).catch((err)=>{
                                req.flash("error_msg","Erro ao salvar usuario, tente novamente")
                                console.log("Erro ao persistir o dado "+ err);
                            });
                        }
                    });
                });
            }
        }).catch((err)=>{
            console.log(err);
            req.flash("error_msg", "Houve um erro ao cadastrar o usuario no BD");
        });
     }
});

router.get("/login", (req, res)=>{
    res.render("usuarios/login");
});

router.post("/login", (req, res, next)=>{
    passport.authenticate("local",{
        successRedirect: "/",
        failureRedirect: "usuarios/login",
        failureFlash: true
    })(req, res, next)
});

router.get("/logout", (req,res)=>{
    req.logOut();
    req.flash("success_msg", "Deslogado com sucesso");
    res.redirect("/");
});

module.exports = router;