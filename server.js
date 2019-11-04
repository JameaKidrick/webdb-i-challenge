const express = require('express');

const knex = require('./data/dbConfig.js');

const server = express();

server.use(express.json());

server.get('/', (req, res) => {
  res.send('<h3>DB Helpers with knex</h3>');
});

/*********************************************** MIDDLEWARE ***********************************************/
// ACCOUNT ID DOESN'T EXIST
function validateAccountID(req, res, next){
  knex
  .select('*')
  .from('accounts')
  .where('id', '=', req.params.id)
  .first()
  .then(accounts => {
    if(!accounts){
      res.status(404).json({ error: 'Invalid account ID' })
    }
  })
  .catch(err => {
    res.status(500).json({ error: 'Internal Server Error' })
  })
  next()
}

// ACCOUNT NAME ALREADY EXISTS IN DATABASE
function validateAccountName(req, res, next){
  knex
  .select('*')
  .from('accounts')
  .then(accounts => {
    if(accounts.find(item => item.name === req.body.name)){
      res.status(400).json({ error: 'An account with that name already exists in the database' })
    }else{
      next()
    }
  })
}

// MISSING INPUT DATA (NAME AND BUDGET)
function validateAccountInfo(req, res, next){
  const { name, budget } = req.body;
  if(!name || !budget){
    res.status(400).json({ error:"missing user data" })
  }else{
    next();
  }
}

/*********************************************** REQUEST HANDLERS ***********************************************/
// GET ALL ACCOUNTS
server.get('/api/accounts', (req, res) => {
  knex
    .select('*')
    .from('accounts')
    .then(accounts => {
      res.status(200).json(accounts)
    })
    .catch(err => {
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

// GET SPECIFIED ACCOUNTS
server.get('/api/accounts/:id', validateAccountID, (req, res) => {
  knex
    .select('*')
    .from('accounts')
    .where('id', '=', req.params.id)
    .first()
    .then(accounts => {
      if(accounts){
      res.status(200).json(accounts)
    }
    })
    .catch(err => {
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

// ADD NEW ACCOUNT
  // RETURNS NUMBER POSTED
server.post('/api/accounts', [validateAccountName, validateAccountInfo], (req, res) => {
  knex
    .insert(req.body, 'id')
    .into('accounts')
    .then(accounts => {
      return res.status(200).json(accounts)
    })
    .catch(err => {
      return res.status(500).json({ error: 'Internal Server Error' })
    })
})

// UPDATE ACCOUNT
  // RETURNS NUMBER UPDATED
server.put('/api/accounts/:id', [validateAccountID, validateAccountName, validateAccountInfo], (req, res) => {
  const changes = req.body;

  knex('accounts')
    .where({ id: req.params.id })
    .update(changes)
    .then(numberUpdated => {
      res.status(200).json(numberUpdated)
    })
    .catch(err => {
      res.status(500).json({ error: 'Internal Server Error' })
    })
})

// DELETE ACCOUNT
  // RETURNS NUMBER DELETED
  server.delete('/api/accounts/:id', validateAccountID, (req, res) => {
    knex('accounts')
      .where({ id: req.params.id })
      .del()
      .then(numberUpdated => {
        res.status(200).json(numberUpdated)
      })
      .catch(err => {
        res.status(500).json({ error: 'Internal Server Error' })
      })
  })

module.exports = server;