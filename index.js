var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var md5 = require('MD5')
var stripe = require('stripe')('sk_test_4P2z743HC1t3mxWcoXPD8bZv')
var db = require('mysql')

var connection = db.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'database'
});

// var loki = require('lokijs')
// var 
// var db = new loki('database',
//   {
//     autosave: true,
//     autosaveInterval: 1000,
//     autoload: true
//   })

// var db = require('./database.js')

// db.login("a","b")

var server = app.listen(3000, function () {
  console.log('Node.js is listening to PORT:' + server.address().port)
})

// var users = db.addCollection('users', { indices: ['email'] })
// var order = db.addCollection('users', { indices: ['orderId'] })

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.get('/', (req, res, next) => {
  res.json({
    state: 'nologin'
  })
})

app.post('/users/login', (req, res, next) => {
  console.log(req.body.email)
  if (!req.body.email) {
    res.json({err: 'no email'})
  } else if (!req.body.password) {
    res.json({err: 'no password'})
  }else {
    // res.json(db.login(req.body, res))
  connection.query('select * from users where `email` = ?' , [req.body.email], (err, resault, fields) => {
    if (err) throw err
    if (resault.length > 0) {
      if (resault[0].password == req.body.password) {
        res.json(resault)
      }else {
        res.json({err: 'error password'})
      }
    }else {
      res.json({err: 'not found this user'})
    }
  })
  }
})

app.post('/users/checkmail', (req, res, next) => {
  if (!req.body.email) {
    res.json({err: 'no email'})
  }else {
    connection.query('select * from users where `email` = ?' , [req.body.email], (err, resault, fields) => {
      if (err) throw err
      if (resault.length > 0) {
        res.json({err: 'email used'})
      }else {
        res.json({res: 'ok'})
      }
    })
  }
})

app.post('/users/reg', (req, res, next) => {
  if (!req.body.data1) {
    res.json({err: 'err step1'})
  }else if (!req.body.data2) {
    res.json({err: 'err data2'})
  }else {
    console.log(req.body)
  connection.query('INSERT INTO users (email, password, name, phonenumber, avatar) VALUES (?, ?, ?, ? ,?);',
      [
        req.body.data1.email,
        req.body.data1.passwd,
        req.body.data2.name,
        req.body.data2.phone,
        'http://bpic.588ku.com/element_origin_min_pic/01/31/87/96573b585a7c9c4.jpg'
      ],
      (err, result) => {
        if (err) throw err
        console.log(result)
        connection.query('INSERT INTO wallet (user_id, balance , cardnumber, expiresend, cvv2) VALUES (?, ? ,?, ?, ?)', [result.insertId, 0, req.body.data2.card, req.body.data2.ee, req.body.data2.cvv2], (err, result2) => {
          if (err) throw err
          console.log(result2)
          connection.query('select * from users where `id` = ?' , [result.insertId], (err, results, fields) => {
            if (err) throw err
            res.json(results)
          })
        })
      })
  }
})

app.post('/order/new', (req, res) => {
  console.log(req.body)
connection.query('INSERT INTO `order` (`userid`, `from`, `to`, `time`,`class`) VALUES (?, ?, ?, ?, ?);', [req.body.uid, req.body.from, req.body.to, Date.now(), req.body.class], (err, result, fileds) => {
  if (err) throw err
  res.json({id: result.insertId})
})
})

app.post('/order/maps', (req, res) => {
  console.log(req.body)
connection.query('SELECT * FROM `order` WHERE `id` = ?', [req.body.id], (err, result) => {
  if (err) throw err
  res.json({id: result})
})
})

app.post('/order/list', (req, res) => {
  console.log(req.body)
connection.query('SELECT * FROM `order` WHERE `userid` = ?', [req.body.id], (err, result) => {
  if (err) throw err
  res.json({id: result})
})
})

app.post('/order/ditail', (req, res) => {
  console.log(req.body)
connection.query('SELECT * FROM `order` WHERE `id` = ?', [req.body.id], (err, result) => {
  if (err) throw err
  res.json({id: result})
})
})

app.post('/order/pay', (req, res) => {

  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken // Using Express

  const charge = stripe.charges.create({
    amount: req.body.amount,
    currency: 'usd',
    description: req.body.des,
    source: token
  })

  res.json(charge)
})
