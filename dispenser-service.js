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

let usedOrderNumbers = new Set(); 

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
    if (response.includes(`**SET_NO:${orderNumber}*`) && response.includes("01")) {
      console.log("Numer zamówienia wysłany i zaakceptowany.");
    } else {
      console.log("Błąd wysyłania numeru zamówienia.");
    }
  } catch (error) {
    console.error(error);
  }
}

app.post("/order", async (req, res) => {
  const { orderNumber } = req.body;

  if (usedOrderNumbers.has(orderNumber)) {
    return res.status(400).send({ error: "Numer zamówienia już użyty." });
  }

  usedOrderNumbers.add(orderNumber);
  await sendOrderNumber(orderNumber);
  res.send({ message: "Numer zamówienia przekazany." });
});

async function main() {
  await checkConnection();
}

main();

port.on("error", function (err) {
  console.log("Błąd portu szeregowego: ", err.message);
});

app.listen(3000, () => {
  console.log("Serwer działa na porcie 3000");
});