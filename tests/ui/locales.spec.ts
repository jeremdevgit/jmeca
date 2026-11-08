import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const translations: Record<string, Record<string,string>> = Object.fromEntries(['en','es','de','it','pt','zh-CN','ja'].map(locale => [locale, JSON.parse(readFileSync(resolve(import.meta.dirname, `../../src/locales/${locale}.json`), 'utf8'))]));
for (const locale of ['fr','en','es','de','it','pt','zh-CN','ja']) {
  test(`navigation and maintenance dialog in ${locale}`, async ({page}) => {
    await page.goto('/');
    await page.locator('#language-select').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang',locale);
    const label = (key:string) => locale === 'fr' ? key : translations[locale][key];
    await expect(page.getByRole('heading',{name:label('Bienvenue dans votre garage.')})).toBeVisible();
    await page.getByRole('button',{name:label('Explorer la démonstration')}).click();
    await expect(page.locator('nav [data-page="parts"]')).toContainText(label('Pièces & échéances'));
    await page.locator('nav [data-page="parts"]').click();
    await expect(page.getByRole('heading',{name:label('Pièces & échéances')})).toBeVisible();
    await page.locator('[data-action="add-part"]').first().click();
    await expect(page.getByRole('dialog')).toContainText(label('Pièce / opération'));
    await expect(page.getByRole('dialog')).toContainText(label('Dernière intervention'));
    await page.reload();
    await expect(page.locator('#language-select')).toHaveValue(locale);
  });
}

test('first launch follows the operating system language',async({browser})=>{
  const context=await browser.newContext({locale:'de-DE'});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:1420/');
  await expect(page.locator('#language-select')).toHaveValue('de');
  await expect(page.locator('html')).toHaveAttribute('lang','de');
  await context.close();
});
