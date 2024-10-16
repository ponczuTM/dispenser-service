import React, { useState } from "react";
import "./App.css";

const products = [
  { id: 1, category: "burgers", img: "bigmac.png", name: "BigMac" },
  { id: 2, category: "burgers", img: "hamburger.png", name: "Hamburger" },
  { id: 3, category: "burgers", img: "cheeseburger.png", name: "Cheeseburger" },
  { id: 4, category: "burgers", img: "chikker.png", name: "Chikker" },
  { id: 5, category: "burgers", img: "jalapenoburger.png", name: "Jalapeno Burger" },
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
    alert("Zamówienie złożone!");

    await fetch('http://localhost:8000/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setQuantities(
      products.reduce((acc, product) => {
        acc[product.id] = 0;
        return acc;
      }, {})
    );
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

      {isCartOpen && (
        <div className="cart-dialog">
          <h2>Podsumowanie Koszyka</h2>
          {cartItems.length > 0 ? (
            <ul>
              {cartItems.map((product) => (
                <li key={product.id}>
                  {product.name} - {quantities[product.id]} szt.
                </li>
              ))}
            </ul>
          ) : (
            <p>Koszyk jest pusty.</p>
          )}
          <button onClick={toggleCart}>Zamknij</button>
        </div>
      )}

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