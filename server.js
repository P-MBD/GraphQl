const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const faker = require('faker');
const User = require('./model/users');
const Article = require('./model/articles');
const Comment = require('./model/comments');

const app = express();

mongoose.connect('mongodb://127.0.0.1/graphql-project');
let schema = buildSchema(`
    type Query {
        user : User
        getAllUser : [User]
        getUser(id : ID) : User
        FakeData : String
    }
    type User {
        fname : String
        lname : String
        age : Int
        gender : Gender
        email : String
        password : String
        comments : [Comment]
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
    type Comment {
        user : ID
        article : ID
        title : String
        body : String
    }

    type Article {
        user : ID
        title : String
        body : String
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
    },
    FakeData : () => {
        for(let i =0 ; i<=10 ;  i++){
            const addUser = new Article({
                //fname : faker.name.firstName(),
               // lname : faker.name.lastName(),
               // age : faker.random.number(),
                //email : faker.internet.email(),
                //password : faker.internet.password() ,      
             
                title : faker.lorem.sentence(),
                body : faker.lorem.text()
            })
            addUser.save();
        }
        return "data store ..."
    },
    getAllUser : async () => {
        const users = await  User.find({});
        return users;
    },
    getUser : async (args) => {
        const user = await User.findById(args.id)
        return user;
    }
}
app.use('/graphql', graphqlHTTP({
   schema : schema,
   rootValue : resolver,
   graphiql : true
}))


app.listen(3000, () => {console.log('server run on port 3000 ...')});