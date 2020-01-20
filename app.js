const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    { Client } = require('pg'),
    app = express();
    require('dotenv').config();

    //DB Connect String
const connect = `postgres://${process.env.DB_USERNAME}:${process.env.DB_USER_PASSWORD}@localhost/${process.env.DB_NAME}`;

const client = new Client({
    connectionString: connect
});
client.connect();


//Assign Dust Engine to .dust files

app.engine('dust', cons.dust);

//Set Default Ext .dust

app.set('view engine', 'dust');
app.set('views', __dirname + '/views');
                                    
//Set Public folder

app.use(express.static(path.join(__dirname, 'public')));

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, response) => {
    client.query('SELECT * FROM public.recipes', (err, res) => {
        if(err) {
            return console.error('Error running query', err);
        }
        response.render('index', {recipe: res.rows});
        //client.end()
    })
});

app.post('/add', async (req, res) => {
    client.query('INSERT INTO public.recipes(name, ingredients, directions) VALUES($1, $2, $3)', [req.body.name, req.body.ingredients, req.body.directions]);
    //client.end();
    res.redirect('/');
});

app.delete('/delete/:id', (req, res) => {
    client.query('DELETE FROM public.recipes WHERE id = $1', [req.params.id]);
    res.status(200);
});

app.post('/edit', (req, res) => {
    client.query('UPDATE public.recipes SET name=$1, ingredients=$2, directions=$3 WHERE id=$4', [req.body.name, req.body.ingredients, req.body.directions, req.body.id]);
    res.redirect('/');
});

// Server 
app.listen(process.env.PORT, () => {console.log(`Server started on port: ${process.env.PORT}`)});