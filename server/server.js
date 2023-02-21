// Importing
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

// App Configuration
const app = express();
app.use(cors());
dotenv.config();
const PORT = process.env.PORT || 4001;

const pusher = new Pusher({
    appId: "1557636",
    key: "9a8c37fa1990566e2a71",
    secret: "0d1c89bfdfeeeecab5e4",
    cluster: "eu",
    useTLS: true
});

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});

// DB Config
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI);

const db = mongoose.connection;
db.once('open', () => {
  console.log('DB connected');

  const msgCollection = db.collection('messagecontents');
  const changeStream = msgCollection.watch();

  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument;
      pusher.trigger('messages', 'inserted', {
        _id: messageDetails._id,
        message: messageDetails.message,
        name: messageDetails.name,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    }
  });
});

// API Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
});

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
});

// App is Listening
app.listen(PORT, () => {
    console.log(`The server is listening at ${PORT}`)
});