import React, { useState } from "react";
import "./App.css";

const products = [
  { id: 1, category: "burgers", img: "bigmac.png", name: "BigMac" },
  { id: 2, category: "burgers", img: "hamburger.png", name: "Hamburger" },
  { id: 3, category: "burgers", img: "cheeseburger.png", name: "Cheeseburger" },
  { id: 4, category: "burgers", img: "chikker.png", name: "Chikker" },
  { id: 5, category: "burgers", img: "jalapenoburger.png", name: "Jalapeno Burger" },
  { id: 6, category: "burgers", img: "mcchiken.png", name: "McChiken" },
  { id: 7, category: "burgers", img: "mccrispy-supreme.png", name: "McCrispy Supreme" },
  { id: 8, category: "burgers", img: "mccrispy.png", name: "McCrispy" },
  { id: 9, category: "burgers", img: "mcdouble.png", name: "McDouble" },
  { id: 10, category: "burgers", img: "mcroyal-double.png", name: "McRoyal Double" },
  { id: 11, category: "burgers", img: "mcroyal.png", name: "McRoyal" },
  { id: 12, category: "burgers", img: "red-chikker.png", name: "Red Chikker" },
  { id: 13, category: "burgers", img: "veggie-burger.png", name: "Veggie Burger" },
  { id: 14, category: "burgers", img: "wiesmac-double.png", name: "Wieśmac Double" },
  { id: 15, category: "burgers", img: "wiesmac.png", name: "Wieśmac" },
  { id: 16, category: "mccafe", img: "caramel-latte-macchiato.png", name: "Caramel Latte Macchiato" },
  { id: 17, category: "mccafe", img: "espresso.png", name: "Espresso" },
];

function App() {
  const [quantities, setQuantities] = useState(
    products.reduce((acc, product) => {
      acc[product.id] = 0;
      return acc;
    }, {})
  );

  const increment = (id) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: prevQuantities[id] + 1,
    }));
  };

  const decrement = (id) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: Math.max(prevQuantities[id] - 1, 0),
    }));
  };

  const handleOrder = async () => {
    const orderDetails = { cornerNumber: "125" }; // Przykładowy numer rogu

    try {
      const response = await fetch("http://localhost:5000/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Zamówienie wysłane! Numer zamówienia: ${data.orderNumber}`);
      } else {
        alert("Błąd przy składaniu zamówienia.");
      }

      setQuantities(
        products.reduce((acc, product) => {
          acc[product.id] = 0;
          return acc;
        }, {})
      );
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd.");
    }
  };

  const cartItems = products.filter((product) => quantities[product.id] > 0);
  const totalItems = cartItems.reduce(
    (acc, product) => acc + quantities[product.id],
    0
  );

  return (
    <div className="App">
      <h1>Menu</h1>
      <table>
        <thead>
          <tr>
            <th>Zdjęcie</th>
            <th>Nazwa</th>
            <th>Ilość</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <img
                  src={require(`./assets/${product.category}/${product.img}`)}
                  alt={product.name}
                  className="product-image"
                />
              </td>
              <td>{product.name}</td>
              <td>
                <button onClick={() => decrement(product.id)}>-</button>
                <span>{quantities[product.id]}</span>
                <button onClick={() => increment(product.id)}>+</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalItems > 0 && (
        <button className="order-button" onClick={handleOrder}>
          ZAMÓW
        </button>
      )}
    </div>
  );
}

export default App;
