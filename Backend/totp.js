const otplib = require('otplib');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

exports.generate = () => {
  return otplib.totp.generate(secret);
};

exports.verify = (token) => {
  return otplib.totp.verify({ token, secret });
};