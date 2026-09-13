import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";

export default new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_DATABASE || "netverify",
  timezone: "+08:00",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  migrationsTableName: "typeorm_migrations",
  synchronize: false,
  extra: { dateStrings: true },
});
