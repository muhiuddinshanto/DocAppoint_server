const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
dotenv.config();
const app = express()
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());



const uri = process.env.MONGODB_URI;


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




    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URI}/api/auth/jwks`)
    )


    const verifyToken = async (req, res, next) => {
      const header = req?.headers.authorization;
      if (!header) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const token = header.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      try {
        const { payload } = await jwtVerify(token, JWKS);
        console.log(payload)
        next()
      } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }


















    app.get('/doctors', async (req, res) => {
      const searchData = req.query;


      let query = {};


      if (searchData.search) {
        query = {
          $or: [
            { name: { $regex: searchData.search, $options: 'i' } },
            { specialty: { $regex: searchData.search, $options: 'i' } }
          ]
        };
      }


      const doctors = await doctorsCollection.find(query).toArray();
      res.send(doctors);
    });


    app.get('/doctors/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const doctor = await doctorsCollection.findOne({ _id: new ObjectId(id) });
      res.send(doctor);
    })


// ================================= Appoints API ============================================




    app.get('/appoints/:userId', verifyToken,  async (req, res) => {
      const { userId } = req.params;

      const query = { userId: userId };
      const result = await appointsCollection.find(query).toArray();
      res.json(result);
    })

    app.get('/appoints/', verifyToken, async (req, res) => {

      const appointsData = req.query;
      const result = await appointsCollection.find().toArray();
      res.json(result);
    })


    app.post('/appoints',  async (req, res) => {
      const appointsData = req.body;
      const result = await appointsCollection.insertOne(appointsData);
      res.json(result);
    })



    app.patch('/appoints/:id',  async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;
      console.log(updatedData);

      const result = await appointsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );
      res.json(result);
    })


    app.delete('/appoints/:id',  async (req, res) => {
      const { id } = req.params;
      const result = await appointsCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    })



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
