import React, { useState } from "react";
import "./App.css";

const products = [
  { id: 1, category: "burgers", img: "bigmac.png", name: "BigMac" },
  { id: 2, category: "burgers", img: "hamburger.png", name: "Hamburger" },
  // ... inne produkty
];

function App() {
  const [quantities, setQuantities] = useState(
    products.reduce((acc, product) => {
      acc[product.id] = 0;
      return acc;
    }, {})
  );

  const [isCartOpen, setIsCartOpen] = useState(false);

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
    const cartItems = products.filter((product) => quantities[product.id] > 0);
    const totalItems = cartItems.reduce(
      (acc, product) => acc + quantities[product.id],
      0
    );

    if (totalItems > 0) {
      const orderNumber = Math.floor(100 + Math.random() * 900); // Losowy 3-cyfrowy numer zamówienia
      try {
        const response = await fetch("http://localhost:5000/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber }),
        });
        const data = await response.json();
        if (data.success) {
          alert(`Zamówienie przyjęte! Numer pagera: ${data.pagerNumber}`);
          // Resetujemy ilości po udanym zamówieniu
          setQuantities(
            products.reduce((acc, product) => {
              acc[product.id] = 0;
              return acc;
            }, {})
          );
        } else {
          alert("Błąd podczas składania zamówienia.");
        }
      } catch (error) {
        console.error("Błąd przy wysyłaniu zamówienia:", error);
        alert("Błąd przy wysyłaniu zamówienia.");
      }
    } else {
      alert("Koszyk jest pusty.");
    }
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
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
            <th></th>
            <th></th>
            <th>Ilość</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <img
                  src={`/src/assets/${product.category}/${product.img}`}
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
