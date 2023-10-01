const fs = require('fs')

const dirPath = './data'
if(!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath)
}

const dataPath = './data/contacts.json'
if(!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf-8')
}

const loadContact = () => {
  const fileBuffer = fs.readFileSync('data/contacts.json', 'utf-8')
  const contacts = JSON.parse(fileBuffer)
  return contacts
}

const findContact = (name) => {
  const contacts = loadContact()
  const contact = contacts.find(
    (contact) => contact.name === name
  )

  return contact
}

const saveContacts = (contacts) => {
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts))
}

const addContact = (contact) => {
  const contacts = loadContact()
  contacts.push(contact)
  saveContacts(contacts)
}

const duplicateCheck = (name) => {
  const contacts = loadContact()
  return contacts.find((contact) => contact.name === name)
}

const deleteContact = (name) => {
  const contacts = loadContact()
  const filteredContacts = contacts.filter((contact) => contact.name !== name)

  saveContacts(filteredContacts)
}

const updateContacts = (newContact) => {
  const contacts = loadContact()

  // create new array that not inlude the new updated data
  const filteredContacts = contacts.filter((contact) => contact.name !== newContact.oldName)
  
  delete newContact.oldName

  filteredContacts.push(newContact)

  saveContacts(filteredContacts)
}

module.exports = {
  loadContact,
  findContact,
  addContact,
  duplicateCheck,
  deleteContact,
  updateContacts
}