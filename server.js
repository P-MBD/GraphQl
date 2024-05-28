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
const validator = require('validator');
const app = express();
mongoose.connect('mongodb://127.0.0.1/graphql-project');


let typeDefs = gql`

    type Query {
        user : User!
        getAllUser(page : Int, limit : Int) : userData
        getUser(id : ID!) : User
        login(email: String!, password: String!): Token!
    }

    type Mutation {
        createUser(input : UserInput!) : User!
        createArticle(title : String!, body : String!) : Article!
    }
    type Token {
        token : String!,
        user : User
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
    
        getAllUser : async (parent,args, { check }) => {
            let page = args.page || 1;
            let limit = args.limit || 10;
            // const users = await User.find({}).skip((page - 1) * limit).limit(limit);
            if(!check) {
                const error = new Error('کاربر اعتبار لازم را ندارد');
                throw error;
            }
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
        },   

        login : async (parent, args, {secret_token}) => {
            const user = await User.findOne({'email' : args.email});
            if(!user) {
                const error = new Error('چنین کاربری در سیستم ثبت نام نکرده است');
                error.code = 401;
                throw error;
            }
            let isValid = await bcrypt.compare(args.password, user.password);
            if(!isValid) {
                const error = new Error('پسورد مطابقت ندارد');
                error.code = 401;
                throw error;
            }                 
            return {
                token : await User.createToken(user, secret_token, '1h'),
                user
            };
        }
    },

    Mutation : {
        createUser : async (parent,args,{secret_token}) => {
            const salt = bcrypt.genSaltSync(15);
            const hash = bcrypt.hashSync(args.input.password, salt);

            const errors = [];
            if(validator.isEmpty(args.input.fname)) {
                errors.push({ message : "فیلد نام نمی تواند خالی بماند"})
            }

            if(!validator.isEmail(args.input.email)) {
                errors.push({ message : "فرمت ایمیل وارد شده معتبر نمی باشد"})
            }
            
            if(errors.length > 0) {
                const error = new Error("Invalid Input.");
                error.data = errors;
                error.code = 422;
                throw error;
            }
            const user = await new User({
                fname : args.input.fname,
                lname : args.input.lname,
                age : args.input.age,
                gender : args.input.gender,
                email : args.input.email,
                password : hash
            })
          
            user.save();
            return {
                token : await User.createToken(user, secret_token, '1h'),
                user
            };
        },
        
        createArticle : async (parent, args, { check }) => {

            if(!check) {
                const error = new Error('کاربر اعتبار لازم را ندارد');
                throw error;
            }
            console.log(args, { check });
           // return;
            let article = await Article.create({
                user : check.id,
                title : args.title,
                body :  args.body,
            })

            return article;
        }
    },

    User : {
        articles : async (parent, args) => await Article.find({ user : parent.id})
    },

    Article : {
        comments : async (parent, args) => await Comment.find({ article : parent.id}),
        user : async (parent, args) => await User.findById(parent.user)
    }}

const server = new ApolloServer({ typeDefs , resolvers, 
    formatError(err) {
    if(!err.originalError) {
        return err;
    }

    const data = err.originalError.data;
    const code = err.originalError.code || 500;
    const message = err.message || 'error';

    return { data, status : code, message};
    },
    context : 
    async ({req}) => {
        const secret_token =  'sadhkajshdkajshd!@123';
        let check = await User.checkToken(req, secret_token);
         return {
             check,
             secret_token
         }
     }
     
     })
server.start().then(() => {
    server.applyMiddleware({app})
    app.listen(4000 , () => {
        console.log('server run on port 4000')
    })
  });
  


