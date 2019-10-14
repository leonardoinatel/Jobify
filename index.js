const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sqlite = require('sqlite')
const dbcon = sqlite.open('jobify.sqlite', { Promise })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/vaga/:id', async(Request, Response) => {
    const db = await dbcon
    const vaga = await db.get('select * from vagas where id = '+Request.params.id)
    Response.render('vaga', {
        vaga
    })
})

app.get('/admin', (req, res) => {
    res.render('admin/home')
})
app.get('/admin/vagas', async(req, res) => {
    const db = await dbcon
    const vagas = await db.all('select * from vagas;')
    res.render('admin/vagas', {vagas})

})

app.get('/admin/categorias', async(req, res) => {
    const db = await dbcon
    const categorias = await db.all('select * from categorias;')
    res.render('admin/categorias', {categorias})

})



app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbcon
    const categorias = await db.all('SELECT * from categorias')
    const vaga = await db.get('select * from vagas  where id = ' + req.params.id)
    res.render('admin/editar-vaga' , {categorias, vaga})
})

app.post('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbcon
    const { titulo, descricao, categoria} = req.body
    const { id }  = req.params

    await db.run(`UPDATE vagas SET categoria = ${categoria}, titulo = '${titulo}', descricao = '${descricao}'
                    WHERE id = ${id}`)

    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbcon
    const categorias = await db.all('SELECT * from categorias')
    res.render('admin/nova-vaga', {categorias})
})

app.post('/admin/vagas/nova', async(req, res) => {
    const db = await dbcon
    const { titulo, descricao, categoria} = req.body
    await db.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}','${titulo}','${descricao}')`)
    
    res.redirect('/admin/vagas')
})

app.get('/admin/categorias/nova', async(req, res) => {
    const db = await dbcon
    const categorias = await db.all('SELECT * from categorias')
    res.render('admin/nova-categoria', {categorias})
})

app.post('/admin/categorias/nova', async(req, res) => {
    db = await dbcon
    const {categoria} = req.body
    await db.run(`insert into categorias(categoria) values('${categoria}')`)
    
    res.redirect('/admin/categorias')
})

app.get('/', async(Request, Response) => {
    const db = await dbcon
    const categoriasDb = await db.all('select * from categorias;')
    const vagas = await db.all('select * from vagas;')
    const categorias = categoriasDb.map( cat => {
        return{
            ...cat,
            vagas: vagas.filter( vaga => vaga.categoria === cat.id)
        }
    })
    //console.log(categorias)
    Response.render('home', {
        categorias
    })
})

const init = async() => {
    const db = await dbcon
    //await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    //await db.run('create table if not exists vagas(id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    //const vaga = 'Social Media (San Francisco)'
    //const descricao = 'vaga para full stack developer para labs'
    //await db.run(`insert into categorias(categoria) values('${categoria}')`)
    //await db.run(`insert into vagas(categoria, titulo, descricao) values(2,'${vaga}','${descricao}')`)
    //await db.run('delete from vagas where id = 3')
}

init()
app.listen(5000, (err) => {
    if(err){
        console.log("Nao foi possivel iniciar o servidor")
    }else{
        console.log(" ---------  servidor do JobiFy rodando -------- ")
    }
})

//Inicio do Delete
app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbcon
    await db.run('delete from vagas where id = ' + req.params.id)
    res.redirect('/admin/vagas')
})
app.get('/admin/categorias/delete/:id', async(req, res) => {
    const db = await dbcon
    await db.run('delete from categorias where id = ' + req.params.id)
    res.redirect('/admin/categorias')
})
// Fim do delete