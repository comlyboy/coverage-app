import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

export async function bootstrapApplication() {
	const application = await NestFactory.create<NestExpressApplication>(AppModule);
	application.setGlobalPrefix('api');
	application.enableCors();
	application.useGlobalPipes(new ValidationPipe({
		whitelist: true, transform: true,
		transformOptions: { enableImplicitConversion: true }
	}));

	return application;
}