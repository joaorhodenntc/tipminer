const { playwright } = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  await page.goto('https://www.tipminer.com/historico/pragmatic/roleta-brasileira?limit=1&t=1724209457366&subject=filter');

  let lastTime = '';
  let consecutiveEvenCount = 0;

  const checkForUpdates = async () => {
    const data = await page.evaluate(() => {
      const gridRow = document.querySelector('.grid__row.flex.flex-1.flex-row.items-start.justify-between');
      
      const lastGroup = gridRow.querySelectorAll('.group.relative');
      const lastGroupElement = lastGroup[lastGroup.length - 1];
      
      // Captura o último valor
      const cellResult = lastGroupElement.querySelector('.cell__result').innerText;
      
      // Captura o horário
      const cellDate = lastGroupElement.querySelector('.cell__tooltip').innerText;

      return { result: cellResult, time: cellDate };
    });

    if (data && data.time !== lastTime) {
      lastTime = data.time;

      // Verifica se o número é par
      const number = parseFloat(data.result);
      if (number % 2 === 0) {
        consecutiveEvenCount++;
        console.log('Número Par:', data.result);
      } else {
        console.log('Número Impar:', data.result);
        consecutiveEvenCount = 0; 
      }

      if (consecutiveEvenCount === 3) {
        console.log('\n3 Números Pares Consecutivos!');
        console.log('\nEntrar nos números Impares');
        consecutiveEvenCount = 0;
      }
    }
  };

  setInterval(checkForUpdates, 1000);

})();
