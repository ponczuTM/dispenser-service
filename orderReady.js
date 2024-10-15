const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const port = new SerialPort({
  path: 'COM8',  
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
});

const parser = port.pipe(new ReadlineParser({ delimiter: ';' }));

function sendToDispenser(command) {
  return new Promise((resolve, reject) => {
    console.log(`Wysyłam: ${command}`);
    port.write(command, (err) => {
      if (err) {
        return reject(`Błąd wysyłania: ${err.message}`);
      }
      console.log('Komenda wysłana.');
    });

    parser.once('data', (data) => {
      console.log(`Odpowiedź otrzymana: ${data}`);
      resolve(data);
    });

    setTimeout(() => {
      reject('Brak odpowiedzi z Dispensera.');
    }, 2000);
  });
}

async function orderReady(pagerNumber) {
  const command = `**ORDER_READY:${pagerNumber}*;`; 
  try {
    const response = await sendToDispenser(command);
    if (response.includes(`**ORDER_READY:${pagerNumber}*`)) {
      console.log(`Pager ${pagerNumber} zaczyna wydawać dźwięk lub wibrować.`);
    } else {
      console.log('Błąd podczas aktywacji pagera.');
    }
  } catch (error) {
    console.error(error);
  }
}

const pagerNumber = '125';  
orderReady(pagerNumber);

port.on('error', function (err) {
  console.log('Błąd portu szeregowego: ', err.message);
});