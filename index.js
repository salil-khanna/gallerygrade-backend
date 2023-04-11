import express from 'express';
import cors from 'cors';
import sequelize from "./models/index.js";
import userController from "./controllers/user-controller.js";


const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

try {
    // { force: true } to force db to reset and pick up changes on server restart
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0').then(data => {
        sequelize.sync({force: true});
    }).then(data => {
        sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Database synchronized.');
    });
} catch (error) {
    console.error('Error synchronizing database:', error);
}

//hello world on /
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Base route for user actions.
app.use('/users', userController);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});