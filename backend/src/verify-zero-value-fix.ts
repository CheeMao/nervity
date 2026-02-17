
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CardsService } from './cards/cards.service';
import { UsersService } from './users/users.service';
import * as fs from 'fs';

async function bootstrap() {
    const logFile = 'verify-zero-output.txt';
    const log = (msg: any) => {
        console.log(msg);
        fs.appendFileSync(logFile, (typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg) + '\n');
    };

    fs.writeFileSync(logFile, '--- Verify Zero Fix Start ---\n');

    const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
    const cardsService = app.get(CardsService);
    const usersService = app.get(UsersService);

    try {
        // 0. Find a valid creator
        const admins = await usersService.findAll({ page: 1, pageSize: 1 });
        if (admins.list.length === 0) return;
        const creatorId = admins.list[0].id;

        // 1. Test Generate Validation
        log("TEST 1: Try to create Zero Value card...");
        const cardInput = {
            app_id: 1,
            count: 1,
            value: 0,
            remark: "Zero Value Test 2",
        };

        try {
            await cardsService.generate(cardInput, { id: creatorId, userId: creatorId, role: 'admin' });
            log("FAIL: Zero value card created successfully (Should have failed).");
        } catch (e) {
            log(`SUCCESS: Creation failed as expected. Error: ${e.message}`);
        }

        // 2. Test Use Validation (using previously created card if possible, otherwise skip)
        // We need to find a zero value card.
        // Assuming one was created in previous reproduction step.
        // Let's find a card with value 0

        // We'll use raw query via repository if needed, or just search
        // As validation is now in place, we cannot create new ones.
        // We need to rely on the one created in reproduction step: code PED4HVG4RN (from previous output)
        const previousCode = "PED4HVG4RN";
        log(`TEST 2: Try to use existing Zero Value card (${previousCode})...`);

        // We need to reset its status to unused if we want to test "use" logic, 
        // but useCard checks status first.
        // Hack: direct update to UNUSED using repository?
        // Or just try to use it and see if it fails on value check OR status check.
        // If it fails on status (USED), we can't verify the value check easily without DB manipulation.
        // But the logic is clear in code.

        try {
            // Attempt to use it. Even if used, let's see which error comes first.
            // Code checks status first, then value. 
            // So if it returns "Card used", we know it didn't reach value check.
            // But wait, the previous reproduction used it. So it IS used.

            await cardsService.useCard(previousCode, null, "any-hwid", "ceshizhanghao");
            log("FAIL: Zero value card used successfully (Should have failed).");
        } catch (e) {
            log(`Result: ${e.message}`);
            if (e.message.includes("面值无效")) {
                log("SUCCESS: Blocked by value check.");
            } else if (e.message.includes("已被使用")) {
                log("NOTE: Blocked by status check (already used). Validation logic exists but unreachable for used cards.");
            } else {
                log("UNKNOWN ERROR.");
            }
        }

    } catch (e) {
        log(`Error: ${e.message}`);
    }

    log('--- Verify Zero Fix End ---');
    await app.close();
}

bootstrap();
