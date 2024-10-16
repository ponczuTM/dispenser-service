const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const cors = require("cors");

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());

const serialPort = new SerialPort({
  path: "COM8",
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: ";" }));

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

app.post("/sendOrder", async (req, res) => {
  const { orderNumber } = req.body;
  console.log(orderNumber);

  const command = `**SET_NO:${orderNumber}*;`;

  try {
    const response = await sendToDispenser(command);
    if (
      response.includes(`**SET_NO:${orderNumber}*`) &&
      response.includes("01")
    ) {
      console.log(`Numer zamówienia ${orderNumber} wysłany i zaakceptowany.`);
      res
        .status(200)
        .json({ message: "Numer zamówienia wysłany", orderNumber });
    } else {
      console.log("Błąd wysyłania numeru zamówienia.");
      res.status(500).json({ message: "Błąd wysyłania numeru zamówienia" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd podczas komunikacji z Dispenserem" });
  }
});

app.listen(port, () => {
  console.log(`Serwer nasłuchuje na porcie ${port}`);
});

serialPort.on("error", (err) => {
  console.log("Błąd portu szeregowego: ", err.message);
});
