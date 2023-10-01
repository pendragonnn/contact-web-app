const express = require("express");
const expressLayouts = require('express-ejs-layouts')
const { updateContacts, deleteContact, loadContact, findContact, addContact, duplicateCheck } = require('./utils/contacts')
const { check, validationResult, body }= require('express-validator')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

const app = express();
const port = 3000;

app.set("view engine", "ejs")
app.use(expressLayouts);
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser('secret'))
app.use(session({
  cookie: { maxAge: 6000 },
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(flash())

app.get("/", (req, res) => {
  const contact = loadContact()

  res.render('index', { 
    layout: 'layouts/main-layout',
    title: 'home',
    contact
  })
});

app.get("/about", (req, res, next) => {
  res.render('about', {
    layout: 'layouts/main-layout',
    title: 'About'
  })
});

app.get("/contact", (req, res) => {
  const contacts = loadContact()

  res.render('contact', {
    layout: 'layouts/main-layout',
    title: 'Contact',
    contacts,
    msg: req.flash('msg')
  })
});

app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Add Contact Form',
    layout: 'layouts/main-layout'
  })
})

app.post('/contact', [
    body('nama').custom((value) => {
      const duplicate = duplicateCheck(value)
      if(duplicate) {
        throw new Error('Contact name already use!')
      }
      return true
    }),
    check('email', 'Email is not valid').isEmail(), 
    check('phone', 'Phone number is not valid').isMobilePhone('id-ID'),
  ], 
  (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      res.render('add-contact', {
        title: 'Change Contact Form',
        layout: 'layouts/main-layout',
        errors: errors.array()
      })
    } else {
      addContact(req.body)
      
      req.flash('msg', 'Add contact success!')

      res.redirect('/contact')
    }
})

app.get('/contact/delete/:name', (req, res) => {
  const contact = findContact(req.params.name)

  if(!contact) {
    res.status(404)
    res.send('<h1>404</h1>')
  } else {
    deleteContact(req.params.name)
    req.flash('msg', 'Delete contact success!')
    res.redirect('/contact')
  }
})

app.get('/contact/edit/:name', (req, res) => {
  const contact = findContact(req.params.name)

  res.render('edit-contact', {
    title: 'Change Contact Form',
    layout: 'layouts/main-layout',
    contact
  })
})

app.post('/contact/update', [
    body('name').custom((value, { req }) => {
      const duplicate = duplicateCheck(value)
      if(value !== req.body.oldName && duplicate) {
        throw new Error('Contact name already use!')
      }
      return true
    }),
    check('email', 'Email is not valid').isEmail(), 
    check('phone', 'Phone number is not valid').isMobilePhone('id-ID'),
  ], (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      res.render('edit-contact', {
        title: 'Change Contact Form',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        contact: req.body
      })
    } else {
      updateContacts(req.body)
      
      req.flash('msg', 'Edit contact success!')

      res.redirect('/contact')
    }
})

app.get("/contact/:name", (req, res) => {
  const contact = findContact(req.params.name)
  
  res.render('detail', {
    layout: 'layouts/main-layout',
    title: 'Contact Detail',
    contact,
  })
});

app.use((req, res) => {
  res.render('not-found', {
    layout: 'layouts/main-layout',
    title: '404 Not Found',
  })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
