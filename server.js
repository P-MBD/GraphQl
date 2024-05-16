const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const app = express();
mongoose.connect('mongodb://127.0.0.1/graphql-project');
let schema = buildSchema(`

    type Query {
        user : User
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

let resolver = {
    user : () => {
        return {
            fname : "Ali",
            lname : "kiani"

        }
    }
}
app.use('/graphql', graphqlHTTP({
    schema : schema,
    rootValue : resolver,
    graphiql : true
 }))
app.listen(3000, () => {console.log('server run on port 3000 ...')});