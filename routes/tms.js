const express = require('express')
const router = express.Router()
const axios = require('axios')
const engine = axios.create({
  baseURL: process.env.TMS_URL,
  headers: {'X-Auth-Token': process.env.TMS_KEY}})
const recipientHelper = require('../helpers/recipient_helper')

console.log('TMS baseURL set to ' + process.env.TMS_URL)

router.get('/', function(req, res){
  res.render('../views/home')
})

router.get('/fa', function(req, res){
  return engine
      .get('/from_addresses')
      .then(function(result){
        res.render('../views/account_info', {data: result.data})
      }).catch(function(error){
        recipientHelper.log('error getting data from TMS: did you set TMS_KEY?', error)
        res.redirect('/')
      })
})

router.get('/m', function(req, res){
  return engine
      .get('/messages/email')
      .then(function(result){
        res.render('../views/email_messages', {data: result.data})
      }).catch(function(error){
        recipientHelper.log('error getting data from TMS: did you set TMS_KEY?', error)
        res.redirect('/')
      })
})

router.get('/s', function(req, res){
  return engine
      .get('/messages/sms')
      .then(function(result){
        res.render('../views/sms_messages', {data: result.data})
      }).catch(function(error){
        recipientHelper.log('error getting data from TMS: did you set TMS_KEY?', error)
        res.redirect('/')
      })
})

router.get('/newe', function(req, res){
  res.render('../views/new_email_message')
})

router.get('/slurpe', function(req, res){
  return recipientHelper.populateRecipients(engine)
    .then(function(sr) {
      res.redirect('/')
    })
    .catch(function(error){
      recipientHelper.log('error getting data from TMS: did you set TMS_KEY?', error)
      res.redirect('/')
    })
})

router.post('/', function(req, res){
  const recipients = []
  req.body['recipients'].split(',').map((email) => {
    recipients.push({ email: email })
  })

  const email_message = {
    subject: req.body['subject'],
    body: req.body['body'],
    recipients: recipients
  }

  return engine
    .post('/messages/email', email_message)
    .then(function(result){
      res.redirect('/m')
    }).catch(function(error){
      recipientHelper.log('error getting data from TMS: did you set TMS_KEY?', error)
      res.redirect('/')
    })
})

router.get('/saved_messages', function(req, res){
  recipientHelper.readMessages()
    .then(function(messages) {
      res.render('../views/email_messages', {data: messages})
    })
})

router.get('/e/:message_id', function(req, res){
  return engine
    .get('/messages/email/' + req.params.message_id)
    .then(function(result){
      res.render('../views/email_message', {data: result.data})
    }).catch(function(error){
      recipientHelper.log('error getting data from TMS: did you set TMS_KEY?', error)
      res.redirect('/')
    })
})

router.get('/search_recipients', function(req, res) {
  res.render('../views/search_recipients')
})

router.get('/searche', function(req, res) {
  return recipientHelper.findRecipients(req.query.email)
    .then(function(recipients) {
      return recipientHelper.executePromises(recipientHelper.decorateRecipients(recipients))
    })
    .then(function(recipients) {
      res.render('../views/recipients', {data: recipients, email: req.query.email})
    }).catch(function(error){
      recipientHelper.log('error getting data from TMS recipients: ', error)
      res.redirect('/')
    })
})


module.exports = router
