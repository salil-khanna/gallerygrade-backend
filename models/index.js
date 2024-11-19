import "pg";
import {Sequelize} from "sequelize";


// const sequelize = new Sequelize(
//     process.env.DATABASE_NAME || "",
//     process.env.DATABASE_USER || "",
//     process.env.DATABASE_PASSWORD || "",
//     {
//         host: process.env.DATABASE_HOST || "",
//         port: process.env.DATABASE_PORT || 5432,
//         dialect: "postgres",
//         dialectOptions: {
//             ssl: {
//               // Set 'rejectUnauthorized' to 'true' to require SSL/TLS encryption
//               rejectUnauthorized: true,
//             },
//         },
//     });
const postgresUrl = process.env.POSTGRES_URL || "";
const sequelize = new Sequelize(postgresUrl);

export default sequelize;