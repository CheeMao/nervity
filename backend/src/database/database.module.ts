import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>("DB_TYPE", "postgres") as "postgres" | "mysql",
        timezone: "+08:00", // 东八区（北京时间）
        host: configService.get<string>("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 3306),
        username: configService.get<string>("DB_USERNAME", "root"),
        password: configService.get<string>("DB_PASSWORD", "root"),
        database: configService.get<string>("DB_DATABASE", "netverify"),
        entities: [__dirname + "/../**/*.entity{.ts,.js}"],
        extra: { dateStrings: true }, // 让 mysql2 返回日期字符串
        synchronize: false, // 禁止自动同步，避免外键问题
      }),
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private dataSource: DataSource) { }

  async onModuleInit() {
    // MySQL 时区设置
    const driver = this.dataSource.driver as any;
    const pool = driver.pool;
    if (pool && typeof pool.on === 'function') {
      pool.on('connection', (conn: any) => {
        conn.query("SET time_zone = '+08:00'");
      });
    }
    await this.dataSource.query("SET time_zone = '+08:00'");
  }
}
