"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    try {
        const port = Number(process.env.PORT) || 3000;
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL bulunamadi. Lutfen backend/.env dosyasini kontrol edin.');
            process.exit(1);
        }
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.enableCors();
        app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }));
        await app.listen(port, '0.0.0.0');
        console.log(`Sunucu ayakta: http://localhost:${port}`);
    }
    catch (error) {
        console.error('Uygulama baslatilamadi. Muhtemel neden: DB baglanti/ENV hatasi.');
        console.error(error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map