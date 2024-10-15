const express = require('express');
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
const port = 3000; 
const serialPort = new SerialPort({
  path: "COM8",
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: ";" }));

let usedOrderNumbers = []; 

app.use(express.json()); 

function sendToDispenser(command) {
  return new Promise((resolve, reject) => {
    console.log(`Wysyłam: ${command}`);
    serialPort.write(command, (err) => {
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

app.post('/order', async (req, res) => {
  const orderNumber = req.body.orderNumber;

  if (usedOrderNumbers.includes(orderNumber)) {
    return res.status(400).json({ error: "Numer zamówienia już istnieje. Wygeneruj nowy." });
  }

  usedOrderNumbers.push(orderNumber);

  const command = `SET_NO:${orderNumber}*;`;
  try {
    const response = await sendToDispenser(command);
    res.status(200).json({ message: "Numer zamówienia wysłany i zaakceptowany.", response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd podczas wysyłania zamówienia." });
  }
});

app.listen(port, () => {
  console.log(`Serwer działa na http://${port}`);
});

serialPort.on("error", function (err) {
  console.log("Błąd portu szeregowego: ", err.message);
});