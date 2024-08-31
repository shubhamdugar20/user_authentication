const express = require('express');
const router = express.Router();
const User = require('../models/UserM');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const jwtsecret = process.env.secret;
const crypto = require('crypto');
const nodemailer = require('nodemailer');


router.post("/createuser", [
    body('name').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password', 'incorrect password').isLength({ min: 5 })
  
  ]
    , async (req, res) => {
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const salt=await bcrypt.genSalt(10);
      let secPassword=await bcrypt.hash(req.body.password,salt);
      try {
        await User.create({
          name: req.body.name,
          email: req.body.email,
          password: secPassword,
          location: req.body.location
  
  
  
        })
        res.json({ success: true })
  
      } catch (error) {
        console.log(error);
        res.json({ success: false })
  
  
  
      }
  
  
  
    })
  
  
  router.post("/login", async (req, res) => {
    let email = req.body.email;
    try {
      let userdata = await User.findOne({ email });
      if (!userdata) {
        return res.status(400).json({ errors: "Try logging with correct credentials" })
      }
  
      let valid = await bcrypt.compare(req.body.password, userdata.password);
  
      if(valid==false)
      {
        return res.status(400).json({ errors: "Try logging with correct credentials" })
      }
      const data={
        user:{
          id:userdata.id
        }
      }
  
     
      const authToken=jwt.sign(data,jwtsecret);
      
      return res.json({ success: true,authToken })
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  
  })



const generateToken = () => {
  return crypto.randomBytes(4).toString('hex'); 
};


router.post("/forgotpassword", [
  body('email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ errors: "User with this email does not exist" });
    }

    
    const resetToken = generateToken();
    const resetTokenExpiry = Date.now() + 3600000;
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    await user.save();

   
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email,
      subject: 'Password Reset',
      text: `Your password reset token is ${resetToken}. It is valid for 1 hour.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: "Failed to send email" });
      } else {
        console.log('Email sent: ' + info.response);
        return res.json({ success: true, message: "Password reset token sent to email" });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});


router.post("/resetpassword", [
  body('email').isEmail(),
  body('token').isLength({ min: 8 }),
  body('newPassword', 'Password must be at least 5 characters long').isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let user = await User.findOne({
      email: req.body.email,
      resetToken: req.body.token,
      resetTokenExpiry: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ errors: "Invalid token or token has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    user.resetToken = undefined; 
    user.resetTokenExpiry = undefined;

    await user.save();

    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;
