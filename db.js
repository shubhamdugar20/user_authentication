const mongoose = require('mongoose');
const dotenv=require('dotenv');
const uri=process.env.uri;


const rundb= async ()=>{
await mongoose.connect(uri);
console.log("connected");
 
}
module.exports=rundb;
