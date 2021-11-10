const express = require('express');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors')
// const knex = require('knex');
app.use(express.urlencoded({ extended: false }));
app.use(cors());


const knex = require('knex');
const { response } = require('express');
const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        port: 5432,
        user: 'postgres',
        password: 'Ankush',
        database: 'smart-brain'
    }
});
// // p.select('*').from('users')
// // console.log(p.select('*').from('users'))
// db.select('*').from('users')
//     .then(data => {
//         console.log(data);
//     });


app.use(express.json());


app.post('/signin', (req, res) => {
    // // res.json('welcome to signIn page');

    // bcrypt.compare("bacon", "hash", function (err, res) {
    //     // res == true
    //     // console.log('true');
    // });
    // bcrypt.compare("veggies", "hash", function (err, res) {
    //     // res = false
    //     // console.log('nope');
    // });

    // if (((req.body.email) === database.users[1].email) && ((req.body.password) === database.users[1].password)) {
    //     console.log(database.users[1]);
    //     res.json(database.users[1]);
    //     // res.json('Success');
    // } else {
    //     res.status(404).json('Fail');
    // }

    // console.log('hellooo');
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('incorrect form submission');
    }
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            // console.log(password);
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            console.log(isValid);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        console.log(user[0]);
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to get user'))
            }
            else {
                res.status(400).json('wrong credentials')
            }
        })
        .catch(err => console.log(err))

});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    var hash = bcrypt.hashSync(password);
    // Transactions : if there are multiple tables, then if one fails -> all should fail.
    // const { email, name, password } = req.body;
    
    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
    }
    db.transaction(trx => {
        trx
            .insert({
                hash: hash,
                email: email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0],
                        name: name,
                        joined: new Date()
                    })
                    .then(user => res.json(user[0]))
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('err'));

    // database.users.push({
    //     id: "125",
    //     name: name,
    //     email: email,
    //     password: password,
    //     enteries: 0,
    //     joined: new Date()
    // })




});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let flag = false;
    database.users.forEach(user => {
        if (user.id === id) {
            flag = true;
            return res.json(user);
        }
    })

    if (!flag) {
        res.status(404).json('Nope Not Found!');
    }
});

app.put('/image', (req, res) => {
    // console.log(req.body, 'the body');
    const { id } = req.body;
    // let flag = false;
    // database.users.forEach(user => {
    //     // console.log(user.id, id);
    //     if (user.id === id) {
    //         flag = true;
    //         user.enteries++;
    //         // console.log(user.enteries);
    //         return res.json(user.enteries);
    //     }
    // })

    // if (flag === false) {
    //     res.status(404).json('Nope Not Found! 2');
    // }

    db('users')
        .where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0]);
        })
        .catch(err => res.json('Uh Oh'));

})

// bcrypt.hash("bacon", null, null, function (err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function (err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function (err, res) {
//     // res = false
// });

app.listen(3000, () => {
    console.log('app is running on PORT 3000');
})

/*
    API PLAN:
    '/' = this is working
    /signin POST = success/fail
    /register POST = user Input
    /profile/:userId GET = user
    /image PUT = updated user object (count)
*/