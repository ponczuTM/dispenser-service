const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = new SerialPort({
  path: "COM8",
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
});

const parser = port.pipe(new ReadlineParser({ delimiter: ";" }));

let lastOrderNumber = 0;

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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateValidOrderNumber() {
  let orderNumber;
  while (true) {
    orderNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    if (
      orderNumber.length === 3 &&
      orderNumber[0] &&
      orderNumber[1] &&
      orderNumber[2]
    ) {
      break;
    }
    console.log("Nieprawidłowa liczba, generuję ponownie...");
    await delay(100);
  }
  return orderNumber;
}

async function sendOrderNumber(orderNumber, cornerNumber) {
  const command = `**SET_NO:${orderNumber}${cornerNumber}*`;
  try {
    const response = await sendToDispenser(command);
    if (
      response.includes(`**SET_NO:${orderNumber}${cornerNumber}*`) &&
      response.includes("01")
    ) {
      console.log("Numer zamówienia wysłany i zaakceptowany.");
      lastOrderNumber = orderNumber;
    } else {
      console.log("Błąd wysyłania numeru zamówienia.");
    }
  } catch (error) {
    console.error(error);
  }
}

app.get("/ordernumber", (req, res) => {
  const orderNumberStr = lastOrderNumber.toString().padStart(3, "0");
  const reorderedOrderNumber =
    orderNumberStr[1] + orderNumberStr[2] + orderNumberStr[0];

  res.status(200).json({ ordernumber: reorderedOrderNumber });
});

app.post("/order", async (req, res) => {
  const orderNumber = await generateValidOrderNumber();
  const cornerNumber = orderNumber;

  await sendOrderNumber(orderNumber, cornerNumber);

  const reorderedOrderNumber =
    lastOrderNumber.toString().padStart(3, "0")[1] +
    lastOrderNumber.toString().padStart(3, "0")[2] +
    lastOrderNumber.toString().padStart(3, "0")[0];

  res.status(200).json({ orderNumber: reorderedOrderNumber });
});

app.listen(PORT, () => {
  console.log(`Serwer nasłuchuje na porcie ${PORT}`);
  checkConnection();
});

port.on("error", function (err) {
  console.log("Błąd portu szeregowego: ", err.message);
});
