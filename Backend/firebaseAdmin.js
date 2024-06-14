const admin = require('firebase-admin');
const serviceAccount = require('./mindconnect-218f4-firebase-adminsdk-elpgi-1953aea099.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'mindconnect-218f4.appspot.com' 
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
module.exports = { admin, db, bucket };