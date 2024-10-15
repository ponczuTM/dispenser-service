const express = require('express');
const bodyParser = require('body-parser');
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
const port = new SerialPort({
  path: "COM8",
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
});
const parser = port.pipe(new ReadlineParser({ delimiter: ";" }));

app.use(bodyParser.json());

let orderNumbers = []; 

function sendToDispenser(command) {
  return new Promise((resolve, reject) => {
    console.log(`Wysyłam: ${command}`);
    port.write(command, (err) => {
      if (err) {
        return reject(`Błąd wysyłania: ${err.message}`);
      }
      console.log("Komenda wysłana.");
    });

    parser.once("data", (data) => {
      console.log(`Odpowiedź otrzymana: ${data}`);
      resolve(data);
    });

    setTimeout(() => {
      reject("Brak odpowiedzi z Dispensera.");
    }, 2000);
  });
}

async function checkConnection() {
  try {
    const response = await sendToDispenser("**CONN_ON*;");
    if (response.includes("**CONN_ON*") && response.includes("01")) {
      console.log("Połączenie z Dispenserem udane.");
    } else {
      console.log("Błąd połączenia z Dispenserem.");
    }
  } catch (error) {
    console.error(error);
  }
}

async function sendOrderNumber(orderNumber) {
  const command = `**SET_NO:${orderNumber}*;`;
  try {
    const response = await sendToDispenser(command);
    if (
      response.includes(`**SET_NO:${orderNumber}*`) &&
      response.includes("01")
    ) {
      console.log("Numer zamówienia wysłany i zaakceptowany.");
      return true; 
    } else {
      console.log("Błąd wysyłania numeru zamówienia.");
      return false; 
    }
  } catch (error) {
    console.error(error);
    return false; 
  }
}

app.post('/order', async (req, res) => {
  const orderNumber = req.body.orderNumber;

  if (orderNumbers.includes(orderNumber)) {
    return res.status(400).json({ message: "Numer zamówienia już istnieje." });
  }

  orderNumbers.push(orderNumber);

  const isSent = await sendOrderNumber(orderNumber);
  if (isSent) {
    return res.json({ message: "Zamówienie złożone pomyślnie.", orderNumber });
  } else {

    orderNumbers = orderNumbers.filter(num => num !== orderNumber); 
    return res.status(500).json({ message: "Wystąpił błąd przy składaniu zamówienia." });
  }
});

async function main() {
  await checkConnection();
}

app.listen(9000, () => {
  console.log("Serwer działa na porcie 9000");
});

main();

port.on("error", function (err) {
  console.log("Błąd portu szeregowego: ", err.message);
});