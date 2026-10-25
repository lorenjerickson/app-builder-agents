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
writeFileSync(resolve(temp,'entry.js'), `const React = require('react'); const {createRoot} = require('react-dom/client'); const {Product} = require('./product.js'); createRoot(document.getElementById('root')).render(React.createElement(Product,{identity:{actor:'fixture-a',label:'Member A',role:'member',csrf:'${'a'.repeat(64)}',local:true,mode:'container-test'},screen:location.pathname.startsWith('/equipment/')?['equipment','00000002-0000-4000-8000-000000000001']:['equipment']}));`);
await new Promise((done,fail) => webpackPackage.webpack({ mode:'development',devtool:false,entry:resolve(temp,'entry.js'),output:{path:temp,filename:'bundle.js'},resolve:{modules:[resolve(web,'node_modules'),'node_modules'],alias:{'@/lib/product-contract':resolve(temp,'product-contract.js')}}},(error,stats)=>error?fail(error):stats.hasErrors()?fail(new Error(stats.toString({all:false,errors:true}))):done()));
const bundle=readFileSync(resolve(temp,'bundle.js'),'utf8');
const css=readFileSync(resolve(web,'app/globals.css'),'utf8');
const browser=await chromium.launch({headless:true});
const observations=[];
try {
  for (const width of [390,1440]) {
    const context=await browser.newContext({viewport:{width,height:width===390?844:900}});
    const page=await context.newPage();
    let logout=0;
    await page.exposeFunction('__recordSubmit',record=>observations.push({width,check:'submit-boundary',...record}));
    await page.addInitScript(()=>document.addEventListener('submit',event=>{
      if(event.target instanceof HTMLFormElement && event.target.getAttribute('action')==='/local-session') {
        window.__recordSubmit({formConnected:event.target.isConnected});
      }
    }));
    const item={id:'00000002-0000-4000-8000-000000000001',inventoryCode:'BB-001',name:'Field recorder',description:'Synthetic shared equipment.',state:'available',ownActiveLoanId:null};
    await page.route('http://localhost:39876/**',async route=>{
      const request=route.request(), path=new URL(request.url()).pathname;
      if(path==='/local-session') { logout++; assert.equal(request.method(),'POST'); assert.equal(request.postData(),'account=logout'); return route.fulfill({contentType:'text/html',body:'<h1>Choose a test account</h1>'}); }
      if(path==='/api/v1/equipment')return route.fulfill({json:{items:[item]}});
      if(path===`/api/v1/equipment/${item.id}`)return route.fulfill({json:item});
      if(path.endsWith('/checkout'))return route.fulfill({status:503,json:{error:{code:'OPERATION_UNRESOLVED',message:'Unconfirmed'}}});
      if(path==='/bundle.js')return route.fulfill({contentType:'text/javascript; charset=utf-8',body:bundle});
      return route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>`});
    });
    await page.goto('http://localhost:39876/equipment');
    await page.getByRole('link',{name:'View Field recorder'}).waitFor();
    const layout=await page.getByRole('button',{name:'Sign out',exact:true}).evaluate(element=>{
      const range=document.createRange();range.selectNodeContents(element); const rects=Array.from(range.getClientRects());
      return {lines:rects.length,height:element.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    observations.push({width,check:'header',...layout});
    await page.screenshot({path:resolve(out,`${width}-header.png`)});
    await page.getByRole('button',{name:'Sign out',exact:true}).focus();
    await page.keyboard.press('Enter');
    let signedOut=false;
    try { await page.getByRole('heading',{name:'Choose a test account'}).waitFor({timeout:3000}); signedOut=true; } catch { /* Capture original failure before repair. */ }
    observations.push({width,check:'keyboard-logout',requests:logout,signedOut});
    await page.goto(`http://localhost:39876/equipment/${item.id}`);
    await page.getByRole('button',{name:'Borrow',exact:true}).click();
    await page.getByRole('heading',{name:"We couldn't confirm the result"}).waitFor();
    const retry=await page.getByRole('button',{name:'Retry same request',exact:true}).count();
    const guidance=await page.getByText('If the result is still unknown, check again when the service is available.',{exact:true}).count();
    observations.push({width,check:'uncertainty-copy',retry,guidance});
    await page.screenshot({path:resolve(out,`${width}-uncertainty.png`)});
    const retainedBefore=await page.evaluate(()=>sessionStorage.getItem('borrowbench.intent.v1.fixture-a'));
    assert.ok(retainedBefore,'uncertain intent saved before logout');
    await page.getByRole('button',{name:'Sign out',exact:true}).focus();await page.keyboard.press('Enter');
    await page.getByRole('heading',{name:'Choose a test account'}).waitFor();
    const retainedAfter=await page.evaluate(()=>sessionStorage.getItem('borrowbench.intent.v1.fixture-a'));
    assert.equal(retainedAfter,retainedBefore,'logout must not discard uncertain original actor intent');
    observations.push({width,check:'logout-retains-intent',preserved:true});
    await context.close();
  }
} finally { await browser.close(); writeFileSync(resolve(out,'observations.json'),JSON.stringify(observations,null,2)+'\n'); }
for(const row of observations) {
  if(row.check==='submit-boundary') assert.equal(row.formConnected,true,'native form remains mounted through submit event');
  if(row.check==='header') {assert.equal(row.lines,1,`Sign out one line at${row.width}`);assert.equal(row.overflow,false);assert.ok(row.height>=44);}
  if(row.check==='keyboard-logout') {assert.equal(row.requests,1,`native POST at${row.width}`);assert.equal(row.signedOut,true);}
  if(row.check==='uncertainty-copy') {assert.equal(row.retry,1);assert.equal(row.guidance,1);}
}
console.log('PASS: native keyboard logout, single-line Sign out, uncertainty label/guidance at390/1440; mocked network, no app service.');
