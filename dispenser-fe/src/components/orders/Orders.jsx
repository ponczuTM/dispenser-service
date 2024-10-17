import React, { useEffect, useState } from "react";
import { database, ref, onValue, remove } from "../../../firebase";
import styles from "./Orders.module.css";

const products = [
  { id: 1, category: "burgers", img: "bigmac.png", name: "BigMac" },
  { id: 2, category: "burgers", img: "hamburger.png", name: "Hamburger" },
  { id: 3, category: "burgers", img: "cheeseburger.png", name: "Cheeseburger" },
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
