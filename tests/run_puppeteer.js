const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERR:', err.message));
    
    const uri = 'http://127.0.0.1:3000/';
    console.log('Loading', uri);
    await page.goto(uri, {waitUntil: 'networkidle0'}).catch(console.error);

    // Simulate clicking a profile to load it
    try {
        await page.evaluate(() => {
            if (window.DashboardUI) {
                console.log('DashboardUI is loaded, clicking category...');
                window.DashboardUI.seleccionarCategoriaInicial('gelato_leche');
            } else {
                console.error('DashboardUI NOT defined!');
            }
        });
        await new Promise(r => setTimeout(r, 2000));
        
        const topElementInfo = await page.evaluate(() => {
            const el = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
            if (!el) return "None";
            return {
                id: el.id,
                className: el.className,
                tagName: el.tagName,
                display: window.getComputedStyle(el).display,
                opacity: window.getComputedStyle(el).opacity,
                pointerEvents: window.getComputedStyle(el).pointerEvents,
                zIndex: window.getComputedStyle(el).zIndex
            };
        });
        console.log("Top Element Covering Screen:", topElementInfo);
        
        // Also check if lock is actually hidden
        const lockInfo = await page.evaluate(() => {
            const l = document.getElementById('dashboardSelectionPlaceholder');
            return l ? l.className : "No lock found";
        });
        console.log("Lock element class list:", lockInfo);

    } catch(e) {
        console.error("Eval error", e);
    }
    
    await browser.close();
})();
