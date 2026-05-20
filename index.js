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
    const appointsCollection = db.collection('appoints');



    app.get('/doctors', async (req, res) => {
      const searchData = req.query; // এখানে ইউজার যা সার্চ করবে তা আসবে (যেমন: { search: 'jhon' })

      // ১. শুরুতে কুয়েরি অবজেক্ট একদম খালি রাখবো, যাতে সার্চ না থাকলে সব ডাটা আসে
      let query = {};

      // ২. যদি ইউজার সত্যি কোনো কিছু লিখে সার্চ করে (অর্থাৎ searchData এর ভেতর search থাকে)
      if (searchData.search) {
        query = {
          $or: [
            { name: { $regex: searchData.search, $options: 'i' } },      // নামের সাথে মিললে
            { specialty: { $regex: searchData.search, $options: 'i' } } // অথবা স্পেশালিটির সাথে মিললে
          ]
        };
      }

      // ৩. এবার .find(query) এর ভেতর আমরা আমাদের তৈরি করা 'query' অবজেক্টটি পাস করবো
      const doctors = await doctorsCollection.find(query).toArray();
      res.send(doctors);
    });
    

    app.get('/doctors/:id', async (req, res) => {
      const id = req.params.id;
      const doctor = await doctorsCollection.findOne({ _id: new ObjectId(id) });
      res.send(doctor);
    })





    // const query = { userId: userId };
    // const result = await appointsCollection.find(query).toArray();
    // res.json(result);











    app.get('/appoints/:userId', async (req, res) => {
      const { userId } = req.params;

      const query = { userId: userId };
      const result = await appointsCollection.find(query).toArray();
      res.json(result);
    })

    app.get('/appoints/', async (req, res) => {

      const appointsData = req.query;
      const result = await appointsCollection.find().toArray();
      res.json(result);
    })


    app.post('/appoints', async (req, res) => {
      const appointsData = req.body;
      const result = await appointsCollection.insertOne(appointsData);
      res.json(result);
    })



    app.patch('/appoints/:id', async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;
      console.log(updatedData);

      const result = await appointsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );
      res.json(result);
    })


    app.delete('/appoints/:id', async (req, res) => {
      const { id } = req.params;
      const result = await appointsCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
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
