const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
app.use(express.json());

const port = new SerialPort({
  path: 'COM8',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
});

const parser = port.pipe(new ReadlineParser({ delimiter: ';' }));

let assignedNumbers = []; 

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

async function sendOrderNumber(orderNumber, cornerNumber) {
  const command = `**SET_NO:${orderNumber}${cornerNumber}*;`;
  try {
    const response = await sendToDispenser(command);
    if (response.includes(`**SET_NO:${orderNumber}${cornerNumber}*`) && response.includes('01')) {
      console.log('Numer zamówienia wysłany i zaakceptowany.');
    } else {
      console.log('Błąd wysyłania numeru zamówienia.');
    }
  } catch (error) {
    console.error(error);
  }
}

function generateUniquePagerNumber() {
  let pagerNumber;
  do {
    pagerNumber = Math.floor(100 + Math.random() * 900).toString(); 
  } while (assignedNumbers.includes(pagerNumber));
  assignedNumbers.push(pagerNumber); 
  return pagerNumber;
}

app.post('/order', async (req, res) => {
  const { orderNumber } = req.body; 
  const pagerNumber = generateUniquePagerNumber(); 

  console.log(`Przyjęto zamówienie: ${orderNumber}, nadano numer pagera: ${pagerNumber}`);

  try {
    await sendOrderNumber(orderNumber, pagerNumber); 
    res.json({ success: true, pagerNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(5000, () => {
  console.log('Serwer nasłuchuje na porcie 5000');
});

port.on('error', function (err) {
  console.log('Błąd portu szeregowego: ', err.message);
});