import express from 'express';
import cors from 'cors';
import sequelize from "./models/index.js";
import userController from "./controllers/user-controller.js";
import bookmarkController from "./controllers/bookmark-controller.js";
import artController from "./controllers/art-controller.js";
import reviewController from "./controllers/review-controller.js";


const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());



try {
    // { force: true } to force db to clear all data
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0').then(data => {
        // sequelize.sync({force: true});
        sequelize.sync();
        sequelize.sync({force: false, alter: true});
    }).then(data => {
        sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Database synchronized.');
    });
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
