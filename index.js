const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dkxwe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('cricket-freak-warehouse-database').collection('products');

        //auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.send({ accessToken: accessToken });
        })

        // all products API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // find product by id API
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const product = await productCollection.findOne({ _id: ObjectId(id) });
            res.send(product);
        });

        // update quantity
        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedQuantity = {
                $set: {
                    quantity: body.quantity
                },
            };
            const result = await productCollection.updateOne(filter, updatedQuantity, options);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            res.send(result);
        });

        // delete product api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        // add new product
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        // items added by a specific user
        app.get('/myItems', async (req, res) => {
            const accessToken = req.headers.authorization;
            const decoded = verifyToken(accessToken)
            if (req.query.email === decoded?.email) {
                const query = { user: req.query.email };
                const cursor = productCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else{
                res.send([]);
            }
        });
    }
    finally {

    }
}
run().catch(console.dir);

// https://floating-retreat-93986.herokuapp.com/

//test API
app.get('/', (req, res) => {
    res.send('Server created!');
});
app.listen(port, () => {
    console.log('Server running @', port);
});

// verify token function
function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            email = 'Invalid email';
        }
        if (decoded) {
            console.log(decoded);
            email = decoded;
        }
    });
    return email;
}