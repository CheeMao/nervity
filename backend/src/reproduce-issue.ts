
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CardsService } from './cards/cards.service';
import { EndUsersService } from './end-users/end-users.service';
import { UsersService } from './users/users.service';
import { CreateCardDto } from './cards/dto/create-card.dto';
import * as fs from 'fs';

async function bootstrap() {
    const logFile = 'reproduce-output.txt';
    const log = (msg: any) => {
        console.log(msg);
        fs.appendFileSync(logFile, (typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg) + '\n');
    };

    fs.writeFileSync(logFile, '--- Reproduce Issue Start ---\n');

    const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
    const cardsService = app.get(CardsService);
    const endUsersService = app.get(EndUsersService);
    const usersService = app.get(UsersService);

    try {
        // 0. Find a valid creator
        const admins = await usersService.findAll({ page: 1, pageSize: 1 });
        if (admins.list.length === 0) return;
        const creatorId = admins.list[0].id;

        // 1. Create a card with undefined value
        log("Creating Zero/Null Value card...");
        const cardInput = {
            app_id: 1,
            count: 1,
            value: 0, // Explicitly 0 to test
            remark: "Zero Value Test",
        };
        // Note: if I omit value key, it might be undefined. Let's try 0 first as it's more likely "empty" result.

        const cards = await cardsService.generate(cardInput, { id: creatorId, userId: creatorId, role: 'admin' });
        const testCard = cards[0];
        log(`Test Card Created: ${testCard.code}, Value: ${testCard.value}`);

        // 2. Target user
        const targetUsername = "ceshizhanghao";

        const userBefore = await endUsersService.findByUsername(targetUsername, 1);
        log(`User Before Expire: ${userBefore.expire_time}`);

        // 3. Redeem
        log(`Redeeming card...`);
        const result = await cardsService.useCard(testCard.code, null, "any-hwid", targetUsername);
        log(`Redeem Result: ${JSON.stringify(result)}`);

        // 4. Verify
        const userAfter = await endUsersService.findByUsername(targetUsername, 1);
        log(`User After Expire: ${userAfter.expire_time}`);

        if (userAfter.expire_time && new Date(userAfter.expire_time).getTime() > new Date().getTime()) {
            log("User has valid future time.");
        } else {
            log("ISSUE REPRODUCED: User is expired or empty.");
        }

    } catch (e) {
        log(`Error: ${e.message}`);
    }

    log('--- Reproduce Issue End ---');
    await app.close();
}

bootstrap();
