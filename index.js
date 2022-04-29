const express = require('express');
const cors = require('cors');
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

        // all products API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // product by id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            //const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne({ _id: ObjectId(id) });
            res.send(product);
        })
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