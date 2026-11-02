export async function checkAssemblyOverview({page,check,manifest,out}){
 check(await page.evaluate(()=>window.currentOverviewState.source.includes('/system-assembly-v1/')),'Overview opens the interactive system assembly');
 const frame=await (await page.locator('#current-board-preview').elementHandle()).contentFrame();
 await frame.waitForFunction(()=>window.systemViewer?.getState().ready,null,{timeout:120000});
 let state=await frame.evaluate(()=>window.systemViewer.getState());
 check(state.frontendCount===8&&state.visibleFrontends.length===8&&state.connections.length===8&&state.pcVisible&&state.pcieVisible,'Whole assembly includes eight stacks, HDMI links and PCIe/PC');
 check(await page.locator('#overview-downloads').isVisible(),'Current file downloads stay beside the assembly');
 for(const b of manifest.boards)check(await page.locator('#overview-downloads a[download][href="'+b.full_kicad+'"]').isVisible(),b.name+' full KiCad link on overview');
 await page.screenshot({path:out+'/assembly-desktop.png',fullPage:true});
 await frame.locator('#frontend').click();check((await frame.evaluate(()=>window.systemViewer.getState())).visibleFrontends.length===1,'Single frontend stack inspection');
 const before=await frame.evaluate(()=>window.systemViewer.getState().connections[0].end[1]);
 await frame.locator('#separation').fill('8');await frame.locator('#separation').dispatchEvent('input');
 check((await frame.evaluate(()=>window.systemViewer.getState().connections[0].end[1]))===before+8,'Separation control expands the stack and moves its cable endpoint');
 await frame.locator('#fit').click();await page.screenshot({path:out+'/stack-separated.png'});
 await frame.locator('#host').click();check((await frame.evaluate(()=>window.systemViewer.getState())).visibleFrontends.length===0,'HDMI Extension Board and XEM host inspection');
 check((await frame.locator('#labels').innerText()).includes('HDMI Extension Board'),'Assembly labels use the current HDMI Extension Board name');
 await frame.locator('#pc').click();state=await frame.evaluate(()=>window.systemViewer.getState());check(state.pcVisible&&state.pcieVisible,'PC and PCIe inspection');
 await frame.locator('#link').selectOption('3');state=await frame.evaluate(()=>window.systemViewer.getState());check(state.selectedLink===3&&state.connections.filter(x=>x.visible).length===1,'Individual HDMI link inspection');
 await frame.locator('#separation').fill('0');await frame.locator('#separation').dispatchEvent('input');await frame.locator('#all').click();await frame.locator('#fit').click();
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);
 check(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,'Assembly overview fits mobile width');
 check(await frame.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,'Assembly controls fit mobile width');
 await page.screenshot({path:out+'/assembly-mobile.png'});await page.locator('#overview-downloads').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/downloads-mobile.png'});
 await page.setViewportSize({width:1440,height:1000});
}
