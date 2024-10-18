import React, { useEffect, useState } from "react";
import { database, ref, onValue, remove } from "../../../firebase";
import styles from "./Orders.module.css";

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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const ordersRef = ref(database, "kioskOrders");
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.entries(data).map(([orderId, value]) => ({
          orderId,
          items: value.items,
        }));
        setOrders(ordersArray);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCompleteOrder = (orderId) => {
    const orderRef = ref(database, `kioskOrders/${orderId}`);
    remove(orderRef)
      .then(() => {
        console.log(`Order ${orderId} completed and removed.`);
      })
      .catch((error) => {
        console.error("Error removing order: ", error);
      });
  };

  const handleConfirmCompleteOrder = () => {
    if (selectedOrder) {
      handleCompleteOrder(selectedOrder.orderId);
      setShowDialog(false);
      setSelectedOrder(null);
    }
  };

  const findProductImage = (itemName) => {
    const product = products.find((p) => p.name === itemName);
    if (product) {
      return `/src/assets/${product.category}/${product.img}`;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>ZAMÓWIENIA:</h1>

      {orders.map((order) => (
        <div key={order.orderId} className={styles.orderContainer}>
          <h2>Zamówienie #{order.orderId}</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th>Nazwa</th>
                  <th>Ilość</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <img
                        src={findProductImage(item.name)}
                        alt={item.name}
                        className={styles.image}
                      />
                    </td>
                    <td className={styles.itemInfo}>{item.name}</td>
                    <td className={styles.itemInfo}>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.actionsContainer}>
            <button
              onClick={() => {
                setSelectedOrder(order);
                setShowDialog(true);
              }}
              className={styles.completeButton}
            >
              Klient odebrał Zamówienie
            </button>
          </div>
        </div>
      ))}

      {showDialog && selectedOrder && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h3>Czy klient na pewno odebrał swoje zamówienie?</h3>
            <button onClick={() => setShowDialog(false)} className={styles.no}>
              Nie
            </button>
            <button onClick={handleConfirmCompleteOrder} className={styles.yes}>
              Tak
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
