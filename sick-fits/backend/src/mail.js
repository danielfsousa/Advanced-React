const nodemailer = require('nodemailer')
const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env

exports.transport = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PASS,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
  }
})

exports.makeANiceEmail = text => `
  <div class="email" style="
    border: 1px solid black;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2;
    font-size: 20px;
  ">
    <h2>Hello there!</h2>
    <p>${text}</p>
  </div>
`
