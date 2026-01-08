import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const port = Number(process.env.PORT) || 3000;
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL bulunamadi. Lutfen backend/.env dosyasini kontrol edin.');
      process.exit(1);
    }

    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.listen(port, '0.0.0.0');
    console.log(`Sunucu ayakta: http://localhost:${port}`);
  } catch (error) {
    console.error('Uygulama baslatilamadi. Muhtemel neden: DB baglanti/ENV hatasi.');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
