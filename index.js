const express = require('express')
const app = express()
const dotenv=require('dotenv');
const cors = require('cors');


app.use(cors());

dotenv.config();
const port = process.env.PORT
const rundb=require('./db');
rundb();

app.get('/', (req, res) => {
  res.send('Hello World  i am here!')
})
app.use(express.json());


app.use('/api',require("./Routes/CreateUser"))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


