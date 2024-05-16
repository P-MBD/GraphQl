const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const app = express();
let schema = buildSchema(`

    type Query {
        user : User
        createUser : CreateUser
    }
    type User {
        fname : String
        lname : String
        age : Int
        gender : Gender
        email : String
        password : String
        posts : [Post]
    }
   type Post {
        user : ID
        title : String
        body : String
   } 
   enum Gender {
    Male
    Female
   }
   input CreateUser {
    fname : String
    lname : String
    age : Int
    gender : Gender
    email : String
    password : String
   }
`)

app.use('/graphql', graphqlHTTP({
    schema : schema,
 }))
app.listen(3000, () => {console.log('server run on port 3000 ...')});