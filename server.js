const express = require('express');
// const graphqlHTTP = require('express-graphql');
// const { buildSchema } = require('graphql');
// const { makeExecutableSchema } = require('graphql-tools');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const faker = require('faker');
const User = require('./model/users');
const Article = require('./model/articles');
const Comment = require('./model/comments');
const bcrypt = require('bcryptjs');
const app = express();
mongoose.connect('mongodb://127.0.0.1/graphql-project');


let typeDefs = gql`

    type Query {
        user : User!
        getAllUser(page : Int, limit : Int) : userData
        getUser(id : ID!) : User
    }

    type Mutation {
        createUser(input : UserInput!) : User!
    }

    type User {
        fname : String
        lname : String
        age : Int @deprecated(reason : "not use this")
        gender : Gender
        email : String
        password : String
        articles : [Article]
    }

    type Paginate {
        total : Int
        limit : Int
        page : Int
        pages : Int
    }

    type userData {
        users : [User],
        paginate : Paginate
    }

    enum Gender {
        Male
        Female
    }

    type Comment {
        user : User
        article : Article
        title : String
        body : String
    }

    type Article {
        user : User
        title : String
        body : String
        comments : [Comment]
    }

    input UserInput {
        fname : String!
        lname : String!
        age : Int!
        gender : Gender!
        email : String!
        password : String!
    }
`;

let resolvers = {
    Query : {
        user : () => {
            return {
                fname  : "ali",
                lname : "kiani",
                gender : "Male"
            }
        },
    
        getAllUser : async (parent,args) => {
            let page = args.page || 1;
            let limit = args.limit || 10;
            // const users = await User.find({}).skip((page - 1) * limit).limit(limit);
            const users = await User.paginate({}, {page, limit});
            return {
                users : users.docs,
                paginate : {
                    total : users.total,
                    limit : users.limit,
                    page : users.page,
                    pages : users.pages
                }
            }
        },
    
        getUser : async (parent,args) => {
            const user = await User.findById(args.id)
            return user;
        }
    },

    Mutation : {
        createUser : async (parent,args) => {
            const salt = bcrypt.genSaltSync(15);
            const hash = bcrypt.hashSync(args.input.password, salt);
            const user = await new User({
                fname : args.input.fname,
                lname : args.input.lname,
                age : args.input.age,
                gender : args.input.gender,
                email : args.input.email,
                password : hash
            })

            user.save();
            return user;
        }
    },

    User : {
        articles : async (parent, args) => await Article.find({ user : parent.id})
    },

    Article : {
        comments : async (parent, args) => await Comment.find({ article : parent.id})
    }}

const server = new ApolloServer({ typeDefs , resolvers})
server.start().then(() => {
    server.applyMiddleware({app})
    app.listen(4000 , () => {
        console.log('server run on port 4000')
    })
  });


