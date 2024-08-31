A user authentication system created using NodeJs ,ExpressJS and MongoDB.
Features- Register User , Login , and password reset

server port-> localhost:10000

APIS->

1. Register -> /api/createuser 
2. Login -> /api/login
3. forgotpassword-> /api/forgotpassword
4. resetpassword -> /api/resetpassword

Register -> used bcrypt to store Hashed password at MongoDB database for security.

Login -> if the login is successfull, a jwt token is generated for authentication throughout the app.

ResetPassword Functionality -> used nodemailer for sending reset token for changing password at the user email which has a certain validity.







