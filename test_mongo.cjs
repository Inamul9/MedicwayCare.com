const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const uri1 = 'mongodb+srv://diwakar:diwakar123@cluster0.vfvj7sy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const uri2 = 'mongodb+srv://Doctore:Dd12345@cluster0.1hcnk.mongodb.net';

async function testConnection(uri, label) {
  console.log(`Testing ${label}...`);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ ${label} connected successfully!`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error(`❌ ${label} failed:`, err.message);
    return false;
  }
}

async function runTests() {
  const result1 = await testConnection(uri1, 'URI 1 (luciferofx)');
  const result2 = await testConnection(uri2, 'URI 2 (Doctore)');
  
  if (result1) console.log('Successfully connected with URI 1');
  else if (result2) console.log('Successfully connected with URI 2');
  else console.log('Both URIs failed. Please check your IP whitelist on MongoDB Atlas.');
}

runTests();
