import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const directory=resolve(import.meta.dirname,'../../captures/en');
test('English screenshots use fictional data only',async({page})=>{
 await mkdir(directory,{recursive:true});
 const capture=async(name:string)=>{await page.screenshot({path:resolve(directory,name+'.png'),fullPage:true,animations:'disabled'});};
 const nav=async(name:string)=>page.locator(`nav [data-page="${name}"]`).click();
 await page.goto('/');
 await page.locator('#language-select').selectOption('en');
 await capture('01-welcome');
 await page.locator('[data-action="demo"]').click();
 await expect(page.locator('#car-viewer canvas')).toBeVisible();
 await page.waitForTimeout(700);
 await capture('02-dashboard-3d');
 await nav('folders');await capture('03-fleet-folders');
 await nav('parts');await capture('04-parts-reminders');
 await nav('book');await capture('05-service-log');
 await nav('fuel');await capture('06-fuel-consumption');
 await page.route('https://data.economie.gouv.fr/**',async route=>route.fulfill({json:{total_count:2,results:[
  {id:1,ville:'Paris',cp:'75012',adresse:'55 BLD DE PICPUS',gazole_prix:2.19,gazole_maj:'2026-11-08T00:01:00+00:00',geom:{lat:48.846,lon:2.401},services_service:['Car wash']},
  {id:2,ville:'Paris',cp:'75012',adresse:'Demo avenue',gazole_prix:2.225,gazole_maj:'2026-11-08T00:01:00+00:00',geom:{lat:48.845,lon:2.402},services_service:['24-hour card payment']}
 ]}}));
 await nav('stations');
 await page.locator('[name="postcode"]').fill('75012');
 await page.locator('#stations-form [type="submit"]').click();
 await expect(page.locator('.station-card')).toHaveCount(2);
 await page.locator('#station-results').evaluate(el=>{const p=document.createElement('p');p.textContent='Illustrative demo prices — not current.';p.className='notice';el.prepend(p);});
 await capture('07-fuel-stations-demo');
 await nav('knowledge');
 await page.locator('#catalogue-search').fill('RENAULT KANGOO');
 await expect(page.locator('.catalogue-card').first()).toBeVisible();
 await capture('08-vehicle-catalog');
 await page.locator('[data-page="settings"]').first().click();
 await capture('09-privacy-backups');
});
