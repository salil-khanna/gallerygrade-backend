import {Sequelize} from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_NAME || "",
    process.env.DATABASE_USER || "",
    process.env.DATABASE_PASSWORD || "",
    {
        host: process.env.DATABASE_HOST || "",
        dialect: "mysql",
        dialectOptions: {
            ssl: {
              // Set 'rejectUnauthorized' to 'true' to require SSL/TLS encryption
              rejectUnauthorized: true,
            },
        },
    });

export default sequelize;