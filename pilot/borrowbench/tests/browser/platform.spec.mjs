import { test, expect } from '@playwright/test';
// Isolated compiled verify scaffold. These are local test identities, not Auth0 proof.
for (const [label,role] of [['Member A','member'],['Member B','member'],['Custodian','custodian']]) {
 test(`${label} reaches API/database and leaves account`,async({page})=>{
  await page.goto('/');
  await expect(page.getByText('Container test mode — Auth0 is bypassed')).toBeVisible();
  expect((await page.request.get('/api/platform')).status()).toBe(401);
  await page.getByRole('button',{name:`Use ${label}`,exact:true}).click();
  await expect(page.getByText(`Using ${label} (${role}).`,{exact:true})).toBeVisible();
  await expect(page.getByText(`Connected as ${label} (${role}). BorrowBench data is available.`,{exact:true})).toBeVisible();
  const response=await page.request.get('/api/platform');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({label,role,platform:'BorrowBench'});
  await page.getByRole('button',{name:'Leave test account'}).click();
  await expect(page.getByText('Choose a test account to continue.')).toBeVisible();
  expect((await page.request.get('/api/platform')).status()).toBe(401);
 });
}
