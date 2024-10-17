import React, { useState } from "react";
import "./App.css";
import { database, ref, set } from "../firebase";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Orders from "./components/orders/Orders";

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
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <>
              <h1>Menu</h1>
              {/* Dodaj tu kod menu, jeśli jest to potrzebne */}
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
            </>
          } />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;