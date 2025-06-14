// import pool from "@/lib/database/db";
import { db } from '@vercel/postgres';
import { OrderType } from "@/types/orders";
import { connectClientLocally } from '../database/localdb';
// import { PoolClient } from "pg";

export const saveOrders = async (order: any) => {
  //  let client = await db.connect();
  let client = await connectClientLocally();

  console.log("order from saveorders action", order);
  try {

    await client.query("BEGIN");
    // Check and create 'orders' table if not exists
    await client.query(`
         DO $$
         BEGIN
            IF NOT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'orders'
            ) THEN
            CREATE TABLE orders (
               order_id SERIAL PRIMARY KEY,
               time_stamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
               purchase_order_id VARCHAR(255) NOT NULL,
               no_of_item INTEGER NOT NULL,
               total_price NUMERIC(10, 2) NOT NULL,
               compensation NUMERIC(10, 2),
               status VARCHAR(50) NOT NULL
            );
            END IF;
         END $$;
      `);
    await client.query("COMMIT");

    //check if particular order already exist to avoide redundand data
    await client.query("BEGIN")
    const checkOrderExists = await client.query(
      `SELECT 1 FROM orders WHERE purchase_order_id = $1 LIMIT 1;`,
      [order.purchase_order_id]
    );
    if (checkOrderExists.rows.length > 0) {
      console.error("Order with this purchase_order_id already exists.");
      // client.release();
      return { success: false, message: "Order with this purchase_order_id already exists." };
    }

    // Insert order into 'orders' table
    const result: any = await client.query(
      `INSERT INTO orders (purchase_order_id, no_of_item, total_price, compensation, status) 
         VALUES ($1, $2, $3, $4, $5) RETURNING order_id;`,
      [order.purchase_order_id, order.no_of_item, order.total_price, order.compensation ?? null, order.status]
    );
    await client.query("COMMIT")


    // Check and create 'order_details' table if not exists
    await client.query("BEGIN");
    await client.query(`
         DO $$
         BEGIN
            IF NOT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'order_details'
            ) THEN
            CREATE TABLE order_details (
               detail_id SERIAL PRIMARY KEY,
               dish_id INTEGER NOT NULL,
               quantity INTEGER NOT NULL,
               price INTEGER NOT NULL,
               customized_ingredients JSONB,
               customer_note TEXT,
               order_id INTEGER REFERENCES orders(order_id)
            );
            END IF;
         END $$;
      `);

    // Insert order details into 'order_details' table
    console.log("Inserting order details into 'order_details' table...");
    for (const detail of order.details) {
      await client.query(
        `INSERT INTO order_details (dish_id, quantity, price, customized_ingredients, customer_note, order_id) 
            VALUES ($1, $2, $3, $4, $5, $6);`,
        [detail.product_id, detail.total_quantity, detail.total_price, JSON.stringify(detail.customized_ingredients) ?? null, detail.customer_note ?? null, result.rows[0].order_id]
      );
    }

    await client.query("COMMIT");
    console.log("Order and details successfully inserted.");
    // client.release();
    return { success: true, message: "Order and details successfully inserted." };
  } catch (error: any) {
    console.error("Error occurred:", error);
    if (client) {
      await client.query("ROLLBACK");
      // client.release();
    }
    return { success: false, message: error.message };
  }

}
export const updateOrderById = async (id: string) => {

}
export const getAllOrders = async () => {

}
export const getOrdersById = async (id: string) => {

}