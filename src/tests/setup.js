const mongoose = require("mongoose");
import request from 'supertest'
import server from '../core/app'

// mongoose.set("useCreateIndex", true);
mongoose.promise = global.Promise;

async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
}

async function dropAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      if (error.message === "ns not found") return;
      if (error.message.includes("a background operation is currently running"))
        return;
      console.log(error.message);
    }
  }
}

module.exports = {
  setupDB() {
    // Connect to Mongoose
    before(async () => {
      const url = process.env.MONGO_DB_TEST_URL;
      await mongoose.connect(url, { useNewUrlParser: true });
    });

    // Cleans up database between each test
    after(async () => {
      await removeAllCollections();
    });
    // Disconnect Mongoose
    after(async () => {
      console.log('database connection close')
      await dropAllCollections();
      await mongoose.connection.close();
    });
  },
  request: request(server)
};