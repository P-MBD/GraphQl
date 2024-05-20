const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const { makeExecutableSchema } = require('graphql-tools');
const mongoose = require('mongoose');
const faker = require('faker');
const User = require('./model/users');
const Article = require('./model/articles');
const Comment = require('./model/comments');
const app = express();
mongoose.connect('mongodb://127.0.0.1/graphql-project');


let typeDefs =`

    type Query {
        user : User!
        getAllUser(page : Int, limit : Int) : userData
        getUser(id : ID!) : User
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

    input CreateUser {
        fname : String
        lname : String
        age : Int
        gender : Gender
        email : String
        password : String
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
    
        getAllUser : async (param, args) => {
            let page = args.page || 1;
            let limit = args.limit || 10;
            // const users = await User.find({}).skip((page - 1) * limit).limit(limit);
            const users = await User.paginate({}, {page, limit, populate : [{ path : 'articles', populate : ['comments']}]});
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
    
        getUser : async (param, args) => {
            const user = await User.findById(args.id)
            return user;
        }
    }
}

const schema = makeExecutableSchema({typeDefs, resolvers})
app.use('/graphql', graphqlHTTP({
    schema : schema,
    graphiql : true
 }))
 


app.listen(3000, () => {console.log('server run on port 3000 ...')});