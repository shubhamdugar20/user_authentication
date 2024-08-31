const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    resetToken: {
        type: String,
        default: null 
    },
    resetTokenExpiry: {
        type: Date,
        default: null 
    }
});

module.exports = mongoose.model('User', UserSchema);
