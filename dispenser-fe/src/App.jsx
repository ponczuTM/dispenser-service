import React, { useState } from "react";
import "./App.css";
import { database, ref, set } from "../firebase";

const products = [
  { id: 1, category: "burgers", img: "bigmac.png", name: "BigMac" },
  { id: 2, category: "burgers", img: "hamburger.png", name: "Hamburger" },
  { id: 3, category: "burgers", img: "cheeseburger.png", name: "Cheeseburger" },
];

function App() {
  const [quantities, setQuantities] = useState(
    products.reduce((acc, product) => {
      acc[product.id] = 0;
      return acc;
    }, {})
  );

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

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
    setOrderNumber("Ładowanie...");

    const cartItems = products.filter((product) => quantities[product.id] > 0);
    const orderDetails = cartItems.map((product) => ({
      name: product.name,
      quantity: quantities[product.id],
    }));

    await fetch("http://localhost:8000/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        body: JSON.stringify(orderDetails),
      },
    });

    setQuantities(
      products.reduce((acc, product) => {
        acc[product.id] = 0;
        return acc;
      }, {})
    );

    setIsOrderDialogOpen(true);

    setTimeout(async () => {
      const response = await fetch("http://localhost:8000/ordernumber");
      const data = await response.json();
      setOrderNumber(data.ordernumber);

      const orderRef = ref(database, `kioskOrders/${data.ordernumber}`);
      await set(orderRef, {
        items: orderDetails,
      });
    }, 2500);
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
          <button className="close-button" onClick={toggleCart}>
            X
          </button>
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

      {isOrderDialogOpen && (
        <div className="order-dialog">
          <div
            className="order-dialog-overlay"
            onClick={() => setIsOrderDialogOpen(false)}
          />
          <div className="order-dialog-content">
            <h2>NUMER ZAMÓWIENIA:</h2>
            {orderNumber ? <h3>{orderNumber}</h3> : <h3>Ładowanie...</h3>}
            <button onClick={() => setIsOrderDialogOpen(false)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
