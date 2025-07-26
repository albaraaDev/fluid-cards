// scripts/generate-icons.js
// Script لتوليد جميع أحجام الأيقونات المطلوبة من ملف SVG

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// أحجام الأيقونات المطلوبة
const sizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// أحجام Maskable (مع padding إضافي)
const maskableSizes = [
  { size: 192, name: 'maskable-icon-192x192.png' },
  { size: 512, name: 'maskable-icon-512x512.png' },
];

async function generateIcons() {
  try {
    // إنشاء مجلد الأيقونات
    const iconsDir = path.join(__dirname, '../public/icons');
    await fs.mkdir(iconsDir, { recursive: true });

    // قراءة ملف SVG
    const svgPath = path.join(__dirname, 'app-icon.svg');
    const svgBuffer = await fs.readFile(svgPath);

    console.log('🎨 بدء توليد الأيقونات...');

    // توليد الأيقونات العادية
    for (const { size, name } of sizes) {
      console.log(`📐 توليد ${name} (${size}x${size}px)`);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 100 })
        .toFile(path.join(iconsDir, name));
    }

    // توليد الأيقونات Maskable (مع padding)
    for (const { size, name } of maskableSizes) {
      console.log(`🎭 توليد ${name} (Maskable - ${size}x${size}px)`);
      
      // حساب الحجم الداخلي (80% من الحجم الكلي للـ safe zone)
      const innerSize = Math.round(size * 0.8);
      const padding = Math.round((size - innerSize) / 2);

      await sharp(svgBuffer)
        .resize(innerSize, innerSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 59, g: 130, b: 246, alpha: 1 } // لون الخلفية الأزرق
        })
        .png({ quality: 100 })
        .toFile(path.join(iconsDir, name));
    }

    // توليد favicon
    console.log('🌟 توليد favicon.ico');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, '../public/favicon-32x32.png'));

    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(__dirname, '../public/favicon-16x16.png'));

    // توليد splash screens للـ iOS
    const splashSizes = [
      { width: 828, height: 1792, name: 'splash-828x1792.png' }, // iPhone 11 Pro
      { width: 1125, height: 2436, name: 'splash-1125x2436.png' }, // iPhone X/XS
      { width: 1242, height: 2688, name: 'splash-1242x2688.png' }, // iPhone XS Max
      { width: 1536, height: 2048, name: 'splash-1536x2048.png' }, // iPad 9.7"
      { width: 1668, height: 2224, name: 'splash-1668x2224.png' }, // iPad 10.5"
      { width: 1668, height: 2388, name: 'splash-1668x2388.png' }, // iPad 11"
      { width: 2048, height: 2732, name: 'splash-2048x2732.png' }, // iPad 12.9"
    ];

    const splashDir = path.join(__dirname, '../public/splash');
    await fs.mkdir(splashDir, { recursive: true });

    for (const { width, height, name } of splashSizes) {
      console.log(`📱 توليد ${name} (${width}x${height}px)`);
      
      // حساب حجم الأيقونة في الـ splash screen
      const iconSize = Math.min(width, height) * 0.3;
      
      await sharp(svgBuffer)
        .resize(Math.round(iconSize), Math.round(iconSize), {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .extend({
          top: Math.round((height - iconSize) / 2),
          bottom: Math.round((height - iconSize) / 2),
          left: Math.round((width - iconSize) / 2),
          right: Math.round((width - iconSize) / 2),
          background: { r: 248, g: 250, b: 252, alpha: 1 } // خلفية فاتحة
        })
        .resize(width, height, { fit: 'cover' })
        .png({ quality: 90 })
        .toFile(path.join(splashDir, name));
    }

    console.log('✅ تم توليد جميع الأيقونات بنجاح!');
    console.log(`📁 الأيقونات محفوظة في: ${iconsDir}`);
    console.log(`📁 شاشات التحميل محفوظة في: ${splashDir}`);

  } catch (error) {
    console.error('❌ خطأ في توليد الأيقونات:', error);
    process.exit(1);
  }
}

// تشغيل الـ script
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };