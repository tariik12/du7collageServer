const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require("dotenv").config()
const port = process.env.PORT || 3000;
const cors = require('cors')

app.use(express.json())
app.use(cors())


app.get('/', (req, res) => {
    res.send('DU 7 Collage Running ')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nlw4swl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {

    try {

        const userCollection = client.db('du7collage').collection('user');
        const reviewsCollection = client.db('du7collage').collection('reviews');
        const collagesCollection = client.db('du7collage').collection('collages');
        const formCollection = client.db('du7collage').collection('admission');

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
              return res.json('user already exist ')
      
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
          })

          app.patch('/users/:id',async(req,res) =>{
            const id =req.params.id;
            const filter={_id:new ObjectId(id)}
            const options = {upsert:true}
            const updateUser = req.body;
            const User = {
                $set:{
                    name: updateUser.name,
                    email:updateUser.email,
                    university:updateUser.collageName,
                    address:updateUser.address,
                }
            }
            const result = await userCollection.updateOne(filter,User,options)
            res.send(result)

        })
          app.get('/users/:email', async(req,res)=>{
            console.log(req.params.email)
            const result = await userCollection.findOne({email: req.params.email});
            res.send(result)
        })
        //search
        app.get('/collagesSearch/:text', async (req, res) => {
            const searchCollage = req.params.text;
            const result = await collagesCollection.find({ collageName: { $regex: searchCollage, $options: "i" } })
                .toArray();
            res.send(result)
        })
        app.get('/collages', async (req, res) => {
            const result = await collagesCollection.find().toArray();
            res.send(result)

        })
        app.get('/collages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await collagesCollection.findOne(query)
            res.send(result)
        })
        //admission form
        app.post('/admissionForm', async (req, res) => {
            const body = req.body
            if (!body) {
                return res.status(401).send('body Data Note Found')
            }
            const admissionForm = await formCollection.insertOne(body)
            res.send(admissionForm)
            console.log(admissionForm)
        })
        app.post('/reviews', async (req, res) => {
            const body = req.body
            if (!body) {
                return res.status(401).send('body Data Note Found')
            }
            const review = await reviewsCollection.insertOne(body)
            res.send(review)
            console.log(review)
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result)

        })
        app.get('/admissionForm/:email', async(req,res)=>{
            console.log(req.params.email)
            const result = await formCollection.find({studentEmail: req.params.email}).toArray();
            res.send(result)
        })


      
        // Send a ping to confirm a successful connection
        client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log('port console is running')
})