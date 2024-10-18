import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import { database, ref, set } from "../firebase";
import Orders from "./components/orders/Orders";

const products = [
  { id: 1, category: "burgers", img: "bigmac.png", name: "BigMac" },
  { id: 2, category:   "burgers", img: "hamburger.png", name: "Hamburger" },
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
  { id: 15, category: "burgers", img: "wiesmac.png", name: "Wieśmacx" },
  { id: 16, category: "mccafe", img: "cafe-latte.png", name: "Cafe Latte" },
  { id: 17, category: "mccafe", img: "cappuccino.png", name: "Cappuccino" },
  { id: 18, category: "mccafe", img: "caramel-latte-macchiato.png", name: (<>Choco Latte<br/>Macchiato</>),},
  { id: 19, category: "mccafe", img: "choco-latte-macchiato.png", name: (<>Choco Latte<br/>Macchiato</>),},
  { id: 20, category: "mccafe", img: "coffee-black.png", name: "Kawa Czarna" },
  { id: 21, category: "mccafe", img: "coffee-milk.png", name: "Kawa z Mlekiem" },
  { id: 22, category: "mccafe", img: "espresso.png", name: "Espresso" },
  { id: 23, category: "mccafe", img: "flat-white.png", name: "Flat White" },
  { id: 24, category: "mccafe", img: "iced-caramel-latte.png", name: (<>Iced Latte<br/>Latte</>) },
  { id: 25, category: "mccafe", img: "iced-latte.png", name: "Iced Latte" },
  { id: 26, category: "mccafe", img: "iced-raspberry-latte.png", name: (<>Iced Raspberry<br/>Latte</>) },
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
      },
      body: JSON.stringify(orderDetails),
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
          <Route
            path="/"
            element={
              <>
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
                    <button onClick={toggleCart}>X</button>
                  </div>
                )}

                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Produkt</th>
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
                          <button onClick={() => decrement(product.id)}>
                            -
                          </button>
                          <span>{quantities[product.id]}</span>
                          <button onClick={() => increment(product.id)}>
                            +
                          </button>
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
                      {orderNumber ? (
                        <h3>{orderNumber}</h3>
                      ) : (
                        <h3>Ładowanie...</h3>
                      )}
                      <button onClick={() => setIsOrderDialogOpen(false)}>
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </>
            }
          />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
