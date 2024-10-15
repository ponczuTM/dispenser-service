const express = require("express");
const bodyParser = require("body-parser");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
const PORT = 3000;

app.use(bodyParser.json()); 

const port = new SerialPort({
  path: "COM8",
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
});

const parser = port.pipe(new ReadlineParser({ delimiter: ";" }));
let existingOrderNumbers = [];

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

function generateUniqueOrderNumber() {
  let orderNumber;
  do {
    orderNumber = Math.floor(100 + Math.random() * 900); 
  } while (existingOrderNumbers.includes(orderNumber)); 
  existingOrderNumbers.push(orderNumber); 
  return orderNumber;
}

app.post("/order", async (req, res) => {
  const orderNumber = generateUniqueOrderNumber();
  const cornerNumber = req.body.cornerNumber; 
  const command = `**SET_NO:${orderNumber}${cornerNumber}*;`;

  try {
    const response = await sendToDispenser(command);
    if (response.includes(`**SET_NO:${orderNumber}${cornerNumber}*`) && response.includes("01")) {
      console.log("Numer zamówienia wysłany i zaakceptowany.");
      res.status(200).json({ orderNumber });
    } else {
      console.log("Błąd wysyłania numeru zamówienia.");
      res.status(500).json({ error: "Błąd wysyłania numeru zamówienia." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

async function main() {
  await checkConnection();
  app.listen(PORT, () => {
    console.log(`Serwis nasłuchuje na porcie ${PORT}`);
  });
}

main();

port.on("error", function (err) {
  console.log("Błąd portu szeregowego: ", err.message);
});