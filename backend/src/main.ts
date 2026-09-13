// 设置进程时区为东八区（北京时间），必须在所有模块加载之前
process.env.TZ = 'Asia/Shanghai';

import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.setGlobalPrefix("api");

  // 信任反向代理（nginx）传来的 X-Forwarded-For / X-Real-IP，
  // 否则 ThrottlerGuard 看到的全是 nginx 的 IP，限流会按"代理机器"共用一个桶。
  // 1 = 信任最近的一跳代理；多层代理时调大。
  app.set("trust proxy", 1);

  // Enable global validation pipe for DTO validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Register global filter and interceptor
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger API 文档配置
  const config = new DocumentBuilder()
    .setTitle('NetVerify API')
    .setDescription('网络验证系统 API 文档 - 支持用户管理、代理商系统、卡密激活、云函数、设备绑定等功能')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '请输入 JWT Token',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });

  app.enableCors();
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger API 文档: ${await app.getUrl()}/api/docs`);
}
// Trigger rebuild
bootstrap();
