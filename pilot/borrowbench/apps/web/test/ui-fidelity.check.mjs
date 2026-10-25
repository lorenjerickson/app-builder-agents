// Targeted real-browser component regression; network is intercepted, no app service is started.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const { chromium } = require('@playwright/test');
const webpackPackage = require('next/dist/compiled/webpack/webpack');
const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(resolve(tmpdir(), 'borrowbench-ui-repair-'));
const out = resolve(process.argv[2]); mkdirSync(out, { recursive: true });
for (const [source, target] of [['app/components/product.tsx','product.js'],['lib/product-contract.ts','product-contract.js']]) {
  writeFileSync(resolve(temp,target), ts.transpileModule(readFileSync(resolve(web,source),'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText);
}
writeFileSync(resolve(temp,'entry.js'), `const React=require('react');const {createRoot}=require('react-dom/client');const {Product}=require('./product.js');createRoot(document.getElementById('root')).render(React.createElement(Product,{identity:{actor:'fixture-a',label:new URLSearchParams(location.search).get('role')==='member'?'Member A':'Custodian',role:new URLSearchParams(location.search).get('role')||'custodian',csrf:'${'a'.repeat(64)}',local:true,mode:'container-test'},screen:location.pathname.split('/').filter(Boolean)}));`);
await new Promise((done,fail) => webpackPackage.webpack({ mode:'development',devtool:false,entry:resolve(temp,'entry.js'),output:{path:temp,filename:'bundle.js'},resolve:{modules:[resolve(web,'node_modules'),'node_modules'],alias:{'@/lib/product-contract':resolve(temp,'product-contract.js')}}},(error,stats)=>error?fail(error):stats.hasErrors()?fail(new Error(stats.toString({all:false,errors:true}))):done()));
const bundle=readFileSync(resolve(temp,'bundle.js'),'utf8');
const css=readFileSync(resolve(web,'app/globals.css'),'utf8');
const browser=await chromium.launch({headless:true});
const observations=[];
const item={id:'00000002-0000-4000-8000-000000000001',inventoryCode:'BB-001',name:'Field recorder',description:'Synthetic shared equipment.',state:'available',ownActiveLoanId:null};
const cases=[['member-detail','/equipment/'+item.id+'?role=member','Field recorder','Borrow'],['member-on-loan','/equipment/'+item.id+'?role=member','Field recorder','Back to equipment'],['history-empty','/history','Team history','Browse equipment'],['item-not-found','/equipment/'+item.id,'Equipment not found','Browse equipment'],['loan-not-found','/loans/'+item.id,'Loan not found','Open My Loans'],['unavailable','/equipment','We can’t reach BorrowBench','Refresh'],['denied','/history','You don’t have access','Go to equipment'],['session-expired','/equipment','Your session has ended','Choose test account'],['loans-empty','/loans','My Loans','Browse equipment'],['detail-maintenance','/equipment/'+item.id,'Field recorder · Maintenance','Back to equipment'],['custodian-available-detail','/equipment/'+item.id,'Field recorder · Available','Borrow'],['key-reuse','/equipment/'+item.id,'This request could not be sent','Check original result'],['still-unknown','/equipment/'+item.id,'The borrow result is still unknown','Retry same borrow'],['pending','/equipment/'+item.id,'Borrowing…','Borrowing…']];
try {for(const width of [390,1440])for(const [state,path,heading,control] of cases){
const context=await browser.newContext({viewport:{width,height:width===390?844:900}});const page=await context.newPage();let release;
await page.route('http://localhost:39876/**',async route=>{const url=new URL(route.request().url());const p=url.pathname;
if(p==='/bundle.js')return route.fulfill({contentType:'text/javascript; charset=utf-8',body:bundle});
if(p.startsWith('/api/')){
if(p.endsWith('/checkout')) {if(state==='pending'){await new Promise(r=>release=r);return route.abort();}return route.fulfill({status:state==='key-reuse'?409:503,json:{error:{code:state==='key-reuse'?'KEY_REUSE':'OPERATION_UNRESOLVED'}}});}
if(p.endsWith('/lookup'))return route.fulfill({status:404,json:{error:{code:'OPERATION_NOT_FOUND'}}});
const status=state.includes('not-found')?404:state==='unavailable'?503:state==='denied'?403:state==='session-expired'?401:200;
return route.fulfill({status,json:status!==200?{error:{code:'READ_ERROR'}}:p.endsWith('/audit-events')?{events:[],nextCursor:null}:p.endsWith('/mine')?{active:[],returned:[],nextReturnedCursor:null}:p.endsWith('/equipment')?{items:[item]}:{...item,state:state==='detail-maintenance'?'maintenance':state==='member-on-loan'?'on_loan':'available'}});
}return route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>`});});
await page.goto('http://localhost:39876'+path);
if(['key-reuse','still-unknown','pending'].includes(state)){await page.getByRole('button',{name:'Borrow',exact:true}).click();if(state==='still-unknown')await page.getByRole('button',{name:'Check result',exact:true}).click();}
await page.getByRole('heading',{name:heading,exact:true}).waitFor();const c=page.getByRole(['Borrow','Refresh','Check original result','Retry same borrow','Borrowing…'].includes(control)?'button':'link',{name:control,exact:true});await c.waitFor();
if(state.startsWith('member-')){const lines=await page.locator('main > p').allTextContents();assert.deepEqual(lines.slice(0,3),['BB-001 · Shared equipment',state==='member-on-loan'?'On loan':'Available',item.description]);assert.equal(await page.getByRole('button',{name:'Mark for maintenance',exact:true}).count(),0);}
if(state==='custodian-available-detail'){await page.getByText('Available shared equipment. Borrow only for your current account.',{exact:true}).waitFor();assert.equal(await page.getByText('BB-001 · Shared equipment',{exact:true}).count(),0);}
if(state==='detail-maintenance'){await page.getByText('BB-001 · Synthetic shared equipment. This item is unavailable while in maintenance.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Borrow',exact:true}).count(),0);}
if(state==='loan-not-found')assert.equal(await c.getAttribute('href'),'/loans');
if(['history-empty','item-not-found','loan-not-found','denied','loans-empty'].includes(state))assert.match(await c.getAttribute('class'),/primary/);
if(state==='unavailable')assert.equal(await page.getByRole('checkbox').count(),0);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.screenshot({path:resolve(out,`${width}-${state}.png`)});observations.push({width,state,heading,control,pass:true});release?.();await context.close();
}}finally{await browser.close();writeFileSync(resolve(out,'observations.json'),JSON.stringify(observations,null,2));}
assert.equal(observations.length,28);console.log('PASS: 28 native content/control component cases; intercepted transport, no runtime proof.');
