const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria")
require("../models/Postagens")
const Categoria = mongoose.model("categorias");
const Postagem = mongoose.model("postagens");
const {isAdmin} = require("../helpers/isAdmin");

router.get("/", isAdmin,(req, res)=>{
    res.render("admin/index")
});

router.post("/posts", isAdmin,(req, res)=>{
    res.send("Pagina posts")
});


router.get("/categorias", isAdmin,(req, res)=>{
    Categoria.find().sort({date:"desc"}).then((categorias)=>{
        res.render("admin/categorias",{categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg", "não foi possivel listar as categorias");
        console.log("não foi possivel listar as categorias "+err);
    });
});

router.get("/categorias/add", isAdmin,(req, res)=>{
    res.render("admin/addcategorias")
});

router.post("/categorias/add", isAdmin,(req, res)=>{

    //feito validação em dis IFS para orginzar melhor
        var erros = [];
        if(!req.body.nome || req.body.nome == null || typeof req.body.nome == undefined || req.body.nome.length <=0){
            erros.push({texto:"Nome Inválido"});
        }
    
        if(!req.body.slug || req.body.slug == null || typeof req.body.slug == undefined || req.body.slug.length <=0){
            erros.push({texto:"Slug Inválido"});
        }
    
        if(erros.length > 0){
            res.render("admin/addCategorias", {erros: erros});
        }else{
            const novaCategoria ={
                nome: req.body.nome,
                slug: req.body.slug
            }
            new Categoria(novaCategoria).save().then(()=>{
                console.log("Salvo dado com sucesso");
                req.flash("success_msg", "Categoria criada com sucesso")
                res.redirect("/admin/categorias");
            }).catch((err)=>{
                req.flash("error_msg","Erro ao salvar categoria, tente novamente")
                console.log("Erro ao persistir o dado "+ err);
            });
        }
    });


router.get("/categorias/edit/:id", isAdmin,(req,res)=>{
    Categoria.findOne({_id:req.params.id}).then((categoria)=>{
        res.render("admin/edicaoCategorias", {categoria: categoria});
    }).catch((err)=>{
        req.flash("error_msg", "Esta categoria não existe");
    });    
});


router.post("/categorias/editar", isAdmin,(req,res)=>{
    var erros = [];
    if(!req.body.nome || req.body.nome == null || typeof req.body.nome == undefined || req.body.nome.length <=0){
        erros.push({texto:"Nome Inválido"});
    }

    if(!req.body.slug || req.body.slug == null || typeof req.body.slug == undefined || req.body.slug.length <=0){
        erros.push({texto:"Slug Inválido"});
    }

    if(erros.length > 0){
        req.flash("error_msg", "Passou aqui essa porra");
    }else{
        Categoria.findOne({_id:req.body.id}).then((categoria)=>{
            categoria.nome = req.body.nome,
            categoria.slug = req.body.slug
            categoria.save().then(()=>{
                req.flash("success_msg", "Categoria editada com sucesso");
                res.redirect("/admin/categorias");
            });
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao editar categoria");
        }); 
    }
    
});


router.post("/categorias/delete", isAdmin,(req,res)=>{
    Categoria.remove({_id:req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso");
        res.redirect("/admin/categorias");
    }).catch((err)=>{
        req.flash("error_msg", "Não foi possivel deletar a categoria "+ err);
        res.redirect("/admin/categorias");
    });
});


router.get("/postagens", isAdmin,(req,res)=>{
    Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("admin/postagens",{postagens:postagens});
    }).catch((err)=>{
        req.flash("Não possivel buscar as postagens");
        res.redirect("/admin");
    });;
});

router.get("/postagens/add", isAdmin,(req,res)=>{
    Categoria.find().then((categorias)=>{
        res.render("admin/AddPostagens", {categorias:categorias});
    }).catch((err)=>{
        req.flash("Não possivel buscar as categorias");
    });
});

router.post("/postagens/nova", isAdmin,(req,res)=>{

    var erros = [];
    // if(!req.body.categorias || req.body.categorias == null || typeof req.body.categorias == undefined || req.body.categorias.length <=0){
    //     erros.push({texto:"Categoria Inválido"});
    // }
    if(erros.length > 0){
        res.render("admin/AddPostagens", {erros:erros});
        req.flash("error_msg", "Deu erro ao salvar a postagem");
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            data: req.body.data
        }
        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Postagem criada com sucesso");
            res.render("admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Deu erro ao salvar a postagem");
            console.log("passou aqui e deu erro "+ err);
        });
    }
});

router.get("/postagens/editar/:id",isAdmin,(req,res)=>{
    Postagem.findOne({_id:req.params.id}).then((postagens)=>{
        Categoria.find().then((categorias)=>{
            res.render("admin/editarPostagens",{postagens:postagens, categorias:categorias})
        });
    });
});

router.post("/postagens/editar",isAdmin,(req,res)=>{
    Postagem.findOne({_id:req.body.id}).then((postagens)=>{
        postagens.titulo = req.body.titulo,
        postagens.conteudo = req.body.conteudo,
        postagens.descricao = req.body.descricao
        postagens.categoria = req.body.categoria
        postagens.save().then(()=>{
            req.flash("success_msg", "Postagem editada com sucesso");
            res.redirect("/admin/postagens");
        }).catch((err)=>{
            console.log("deu erro ao editar "+ err);
            req.flash("error_msg", "Houve erro ao editar postagem");
        });
    });
});

router.post("/postagens/excluir",isAdmin,(req, res)=>{
    console.log("erro ao deletar "+req.body.id)
    Postagem.remove({_id:req.body.id}).then(()=>{
        req.flash("success_msg", "Postagem deletada com sucesso");
        res.redirect("/admin/postagens");
    }).catch((err)=>{
        console.log("erro ao deletar "+err)
    });
});

module.exports = router;