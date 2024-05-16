const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const app = express();

app.use('/graphql', graphqlHTTP({
   
 }))
app.listen(3000, () => {console.log('server run on port 3000 ...')});