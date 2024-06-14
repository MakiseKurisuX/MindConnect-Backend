const express = require('express');
const cron = require('node-cron');
const { admin, db, bucket } = require('./firebaseAdmin');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const quotesFolder = path.join(__dirname, 'quotes');

const deleteAllDocuments = async () => {
  try {
    const quotesSnapshot = await db.collection('Quotes').get();
    const deletePromises = quotesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    console.log('All documents deleted from Firestore');
  } catch (error) {
    console.error('Error deleting documents:', error);
  }
};

const addRandomImages = async () => {
  try {
    const [files] = await bucket.getFiles({ prefix: 'quotes/' });

    const selectedFiles = files.sort(() => 0.5 - Math.random()).slice(0, 3);

    const uploadPromises = selectedFiles.map(async (file) => {
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      await db.collection('Quotes').add({
        url: fileUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Added ${file.name} to Firestore`);
    });

    await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error adding images:', error);
  }
};

cron.schedule('0 8 * * *', async () => {
  console.log('Running scheduled task at 8 AM');
  await deleteAllDocuments();
  await addRandomImages();
});

app.get('/', (req, res) => {
  res.send('Local server is running');
});

// for manual testing
app.get('/run-task', async (req, res) => {
  await deleteAllDocuments();
  await addRandomImages();
  res.send('Task completed');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});