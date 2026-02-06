import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFortune() {
  try {
    const count = await prisma.fortuneLibrary.count();
    console.log('FortuneLibrary count:', count);

    if (count === 0) {
      console.log('No fortunes found, running seed...');
      const { spawn } = require('child_process');
      spawn('npx', ['tsx', 'scripts/seed-fortunes.ts'], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } else {
      console.log('Fortunes exist!');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFortune();
