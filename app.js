const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');

const token = '7346261146:AAERS6EyX2kU4ATsJ0IVZPwy2or65i5uwDE';
const chat_bot = '-1002235800968';
const bot = new TelegramBot(token, { polling: true });

let lastMainMessageId = null;
let greensConsecutivos = 0;
let greensSG = 0;
let greensG1 = 0;
let greensG2 = 0;
let reds = 0;

async function enviarMensagemTelegram(chat_id, mensagem, replyToMessageId = null) {
  try {
    const response = await bot.sendMessage(chat_id, mensagem, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_to_message_id: replyToMessageId 
    });
    return response.message_id;
  } catch (error) {
    console.error('Erro ao enviar mensagem para o Telegram:', error);
  }
}

bot.onText(/\/start/, () => {
  bot.sendMessage(1905184571, `🚀 *Placar do dia:* 🟢 ${greensSG+greensG1+greensG2}  🔴 ${reds}\n\n🎯  SG ${greensSG} | G1 ${greensG1} | G2 ${greensG2}\n\n💰 *Estamos com ${greensConsecutivos} Greens seguidos!*`, { parse_mode: 'Markdown' });
});

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('https://www.tipminer.com/historico/pragmatic/roleta-brasileira?limit=1&t=1724209457366&subject=filter');

  let lastTime = '';
  let paresConsecutivos = 0;
  let imparesConsecutivos = 0;
  let g1 = "";
  let g2 = "";
  const qtdRepeticoes = 4;

  const checkForUpdates = async () => {

    await page.waitForSelector('.grid__row.flex.flex-1.flex-row.items-start.justify-between');

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
        paresConsecutivos++;
        console.log(data.result);

        if(imparesConsecutivos === qtdRepeticoes){
          await enviarMensagemTelegram(chat_bot, `GREEN (${number}) ✅`, lastMainMessageId);
          greensSG++
          greensConsecutivos++;
        }
        if(imparesConsecutivos === qtdRepeticoes+1){
          await enviarMensagemTelegram(chat_bot, `GREEN (${g1} | ${number}) ✅`, lastMainMessageId);
          greensG1++
          greensConsecutivos++;
        }
        if(imparesConsecutivos === qtdRepeticoes+2){
          await enviarMensagemTelegram(chat_bot, `GREEN (${g1} | ${g2} | ${number}) ✅`,lastMainMessageId);
          greensG2++;
          greensConsecutivos++;
        }
        imparesConsecutivos = 0; 

      } else {
        imparesConsecutivos++;
        console.log(data.result);

        if(paresConsecutivos === qtdRepeticoes){
          await enviarMensagemTelegram(chat_bot, `GREEN (${number}) ✅`, lastMainMessageId);
          greensSG++
          greensConsecutivos++;
        }
        if(paresConsecutivos === qtdRepeticoes+1){
          await enviarMensagemTelegram(chat_bot, `GREEN (${g1} | ${number}) ✅`, lastMainMessageId);
          greensG1++
          greensConsecutivos++;
        }
        if(paresConsecutivos === qtdRepeticoes+2){
          await enviarMensagemTelegram(chat_bot, `GREEN (${g1} | ${g2} | ${number}) ✅`, lastMainMessageId);
          greensG2++;
          greensConsecutivos++;
        }
        paresConsecutivos = 0; 
      }

      if(paresConsecutivos === qtdRepeticoes){
        lastMainMessageId = await enviarMensagemTelegram(chat_bot, `Entrar nos números IMPARES após o (${number})`);
      } 
      if(paresConsecutivos === qtdRepeticoes+1){
        g1 = number;
      }
      if(paresConsecutivos === qtdRepeticoes+2){
        g2 = number;
      }
      if(paresConsecutivos === qtdRepeticoes+3){
        await enviarMensagemTelegram(chat_bot, `RED (${g1} | ${g2} | ${number}) 🔻`, lastMainMessageId);
        reds++
        greensConsecutivos = 0;
      } 

      if(imparesConsecutivos === qtdRepeticoes){
        lastMainMessageId = await enviarMensagemTelegram(chat_bot, `Entrar nos números PARES após o (${number})`);
      } 
      if(imparesConsecutivos === qtdRepeticoes+1){
        g1 = number;
      }
      if(imparesConsecutivos === qtdRepeticoes+2){
        g2 = number;
      }
      if(imparesConsecutivos === qtdRepeticoes+3){
        await enviarMensagemTelegram(chat_bot, `RED (${g1} | ${g2} | ${number}) 🔻`, lastMainMessageId);
        reds++;
        greensConsecutivos = 0;
      } 

    }

  };

  setInterval(checkForUpdates, 1000);

})();