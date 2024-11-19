import express from 'express';
import cors from 'cors';
import sequelize from "./models/index.js";
import userController from "./controllers/user-controller.js";
import bookmarkController from "./controllers/bookmark-controller.js";
import artController from "./controllers/art-controller.js";
import reviewController from "./controllers/review-controller.js";

// process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

try {
    // Clears database
    // await sequelize.sync({ force: true });

    // Synchronize the database schema without forcing table deletion
    await sequelize.sync({ force: false, alter: true });
    console.log('Database synchronized.');
} catch (error) {
    console.error('Error synchronizing database:', error);
}

//hello world on /
app.get('/', (req, res) => {
    res.send('App running!');
});

// Base route for user actions.
app.use('/users', userController);
app.use('/bookmarks', bookmarkController);
app.use('/art', artController);
app.use('/reviews', reviewController);

// Catch-all route for any other requests.
app.get('*', (req, res) => {
    res.status(404).send('Page not found.');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
