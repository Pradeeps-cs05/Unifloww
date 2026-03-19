const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

console.log({ CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN });

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "kalidasrajen@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "UniFloww <kalidasrajen@gmail.com>",
      to: "kalidasgeetha1992@gmail.com",
      subject: "secret Test Email",
      text: "Hello from Node.js!",
      html: "<h1>Hello from Node.js!</h1>",
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}


sendMail()
  .then((result) => console.log("Email sent...", result))
  .catch((error) => console.log(error));  