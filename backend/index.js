// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(express.json());

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DB,
  options: {
    encrypt: process.env.SQL_ENCRYPT === "true",
  },
};

app.get("/api/products", async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT Id as id, Name as name, Price as price FROM Products");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching products", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/orders", async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const orderRequest = new sql.Request(transaction);
    const orderResult = await orderRequest.query(
      "INSERT INTO Orders DEFAULT VALUES; SELECT SCOPE_IDENTITY() AS OrderId;"
    );
    const orderId = orderResult.recordset[0].OrderId;

    for (const item of items) {
      const itemReq = new sql.Request(transaction);
      await itemReq
        .input("OrderId", sql.Int, orderId)
        .input("ProductId", sql.Int, item.id)
        .input("Quantity", sql.Int, 1)
        .query(
          "INSERT INTO OrderItems (OrderId, ProductId, Quantity) VALUES (@OrderId, @ProductId, @Quantity);"
        );
    }

    await transaction.commit();
    res.json({ success: true, orderId });
  } catch (err) {
    console.error("Error creating order", err);
    await transaction.rollback();
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`API running on port ${process.env.PORT || 4000}`);
});
