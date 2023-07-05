const express = require('express')
const app = express()
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT||5000
app.use(cors())

app.use(express.json())




const uri = "mongodb+srv://task-project:ZvqyJ6A2JRVZiCZC@cluster0.f7zs7lw.mongodb.net/?retryWrites=true&w=majority";

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    let taskCollections=client.db("taskDB").collection("taskCollections");



let taskUserCollections=client.db("taskUserDB").collection("taskUserCollections");



app.post("/allusers", async (req, res) => {
    const users = req.body;
    const query = {
      email: users.email,
    };
    const existingUser = await taskUserCollections.findOne(query);
    if (existingUser) {
      return res.send({ message: "user already exist" });
    }
    const result = await taskUserCollections.insertOne(users);
    res.send(result);
  });


  app.get("/allusers", async (req, res) => {
 
    const result = await taskUserCollections.find().toArray();
    res.send(result);
  });








  app.post("/tasks", async (req, res) => {
 const task=req.body
    const result = await taskCollections.insertOne(task)
    res.send(result);
  });

  app.get("/tasks", async (req, res) => {
    
 let query={}
 if(req.query?.search){
    query={ title: { $regex: req.query?.search, $options: "i" } }
 }

 if(req.query?.filter){
    query={ status:req.query?.filter }
 }
 let options={
    sort:{"dueDate":req.query?.sort=== 'asc'?1:-1}
  }
    const result = await taskCollections.find(query,options).toArray();
    res.send(result);
  });


  app.get("/tasks/:id", async (req, res) => {
 const query={_id: new ObjectId(req.params.id)}
    const result = await taskCollections.findOne(query);
    res.send(result);
  });


  app.delete("/tasks/:id", async (req, res) => {
    const query={_id: new ObjectId(req.params.id)}
       const result = await taskCollections.deleteOne(query);
       res.send(result);
     });




     app.get("/chartcount", async (req, res) => {
        const query={status:'Completed'}
        const query2={status:'Pending'}
        const query3={status:'In Progress'}
            const completedCount = await taskCollections.countDocuments(query);
            const PendingCount = await taskCollections.countDocuments(query2);
            const InProgressCount = await taskCollections.countDocuments(query3);
            res.json({ completedCount,PendingCount,InProgressCount });
         
         });
       




  app.put("/tasks/:id", async (req, res) => {
    const id =req.params.id
    const tasks=req.body
    const filter={_id: new ObjectId(id)}
    const options = { upsert: true };
  
    const updateDoc = {
      $set: {
      
        title:tasks.title,
        description:tasks.description,
        dueDate:tasks.dueDate,
        status:tasks.status,
        assignedUser:tasks.assignedUser,
      },
    };
    const result=await taskCollections.updateOne(filter, updateDoc, options);
    res.send(result)
     });
   
   

    




    
    // await client.db("admin").command({ ping: 1 });






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