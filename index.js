const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();
const app = express()
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());

// user docAppoint
// pass `LdSCujrETemkkTcG`

const uri = process.env.MONGODB_URI;

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

    const db = client.db('docappoint_db');
    const doctorsCollection = db.collection('doctors');


    app.get('/doctors', async (req, res)  => {
        const doctors = await doctorsCollection.find().toArray();
        res.send(doctors);
    })

    app.get('/doctors/:id', async (req, res) => {
        const id = req.params.id;
        const doctor = await doctorsCollection.findOne({ _id: new ObjectId(id) });
        res.send(doctor);
    })


   







    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
