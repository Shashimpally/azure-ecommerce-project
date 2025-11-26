// frontend/web-client/src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products", err));
  }, []);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const placeOrder = () => {
    axios
      .post("http://localhost:4000/api/orders", { items: cart })
      .then(() => {
        alert("Order placed!");
        setCart([]);
      })
      .catch((err) => console.error("Error placing order", err));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Cloud Shop</h1>
      <h2>Products</h2>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px", width: "200px" }}>
            <h3>{p.name}</h3>
            <p>₹{p.price}</p>
            <button onClick={() => addToCart(p)}>Add to cart</button>
          </div>
        ))}
      </div>

      <h2>Cart ({cart.length})</h2>
      {cart.map((c, idx) => (
        <div key={idx}>
          {c.name} - ₹{c.price}
        </div>
      ))}

      {cart.length > 0 && (
        <button style={{ marginTop: "20px" }} onClick={placeOrder}>
          Place Order
        </button>
      )}
    </div>
  );
}

export default App;
