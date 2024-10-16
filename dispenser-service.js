const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
app.use(cors()); 
app.use(express.json()); 

const port = new SerialPort({
  path: "COM8",
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
});

const parser = port.pipe(new ReadlineParser({ delimiter: ";" }));

let pagerNumbers = [];

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

async function sendOrderNumber(orderNumber, cornerNumber) {
  const command = `**SET_NO:${orderNumber}${cornerNumber}*;`;
  try {
    const response = await sendToDispenser(command);
    if (response.includes(`**SET_NO:${orderNumber}${cornerNumber}*`) && response.includes("01")) {
      console.log("Numer zamówienia wysłany i zaakceptowany.");
    } else {
      console.log("Błąd wysyłania numeru zamówienia.");
    }
  } catch (error) {
    console.error(error);
  }
}

function generateUniquePagerNumber() {
  let pagerNumber;
  do {
    pagerNumber = Math.floor(100 + Math.random() * 900); 
  } while (pagerNumbers.includes(pagerNumber)); 
  pagerNumbers.push(pagerNumber); 
  return pagerNumber;
}

app.post("/send-order", async (req, res) => {
  const { cornerNumber } = req.body;

  if (!cornerNumber) {
    return res.status(400).send("Invalid request: cornerNumber is required.");
  }

  const orderNumber = generateUniquePagerNumber();
  console.log(`Przyjęto zamówienie: Order: ${orderNumber}, Corner: ${cornerNumber}`);

  try {
    await sendOrderNumber(orderNumber, cornerNumber);
    res.json({ message: "Zamówienie wysłane do Dispensera.", orderNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd wysyłania do Dispensera." });
  }
});

const backendPort = 5000;
app.listen(backendPort, () => {
  console.log(`Serwis nasłuchuje na porcie ${backendPort}.`);
});

port.on("error", function (err) {
  console.log("Błąd portu szeregowego: ", err.message);
});