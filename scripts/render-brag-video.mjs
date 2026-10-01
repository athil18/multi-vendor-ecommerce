/**
 * Playwright Video Renderer for /brag
 * Renders the 20-second 1920x1080 60FPS launch video into brag-output/brag.webm
 * and extracts the poster frame to brag-output/brag.jpg.
 */

import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function renderVideo() {
  const rootDir = path.resolve(__dirname, '..');
  const compPath = path.join(rootDir, 'brag-output', 'work', 'composition.html');
  const workDir = path.join(rootDir, 'brag-output', 'work');
  const outputDir = path.join(rootDir, 'brag-output');

  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
  }

  console.log('\n===============================================================');
  console.log('🎬 /BRAG VIDEO RENDER ENGINE');
  console.log('===============================================================');
  console.log(`Source composition: ${compPath}`);
  console.log('Target resolution: 1920x1080 (16:9 Landscape)');
  console.log('Target duration: 20 seconds');

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    console.log('✓ Launched Microsoft Edge rendering engine');
  } catch (e) {
    browser = await chromium.launch({ headless: true });
    console.log('✓ Launched Chromium rendering engine');
  }

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: workDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();
  const fileUrl = 'file:///' + compPath.replace(/\\/g, '/');

  console.log(`Navigating to canvas: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Capture settled poster frame at Scene 1 settled state
  await page.waitForTimeout(2000);
  const posterPath = path.join(outputDir, 'brag.jpg');
  await page.screenshot({ path: posterPath, type: 'jpeg', quality: 95 });
  console.log(`✓ Poster frame captured: ${posterPath}`);

  // Let video play through all 5 scenes (total 20 seconds)
  console.log('Rendering 20-second cinematic video sequence...');
  await page.waitForTimeout(19000);

  // Close page and context to finalize video recording
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const rawVideoPath = await video.path();
    const finalVideoPath = path.join(outputDir, 'brag.webm');
    
    // Copy/rename to brag.webm
    if (fs.existsSync(rawVideoPath)) {
      fs.copyFileSync(rawVideoPath, finalVideoPath);
      const stats = fs.statSync(finalVideoPath);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✓ Video successfully rendered: ${finalVideoPath} (${sizeMb} MB)`);
    }
  }

  console.log('===============================================================');
  console.log('🎉 LAUNCH VIDEO PRODUCTION COMPLETE!');
  console.log(`Deliverables available in: ${outputDir}`);
  console.log('===============================================================\n');
}

renderVideo().catch(err => {
  console.error('Rendering failed:', err);
  process.exit(1);
});
