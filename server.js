const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const app = express();
let schema = buildSchema(`
    schema {
        query : rootQuery
    }
    type rootQuery {
        user : String
    }
`)

app.use('/graphql', graphqlHTTP({
    schema : schema,
 }))
app.listen(3000, () => {console.log('server run on port 3000 ...')});