import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function contrastRatio(page:Page, selector:string) {
  return page.locator(selector).first().evaluate(element=>{
    const style=getComputedStyle(element);
    const channels=(value:string)=>value.match(/[\d.]+/g)!.slice(0,3).map(Number).map(channel=>{
      const scaled=channel/255;
      return scaled<=0.04045?scaled/12.92:((scaled+0.055)/1.055)**2.4;
    });
    const luminance=(value:string)=>{const [r,g,b]=channels(value);return 0.2126*r+0.7152*g+0.0722*b};
    const foreground=luminance(style.color);
    const background=luminance(style.backgroundColor);
    return (Math.max(foreground,background)+0.05)/(Math.min(foreground,background)+0.05);
  });
}

test('theme follows the system, saves an explicit choice, and leaves the document unchanged',async({page},testInfo)=>{
  await page.emulateMedia({colorScheme:'dark'});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.locator('.wordmark-dark')).toBeVisible();
  await expect(page.getByRole('button',{name:'تفعيل الوضع الفاتح'})).toHaveAttribute('aria-pressed','true');
  expect(await contrastRatio(page,'.settings')).toBeGreaterThanOrEqual(4.5);
  expect(await contrastRatio(page,'.primary-button')).toBeGreaterThanOrEqual(4.5);
  const documentMarkup=await page.locator('.preview-document svg').evaluate(svg=>svg.outerHTML);
  await page.screenshot({path:testInfo.outputPath('dark-desktop.png'),fullPage:true});
  await page.emulateMedia({colorScheme:'light'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  expect(await contrastRatio(page,'.settings')).toBeGreaterThanOrEqual(4.5);
  expect(await contrastRatio(page,'.primary-button')).toBeGreaterThanOrEqual(4.5);
  const toggle=page.getByRole('button',{name:'تفعيل الوضع الداكن'});
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(await page.evaluate(()=>localStorage.getItem('tajleed-theme'))).toBe('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(await page.locator('.preview-document svg').evaluate(svg=>svg.outerHTML)).toBe(documentMarkup);
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:testInfo.outputPath('dark-mobile.png'),fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button',{name:'تفعيل الوضع الفاتح'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('Arabic workspace saves, reopens, duplicates and exports',async({page},testInfo)=>{
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.locator('.brand-icon')).toBeVisible();
  expect(await page.locator('.brand-icon').evaluate(image=>(image as HTMLImageElement).naturalWidth)).toBe(192);
  await expect(page.getByRole('heading',{name:'معاينة القالب'})).toBeVisible();
  await expect(page.locator('.save-state')).toContainText('محفوظ محليًا');
  await page.locator('#field-spine').fill('١٢');
  await expect(page.locator('.document-size')).toContainText('314');
  await expect(page.getByRole('status').first()).toContainText('محفوظ محليًا');
  await page.screenshot({path:testInfo.outputPath('desktop.png'),fullPage:true});
  await page.reload();
  await expect(page.locator('#field-spine')).toHaveValue('12');
  await expect(page.locator('.save-state')).toContainText('محفوظ محليًا');
  const exportTrigger=page.getByRole('button',{name:'تصدير القالب'});
  await exportTrigger.click();
  await expect(page.getByRole('region',{name:'تصدير القالب'})).toBeVisible();
  await expect(page.getByRole('button',{name:'تنزيل SVG'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('region',{name:'تصدير القالب'})).toHaveCount(0);
  await expect(exportTrigger).toBeFocused();
  await exportTrigger.click();
  const svgDownload=page.waitForEvent('download');
  await page.getByRole('button',{name:'تنزيل SVG'}).click();
  await expect(page.getByRole('region',{name:'تصدير القالب'})).toBeVisible();
  const svgFile=await svgDownload;
  expect(svgFile.suggestedFilename()).toMatch(/\.svg$/);
  await svgFile.saveAs(testInfo.outputPath('template.svg'));
  const pdfDownload=page.waitForEvent('download');
  await page.getByRole('button',{name:'تنزيل PDF'}).click();
  const pdfFile=await pdfDownload;
  expect(pdfFile.suggestedFilename()).toMatch(/\.pdf$/);
  await pdfFile.saveAs(testInfo.outputPath('template.pdf'));
  await page.getByRole('button',{name:'مشاريعي'}).click();
  await page.getByRole('button',{name:'إنشاء نسخة'}).click();
  await expect(page.locator('#project-name')).toHaveValue(/نسخة/);
  await page.locator('#project-name').fill('غلاف مخصص');
  await expect(page.getByRole('status').first()).toContainText('محفوظ محليًا');
  await page.getByRole('button',{name:'مشاريعي'}).click();
  await expect(page.locator('.project-list li')).toHaveCount(2);
  await page.locator('.project-list li').filter({hasText:'غلاف جديد'}).getByRole('button',{name:'فتح'}).click();
  await expect(page.locator('#project-name')).toHaveValue('غلاف جديد');
  await page.getByRole('button',{name:'مشاريعي'}).click();
  await page.locator('.project-list li').filter({hasText:'غلاف مخصص'}).getByRole('button',{name:'فتح'}).click();
  await expect(page.locator('#project-name')).toHaveValue('غلاف مخصص');
  await page.getByRole('button',{name:'مشاريعي'}).click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('.project-list li').filter({hasText:'غلاف مخصص'}).getByRole('button',{name:'حذف'}).click();
  await expect(page.locator('.project-list li')).toHaveCount(1);
});

test('mobile viewport keeps preview above settings and imports are validated',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('.save-state')).toContainText('محفوظ محليًا');
  await expect(page.locator('.preview-area')).toBeVisible();
  await expect(page.locator('.settings')).toBeVisible();
  await expect(page.locator('.brand-icon')).toBeVisible();
  const previewBox=await page.locator('.preview-area').boundingBox();
  const settingsBox=await page.locator('.settings').boundingBox();
  expect(previewBox!.y).toBeLessThan(settingsBox!.y);
  await page.screenshot({path:testInfo.outputPath('mobile.png'),fullPage:true});
  await page.getByRole('checkbox',{name:'إظهار خطوط المعاينة'}).uncheck();
  await expect(page.locator('.preview-document #guides')).toHaveCount(0);
  for(let i=0;i<5;i++) await page.getByRole('button',{name:'تكبير',exact:true}).click();
  await expect(page.locator('.preview-toolbar output')).toHaveText('200%');
  await page.locator('.preview-viewport').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.preview-document')).toHaveAttribute('style',/translate\(-16px/);
  await page.getByRole('button',{name:'ملاءمة العرض'}).click();
  await expect(page.locator('.preview-toolbar output')).toHaveText('100%');
  await page.getByRole('button',{name:'مشاريعي'}).click();
  await page.locator('input[type=file]').setInputFiles({name:'broken.tajleed.json',mimeType:'application/json',buffer:Buffer.from('{"format":"tajleed-project","version":999}')});
  await expect(page.getByText('تعذر استيراد الملف. تحقق من بنية المشروع وإصداره.')).toBeVisible();
});

test('storage failure leaves the working project usable',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'indexedDB',{value:{open(){throw new Error('blocked')}}})});
  await page.goto('/');
  await expect(page.getByRole('status').first()).toContainText('تعذر الحفظ محليًا');
  await page.locator('#field-spine').fill('12');
  await expect(page.locator('.document-size')).toContainText('314');
});

test('project backup imports as a separate project without replacing the original',async({page},testInfo)=>{
  await page.goto('/');
  await expect(page.locator('.save-state')).toContainText('محفوظ محليًا');
  await page.locator('#field-spine').fill('12');
  await expect(page.locator('.save-state')).toContainText('محفوظ محليًا');
  await page.getByRole('button',{name:'تصدير القالب'}).click();
  const backupDownload=page.waitForEvent('download');
  await page.getByRole('button',{name:'تنزيل ملف المشروع'}).click();
  const file=await backupDownload;
  const backupPath=testInfo.outputPath('project.tajleed.json');
  await file.saveAs(backupPath);
  await page.getByRole('button',{name:'مشاريعي'}).click();
  await page.locator('input[type=file]').setInputFiles(backupPath);
  await expect(page.locator('#project-name')).toHaveValue(/نسخة/);
  await expect(page.locator('.save-state')).toContainText('محفوظ محليًا');
  await page.getByRole('button',{name:'مشاريعي'}).click();
  await expect(page.locator('.project-list li')).toHaveCount(2);
});

test('ISBN-13 barcode rejects bad checksums and exports vector bars',async({page},testInfo)=>{
  await page.goto('/');
  await expect(page.locator('.save-state')).toContainText('محفوظ محليًا');
  await page.locator('#field-spine').fill('12');
  await page.locator('details').last().locator('summary').click();
  await page.getByRole('checkbox',{name:'إضافة باركود ISBN-13'}).check();
  await page.locator('#isbn').fill('9780306406158');
  await page.getByRole('button',{name:'تصدير القالب'}).click();
  await expect(page.getByRole('button',{name:'تنزيل SVG'})).toBeDisabled();
  await page.locator('#isbn').fill('9780306406157');
  await expect(page.getByRole('button',{name:'تنزيل SVG'})).toBeEnabled();
  const svgDownload=page.waitForEvent('download');
  await page.getByRole('button',{name:'تنزيل SVG'}).click();
  const svgFile=await svgDownload;
  const svgPath=testInfo.outputPath('barcode.svg');
  await svgFile.saveAs(svgPath);
  const svg=await readFile(svgPath,'utf8');
  expect(svg).toContain('id="barcode"');
  expect(svg).toMatch(/<path stroke="#000000" stroke-width="2"/);
  const pdfDownload=page.waitForEvent('download');
  await page.getByRole('button',{name:'تنزيل PDF'}).click();
  const pdfFile=await pdfDownload;
  await pdfFile.saveAs(testInfo.outputPath('barcode.pdf'));
});
