const { SerialPort } = require("serialport");

const portName = "COM9";
const baudRate = 1200;

const port = new SerialPort({
  path: portName,
  baudRate: baudRate,
});

const sendPage = (pagerNumber) => {
  const formats = [
    `${pagerNumber}\n`,
    `PAGER ${pagerNumber}\n`,
    `☻${pagerNumber}♥`,
    `${pagerNumber}\r`,
    `${pagerNumber}\r\n`,
    `PAGE:${pagerNumber}`,
    `Number:${pagerNumber}\n`,
    `${pagerNumber} END`,
  ];

  formats.forEach((message) => {
    console.log(`Wysyłam do pagera ${pagerNumber}: ${message}`);

    port.write(message, (err) => {
      if (err) {
        return console.error("Błąd podczas wysyłania: ", err.message);
      }
      console.log(`Wysłano do pagera ${pagerNumber}: ${message}`);
    });
  });
};

port.on("open", () => {
  console.log(`Port ${portName} otwarty`);

  const pagerNumbers = [569, 956, 695];
  pagerNumbers.forEach(sendPage);

  console.log("Wszystkie dane zostały wysłane.");
});

port.on("error", (err) => {
  console.error("Błąd portu: ", err.message);
});
