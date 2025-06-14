"use server";
// import pool from "@/lib/database/db";
import { db } from '@vercel/postgres';
import { z } from "zod";
import { ProductFormSchema } from "../../validator";
import { connectClientLocally } from '@/lib/database/localdb';
// import { PoolClient } from "pg";

export const createProductByRestaurant = async (
  productData: z.infer<typeof ProductFormSchema>,
  restaurant_id: string
) => {
  // let client = await db.connect();
  let client = await connectClientLocally();

  const {
    product_category,
    product_price,
    product_type,
    diet_type,
    product_img,
    product_name,
    product_des,
    base_ingredient,
    custom_ingredient,
    combo_drinks,
    combo_desserts,
  } = productData;

  let pCategoryId;
  let pTypeId;
  let pDietTypeId;
  let baseIngIds: Array<number> = [];
  let customIngIds: Array<number> = [];
  let comboDrinkId;
  let comboDessertId;

  try {
    pCategoryId = await createCategoryByRestaurant(
      { name: product_category, tableName: "product_category" },
      client,
      restaurant_id
    );
    pTypeId = await createCategoryByRestaurant(
      { name: product_type, tableName: "product_type" },
      client,
      restaurant_id
    );
    pDietTypeId = await createCategoryByRestaurant(
      { name: diet_type, tableName: "product_diet_type" },
      client,
      restaurant_id
    );
    if (base_ingredient) {
      let result = await createBaseIngredientByRestaurant(base_ingredient, client, restaurant_id);
      let { ids } = result
      if (ids) baseIngIds = ids;
    }
    if (custom_ingredient) {
      let result = await createCustomIngredientByRestaurant(custom_ingredient, client, restaurant_id);
      let { ids } = result
      if (ids) customIngIds = ids;
    }

    if (product_type && product_category !== "combo") {
      let result = await postProductByRestaurant(
        {
          name: product_name,
          img: product_img,
          description: product_des,
          price: product_price,
          pCategoryId: pCategoryId.id,
          pTypeId: pTypeId.id,
          pDietTypeId: pDietTypeId.id,
          baseIngIds: baseIngIds,
          customIngIds: customIngIds,
          comboDrinkId: comboDrinkId,
          comboDessertId: comboDessertId
        },
        client,
        restaurant_id
      );
      console.log("product result", result)
    }

    if (product_type && product_category === "combo") {

      if (combo_drinks && combo_drinks?.length > 0) {
        let result = await createComboDrinksByRestaurant(productData, client, restaurant_id);
        let { id } = result
        if (id) comboDrinkId = id;
        console.log("comboDrinkid", result)
      }
      if (combo_desserts && combo_desserts?.length > 0) {
        let result = await createComboDessertByRestaurant(productData, client, restaurant_id);
        let { id } = result
        if (id) comboDessertId = id;
        console.log("comboDessertid", result)
      }

      let result = await postProductByRestaurant(
        {
          name: product_name,
          img: product_img,
          description: product_des,
          price: product_price,
          pCategoryId: pCategoryId.id,
          pTypeId: pTypeId.id,
          pDietTypeId: pDietTypeId.id,
          baseIngIds: baseIngIds,
          customIngIds: customIngIds,
          comboDrinkId: comboDrinkId,
          comboDessertId: comboDessertId
        },
        client,
        restaurant_id
      );
      console.log("combo product result", result)
    }


    // console.log(pCategoryId, pTypeId, pDietTypeId, "baseIngIds: ",baseIngIds);
    return "success";
  } catch (error) {
    console.log("error");
  } finally {
    // client.release();
  }
};


type categoryType = {
  name: string;
  tableName: string;
};
const createCategoryByRestaurant = async (category: categoryType, client: any, restaurant_id: string) => {
  // Start a transaction
  await client.query("BEGIN");

  try {
    // Check if the table exists and create it if not
    await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '${restaurant_id}_${category.tableName}'
            ) THEN
                CREATE TABLE ${restaurant_id}_${category.tableName} (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    UNIQUE (name)
                );
            END IF;
        END $$;
      `);

    // Check if the name exists
    const exists = await client.query(
      `
        SELECT id FROM ${restaurant_id}_${category.tableName} 
        WHERE name = $1
      `,
      [category.name]
    );

    if (exists.rows.length > 0) {
      // If the name exists, return the existing id
      return {
        success: true,
        message: "Category already exists.",
        id: exists.rows[0].id,
      };
    } else {
      // If the name does not exist, insert it and return the new id
      const result = await client.query(
        `INSERT INTO ${restaurant_id}_${category.tableName} (name) VALUES ($1) RETURNING id;`,
        [category.name]
      );

      // Commit the transaction
      await client.query("COMMIT");
      return {
        success: true,
        message: "Category successfully created.",
        id: result.rows[0].id,
      };
    }
  } catch (error: any) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");
    return { success: false, message: error.message };
  }
};


type baseIngType = {
  ing_id?: number | string;
  ing_name: string;
  ing_qty: string | number;
  ing_unit: string;
  custom_marker?: boolean | string | undefined;
};
const createBaseIngredientByRestaurant = async (
  baseIng: baseIngType[],
  client: any,
  restaurant_id: string
) => {
  // Start a transaction
  await client.query("BEGIN");

  try {
    // Check if the table exists and create it if not
    await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '${restaurant_id}_base_ingredient'
            ) THEN
                CREATE TABLE ${restaurant_id}_base_ingredient (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    qty VARCHAR(255) NOT NULL,
                    unit VARCHAR(255) NOT NULL,
                    is_custom Boolean NOT NULL
                );
            END IF;
        END $$;
    `);

    // Prepare arrays to hold the query strings and values for insertions
    let insertQueries: string[] = [];
    let insertValues: any[] = [];

    // array for existing ids 
    let existIngArrIds: Array<number> = [];

    //remove last element because it is empty
    baseIng.pop();
    // console.log("baseIng",baseIng);

    // Iterate over each base ingredient
    for (const ingredient of baseIng) {
      // Check if the ingredient already exists
      const exists = await client.query(
        `SELECT id FROM ${restaurant_id}_base_ingredient WHERE name = $1 AND qty = $2 AND unit = $3`,
        [
          ingredient.ing_name,
          ingredient.ing_qty.toString(),
          ingredient.ing_unit,
        ]
      );

      //collect existed ingredient id into an array
      exists.rows.forEach((row: any) => {
        existIngArrIds.push(row.id)
      });

      // If the ingredient does not exist, prepare to insert it
      if (exists.rows.length === 0) {
        insertQueries.push(
          `($${insertValues.length + 1}, $${insertValues.length + 2}, $${insertValues.length + 3}, $${insertValues.length + 4})`
        );
        insertValues.push(
          ingredient.ing_name,
          ingredient.ing_qty,
          ingredient.ing_unit,
          ingredient?.custom_marker
        );
      }
    }

    // If there are ingredients to insert, execute the insert query
    if (insertQueries.length > 0) {
      let queryString = `INSERT INTO ${restaurant_id}_base_ingredient (name, qty, unit, is_custom) VALUES ${insertQueries.join(",")} RETURNING id;`;
      console.log('queryString', queryString);
      const result = await client.query(queryString, insertValues);

      // Assuming you want to return the IDs of the inserted ingredients
      await client.query("COMMIT");
      let insertedIngIds = result.rows.map((row: any) => row.id);
      return {
        success: true,
        message: "Base ingredients successfully created.",
        ids: [...insertedIngIds, ...existIngArrIds],
      };
    } else {
      // If no ingredients were inserted, return a message indicating this
      return {
        success: true,
        message: "All base ingredients already exist.",
        ids: existIngArrIds,
      };
    }

  } catch (error: any) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");
    console.log(error)
    return { success: false, message: "baseIng error: " + error.message };
  }
};


type customIngType = {
  ing_name: string;
  ing_qty: string | number;
  ing_unit: string;
  ing_price: string | number;
};
const createCustomIngredientByRestaurant = async (
  customIng: customIngType[],
  client: any,
  restaurant_id: string
) => {
  // Start a transaction
  await client.query("BEGIN");

  try {
    // Check if the table exists and create it if not
    await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '${restaurant_id}_custom_ingredient'
            ) THEN
                CREATE TABLE ${restaurant_id}_custom_ingredient (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    qty VARCHAR(255) NOT NULL,
                    unit VARCHAR(255) NOT NULL,
                    price VARCHAR(255) NOT NULL
                );
            END IF;
        END $$;
    `);

    // Prepare arrays to hold the query strings and values for insertions
    let insertQueries: string[] = [];
    let insertValues: any[] = [];

    // array for existing ids 
    let existIngArrIds: Array<number> = [];

    //remove last element because it is empty
    customIng.pop();

    // Iterate over each base ingredient
    for (const ingredient of customIng) {
      // Check if the ingredient already exists
      const exists = await client.query(
        `SELECT id FROM ${restaurant_id}_custom_ingredient WHERE name = $1 AND qty = $2 AND unit = $3 AND price = $4`,
        [
          ingredient.ing_name,
          ingredient.ing_qty.toString(),
          ingredient.ing_unit,
          ingredient.ing_price.toString(),
        ]
      );

      //collect existed ingredient id into an array
      exists.rows.forEach((row: any) => {
        existIngArrIds.push(row.id)
      });

      // If the ingredient does not exist, prepare to insert it
      if (exists.rows.length === 0) {
        insertQueries.push(
          `($${insertValues.length + 1}, $${insertValues.length + 2}, $${insertValues.length + 3}, $${insertValues.length + 4})`
        );
        insertValues.push(
          ingredient.ing_name,
          ingredient.ing_qty,
          ingredient.ing_unit,
          ingredient.ing_price
        );
      }
    }

    // If there are ingredients to insert, execute the insert query
    if (insertQueries.length > 0) {
      let queryString = `INSERT INTO ${restaurant_id}_custom_ingredient (name, qty, unit, price) VALUES ${insertQueries.join(",")} RETURNING id;`;
      // console.log('queryString',queryString);
      const result = await client.query(queryString, insertValues);

      // Assuming you want to return the IDs of the inserted ingredients
      await client.query("COMMIT");
      let insertedIngIds = result.rows.map((row: any) => row.id);

      return {
        success: true,
        message: "Custom ingredients successfully created.",
        ids: [...insertedIngIds, ...existIngArrIds],
      };
    } else {
      // If no ingredients were inserted, return a message indicating this
      return {
        success: true,
        message: "All custom ingredients already exist.",
        ids: existIngArrIds,
      };
    }

  } catch (error: any) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");
    console.log(error)
    return { success: false, message: "custom ingredient error: " + error.message };
  }
};


const createComboDessertByRestaurant = async (
  productData: z.infer<typeof ProductFormSchema>,
  client: any,
  restaurant_id: string
) => {

  const { product_name, product_des, combo_desserts } = productData;

  // Start a transaction
  await client.query("BEGIN");

  try {
    // Check if the table exists and create it if not
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = '${restaurant_id}_combo_desserts'
          ) THEN
              CREATE TABLE ${restaurant_id}_combo_desserts (
                  id SERIAL PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  description VARCHAR(255) NOT NULL,
                  price VARCHAR(255) NOT NULL
              );
          END IF;
      END $$;
    `);

    // Calculate the total price for the combo dessert
    let totalPrice = 0;
    combo_desserts?.forEach(dessert => {
      console.log("selected combo desserts: ", dessert)
      totalPrice += dessert.total_qty * Number(dessert.price);
    });

    const price = totalPrice.toString();

    // Construct the INSERT query
    const insertQuery = `
    INSERT INTO ${restaurant_id}_combo_desserts (name, description, price)
    VALUES ($1, $2, $3)
    RETURNING id;
    `;

    // Assuming client is an instance of PoolClient
    const ComboDessertResult = await client.query(insertQuery, [product_name, product_des, price])

    if (ComboDessertResult.rowCount! > 0) {
      await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '${restaurant_id}_combo_dessert_details'
            ) THEN
                CREATE TABLE ${restaurant_id}_combo_dessert_details (
                    id SERIAL PRIMARY KEY,
                    combo_dessert_id INTEGER,
                    dessert_id INTEGER,
                    quantity INTEGER NOT NULL,
                    FOREIGN KEY (combo_dessert_id) REFERENCES ${restaurant_id}_combo_desserts(id),
                    FOREIGN KEY (dessert_id) REFERENCES ${restaurant_id}_products(id)
                );
            END IF;
        END $$;
      `);

      const comboDessertId = ComboDessertResult.rows[0].id;

      // Iterate over the combo_dessert array
      if (combo_desserts) {
        for (const dessert of combo_desserts) {
          // Extract the dessert_id and quantity from each item in the combo_desserts array
          const dessertId = dessert.id;
          const quantity = dessert.total_qty;

          // Construct the INSERT query for the combo_dessert_details table
          const insertQueryDetails = `
            INSERT INTO ${restaurant_id}_combo_dessert_details (combo_dessert_id, dessert_id, quantity)
            VALUES ($1, $2, $3)
            RETURNING id;
          `;

          // Execute the INSERT query                                               
          const resultDetails = await client.query(insertQueryDetails, [comboDessertId, dessertId, quantity]);

          // Log the ID of the newly inserted row in the combo_dessert_details table
          console.log("Inserted combo dessert detail with ID:", resultDetails.rows[0].id);
        }
      }
    }

    // Return the ID of the newly inserted Combo dessert
    await client.query("COMMIT");
    return { success: true, message: "combo dessert successfully added.", id: ComboDessertResult.rows[0].id };
  } catch (error: any) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");
    console.log(error)
    return { success: false, message: "combo desserts error: " + error.message };
  }

}


const createComboDrinksByRestaurant = async (
  productData: z.infer<typeof ProductFormSchema>,
  client: any,
  restaurant_id: string
) => {

  const { product_name, product_des, combo_drinks } = productData;

  // Start a transaction
  await client.query("BEGIN");

  try {
    // Check if the table exists and create it if not
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = '${restaurant_id}_combo_drinks'
          ) THEN
              CREATE TABLE ${restaurant_id}_combo_drinks (
                  id SERIAL PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  description VARCHAR(255) NOT NULL,
                  price VARCHAR(255) NOT NULL
              );
          END IF;
      END $$;
    `);

    // Calculate the total price for the combo drink
    let totalPrice = 0;
    combo_drinks?.forEach(drink => {
      console.log("selected combo drinks: ", drink)
      totalPrice += drink.total_qty * Number(drink.price);
    });

    const price = totalPrice.toString();

    // Construct the INSERT query
    const insertQuery = `
    INSERT INTO ${restaurant_id}_combo_drinks (name, description, price)
    VALUES ($1, $2, $3)
    RETURNING id;
    `;

    // Assuming client is an instance of PoolClient
    const ComboDrinkResult = await client.query(insertQuery, [product_name, product_des, price])

    if (ComboDrinkResult.rowCount! > 0) {
      await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '${restaurant_id}_combo_drink_details'
            ) THEN
                CREATE TABLE ${restaurant_id}_combo_drink_details (
                    id SERIAL PRIMARY KEY,
                    combo_drink_id INTEGER,
                    drink_id INTEGER,
                    quantity INTEGER NOT NULL,
                    FOREIGN KEY (combo_drink_id) REFERENCES ${restaurant_id}_combo_drinks(id),
                    FOREIGN KEY (drink_id) REFERENCES ${restaurant_id}_products(id)
                );
            END IF;
        END $$;
      `);

      const comboDrinkId = ComboDrinkResult.rows[0].id;

      // Iterate over the combo_drinks array
      if (combo_drinks) {
        for (const drink of combo_drinks) {
          // Extract the drink_id and quantity from each item in the combo_drinks array
          const drinkId = drink.id;
          const quantity = drink.total_qty;

          // Construct the INSERT query for the combo_drink_details table
          const insertQueryDetails = `
            INSERT INTO ${restaurant_id}_combo_drink_details (combo_drink_id, drink_id, quantity)
            VALUES ($1, $2, $3)
            RETURNING id;
          `;

          // Execute the INSERT query                                               
          const resultDetails = await client.query(insertQueryDetails, [comboDrinkId, drinkId, quantity]);

          // Log the ID of the newly inserted row in the combo_drink_details table
          console.log("Inserted combo drink detail with ID:", resultDetails.rows[0].id);
        }
      }
    }

    // Return the ID of the newly inserted Combo drink
    await client.query("COMMIT");
    return { success: true, message: "combo drinks successfully added.", id: ComboDrinkResult.rows[0].id };
  } catch (error: any) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");
    console.log(error)
    return { success: false, message: "combo drinks error: " + error.message };
  }

}


const postProductByRestaurant = async (
  { name, img, description, price, pCategoryId, pTypeId, pDietTypeId, baseIngIds, customIngIds, comboDrinkId, comboDessertId }
    : {
      name: string,
      img: string | undefined,
      description: string,
      price: string | number,
      pCategoryId: number,
      pTypeId: number,
      pDietTypeId: number,
      baseIngIds: number[],
      customIngIds: number[],
      comboDrinkId?: number,
      comboDessertId?: number
    }
  ,
  client: any,
  restaurant_id: string
) => {
  // Start a transaction

  await client.query("BEGIN");
  try {
    // Check if the table exists and create it if not
    await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '${restaurant_id}_products'
            ) THEN
                CREATE TABLE ${restaurant_id}_products (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    img VARCHAR(255) NOT NULL,
                    description VARCHAR(255) NOT NULL,
                    price VARCHAR(255) NOT NULL,
                    category_id INTEGER NOT NULL,
                    type_id INTEGER NOT NULL,
                    dietType_id INTEGER NOT NULL,
                    baseIng_ids INTEGER[],
                    customIng_ids INTEGER[],
                    combo_drinks_id INTEGER,
                    combo_dessert_id INTEGER,
                    FOREIGN KEY (category_id) REFERENCES ${restaurant_id}_product_category(id),
                    FOREIGN KEY (type_id) REFERENCES ${restaurant_id}_product_type(id),
                    FOREIGN KEY (dietType_id) REFERENCES ${restaurant_id}_product_diet_type(id)
                );
            END IF;
        END $$;
      `);

    const insertQuery = `
        INSERT INTO ${restaurant_id}_products (name, img, description, price, category_id, type_id, dietType_id, baseIng_ids, customIng_ids, combo_drinks_id, combo_dessert_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id;
      `;
    const values: any = [name, img, description, price, pCategoryId, pTypeId, pDietTypeId, baseIngIds ?? null, customIngIds ?? null, comboDrinkId ?? null, comboDessertId ?? null];
    const result = await client.query(insertQuery, values);

    // Commit the transaction
    await client.query("COMMIT");

    // Return the ID of the newly inserted products
    return { success: true, message: "products successfully created.", id: result.rows[0].id };

  } catch (error: any) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");

    // Log the error and return an error message
    console.error("Error inserting product:", error);
    return { success: false, message: "Error inserting products: " + error.message };
  }

}



export const getSingleProductByRestaurant = async (product: any, restaurant_id: string) => {
  console.log("kasdf: ", product)
  try {

    let baseIngs;
    let customIngs;
    let comboDrinks;
    let comboDesserts;
    // Create an array of promises
    const promises = [];
    // Add promises to the array if the conditions are met
    if (product.baseing_ids && product.baseing_ids.length > 0) {
      promises.push(getBaseIngredientByIds(product.baseing_ids, restaurant_id).then(result => baseIngs = result.ingredients));
    }
    if (product.customing_ids && product.customing_ids.length > 0) {
      promises.push(getCustomIngredientByIds(product.customing_ids, restaurant_id).then(result => customIngs = result.ingredients));
    }
    if (product.combo_drinks_id) {
      promises.push(getComboDrinksById(product.combo_drinks_id, restaurant_id).then(result => comboDrinks = result.combo_drinks));
    }
    if (product.combo_dessert_id) {
      promises.push(getComboDessertsById(product.combo_dessert_id, restaurant_id).then(result => comboDesserts = result.combo_desserts));
    }

    // Wait for all promises to resolve
    await Promise.all(promises);
    // For example, logging the results:
    console.log("product", product);
    console.log("Base Ingredients:", baseIngs);
    console.log("Custom Ingredients:", customIngs);
    console.log("Combo Drinks:", comboDrinks);
    console.log("Combo Desserts:", comboDesserts);


    return {
      success: true,
      message: "Product successfully fetched.",
      product: {
        product_id: product.product_id,
        product_name: product.product_name,
        product_des: product.product_des,
        product_img: product.product_img,
        product_price: product.product_price,
        product_category: product.product_category,
        product_type: product.product_type,
        diet_type: product.diet_type,
        base_ingredient: baseIngs,
        custom_ingredient: customIngs,
        combo_drinks: comboDrinks,
        combo_desserts: comboDesserts,
      }, // Assuming each row represents a product
    };

  } catch (error: any) {
    // Log the error and return an error message
    console.error("Error fetching product:", error);
    return {
      success: false,
      message: "Error fetching product: " + error.message,
    };
  }
}

export const getAllProductByRestaurant = async (restaurant_id: string) => {
  // let client = await db.connect();
  let client = await connectClientLocally();

  // Start a transaction
  await client.query("BEGIN");

  try {
    // Execute the SELECT query to fetch all products
    const result = await client.query(
      `SELECT 
         p.*,
         pc.name AS product_category,
         pt.name AS product_type,
         pdt.name AS diet_type
       FROM 
         ${restaurant_id}_products p
       LEFT JOIN 
         ${restaurant_id}_product_category pc ON p.category_id = pc.id
       LEFT JOIN 
         ${restaurant_id}_product_type pt ON p.type_id = pt.id
       LEFT JOIN 
         ${restaurant_id}_product_diet_type pdt ON p.diettype_id = pdt.id`
    );
    console.log("allproducts", result.rows)
    let transformedResult = result.rows.map((row) => (
      {
        product_id: row.id,
        product_name: row.name,
        product_des: row.description,
        product_img: row.img,
        product_category: row.product_category,
        product_type: row.product_type,
        diet_type: row.diet_type,
        product_price: row.price,
        baseing_ids: row.baseing_ids,
        customing_ids: row.customing_ids,
        combo_drinks_id: row.combo_drinks_id,
        combo_dessert_id: row.combo_dessert_id,
      }
    ))
    // Commit the transaction
    await client.query("COMMIT");
    // client.release();
    // Return the fetched products
    return {
      success: true,
      message: "Products successfully fetched.",
      products: transformedResult, // Assuming each row represents a product
    };

  } catch (error: any) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");

    // Log the error and return an error message
    console.error("Error fetching products:", error);
    // client.release();
    return {
      success: false,
      message: "Error fetching products: " + error.message,
    };
  }
};


export const getAllDrinksByRestaurant = async (restaurant_id: string) => {
  // let client = await db.connect();
  let client = await connectClientLocally();

  try {
    // SQL query to fetch drinks along with their base ingredients aggregated into a JSON array
    const query = `
       SELECT p.*, json_agg(bi)::text AS base_ingredient, pc.name AS product_type
       FROM ${restaurant_id}_products p
       JOIN ${restaurant_id}_product_type pt ON p.type_id = pt.id
       JOIN ${restaurant_id}_product_category pc ON p.category_id = pc.id
       LEFT JOIN LATERAL unnest(p.baseIng_ids) AS bi_id ON TRUE
       LEFT JOIN ${restaurant_id}_base_ingredient bi ON bi.id = bi_id
       WHERE pt.name = 'drinks' AND p.combo_drinks_id IS NULL
       GROUP BY p.id, pc.name;
     `;

    // Execute the query
    const result = await client.query(query);

    // The result now includes a JSON array of base ingredients for each drink
    const drinks: any = result.rows.map((row, index) => {
      let baseIngParsed = JSON.parse(row.base_ingredient);
      // Map over baseIngParsed to construct the base_ingredient array
      const baseIngredients = baseIngParsed.map((ing: any) => ({
        ing_id: ing.id,
        ing_name: ing.name,
        ing_qty: ing.qty,
        ing_unit: ing.unit,
        custom_marker: ing.is_custom,
      }));
      console.log(baseIngParsed)
      return ({
        id: row.id,
        name: row.name,
        img_src: row.img,
        price: row.price,
        product_type: row.product_type,
        description: row.description,
        base_ingredient: baseIngParsed.length > 0 ? baseIngredients : undefined, // Parse the JSON string into an array of objects
        total_qty: 0,
      })
    });

    // client.release();
    // Return the fetched drinks with their base ingredients
    return {
      success: true,
      message: "Drinks with base ingredients successfully fetched.",
      drinks: drinks
    };
  } catch (error: any) {
    // Handle any errors
    console.error("Error fetching drinks with base ingredients:", error);
    // client.release();
    return {
      success: false,
      message: "Error fetching drinks with base ingredients: " + error.message,
    };
  }
}


export const getAllDessertsByRestaurant = async (restaurant_id: string) => {
  // let client = await db.connect();
  let client = await connectClientLocally();

  try {
    // SQL query to fetch drinks along with their base ingredients aggregated into a JSON array
    const query = `
       SELECT p.*, json_agg(bi)::text AS base_ingredient, pc.name AS product_type
       FROM ${restaurant_id}_products p
       JOIN ${restaurant_id}_product_type pt ON p.type_id = pt.id
       JOIN ${restaurant_id}_product_category pc ON p.category_id = pc.id
       LEFT JOIN LATERAL unnest(p.baseIng_ids) AS bi_id ON TRUE
       LEFT JOIN ${restaurant_id}_base_ingredient bi ON bi.id = bi_id
       WHERE pt.name = 'dessert' AND p.combo_dessert_id IS NULL
       GROUP BY p.id, pc.name;
     `;
    // Execute the query
    const result = await client.query(query);

    // The result now includes a JSON array of base ingredients for each drink
    const Desserts: any = result.rows.map((row, index) => {
      let baseIngParsed = JSON.parse(row.base_ingredient);
      // Map over baseIngParsed to construct the base_ingredient array
      const baseIngredients = baseIngParsed.map((ing: any) => ({
        ing_id: ing.id,
        ing_name: ing.name,
        ing_qty: ing.qty,
        ing_unit: ing.unit,
        custom_marker: ing.is_custom,
      }));
      console.log(baseIngParsed)
      return ({
        id: row.id,
        name: row.name,
        img_src: row.img,
        price: row.price,
        product_type: row.product_type,
        description: row.description,
        base_ingredient: baseIngParsed.length > 0 ? baseIngredients : undefined, // Parse the JSON string into an array of objects
        total_qty: 0,
      })
    });
    // console.log(Desserts);


    // Return the fetched Desserts with their base ingredients
    return {
      success: true,
      message: "Desserts with base ingredients successfully fetched.",
      desserts: Desserts
    };
  } catch (error: any) {
    // Handle any errors
    console.error("Error fetching desserts with base ingredients:", error);
    return {
      success: false,
      message: "Error fetching desserts with base ingredients: " + error.message,
    };
  }
}


const getBaseIngredientByIds = async (ids: Array<number>, restaurant_id: string) => {
  // if(ids.length>0){
  // let client = await db.connect();
  let client = await connectClientLocally();

  // Start a transaction
  await client.query("BEGIN");

  try {
    // Prepare the parameterized query
    const query = `
           SELECT * FROM ${restaurant_id}_base_ingredient
           WHERE id = ANY($1)
         `;

    // Execute the query with the provided IDs
    const result = await client.query(query, [ids]);

    // Commit the transaction
    await client.query("COMMIT");
    // client.release();
    // Return the fetched base ingredients
    const transformedIngredients = result.rows.map(ing => ({
      ing_id: ing.id,
      ing_name: ing.name,
      ing_qty: ing.qty,
      ing_unit: ing.unit,
      custom_marker: (ing.is_custom === "true") ? true : false,
    }));

    // Return the transformed base ingredients
    return {
      success: true,
      message: "Base ingredients successfully fetched.",
      ingredients: transformedIngredients,
    };

  } catch (error: any) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");
    // client.release();
    // Log the error and return an error message
    console.error("Error fetching base ingredients:", error);
    return {
      success: false,
      message: "Error fetching base ingredients: " + error.message,
    };
  }
  // }
  // return {
  //   success: false,
  //   message: "empty request data"
  // };
}
const getCustomIngredientByIds = async (ids: Array<number>, restaurant_id: string) => {
  // if(ids.length>0){
  // let client = await db.connect();
  let client = await connectClientLocally();

  // Start a transaction
  await client.query("BEGIN");

  try {
    // Prepare the parameterized query
    const query = `
           SELECT * FROM ${restaurant_id}_custom_ingredient
           WHERE id = ANY($1)
         `;

    // Execute the query with the provided IDs
    const result = await client.query(query, [ids]);

    // Commit the transaction
    await client.query("COMMIT");
    // client.release();
    // Return the fetched base ingredients
    // Transform the result to match the expected structure
    const transformedIngredients = result.rows.map(ing => ({
      ing_id: ing.id,
      ing_name: ing.name,
      ing_qty: ing.qty,
      ing_unit: ing.unit,
      ing_price: ing.price,
    }));

    // Return the transformed custom ingredients
    return {
      success: true,
      message: "Custom ingredients successfully fetched.",
      ingredients: transformedIngredients,
    };

  } catch (error: any) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");
    // client.release();
    // Log the error and return an error message
    console.error("Error fetching custom ingredients:", error);
    return {
      success: false,
      message: "Error fetching custom ingredients: " + error.message,
    };
  }
  // }
  // return {
  //   success: false,
  //   message: "empty request data"
  // };
}
const getComboDrinksById = async (id: number, restaurant_id: string) => {
  // if(id){
  // let client = await db.connect();
  let client = await connectClientLocally();

  const query = `
         SELECT 
             cd.*, 
             cdd.*, 
             p.*,
             pc.name AS category_name,
             pt.name AS type_name,
             pdt.name AS diet_type_name,
             (SELECT json_agg(bi) FROM ${restaurant_id}_base_ingredient bi WHERE bi.id = ANY(p.baseing_ids)) AS base_ingredient
         FROM 
             ${restaurant_id}_combo_drinks cd
         JOIN 
             ${restaurant_id}_combo_drink_details cdd ON cd.id = cdd.combo_drink_id
         JOIN 
             ${restaurant_id}_products p ON cdd.drink_id = p.id
         LEFT JOIN 
             ${restaurant_id}_product_category pc ON p.category_id = pc.id
         LEFT JOIN 
             ${restaurant_id}_product_type pt ON p.type_id = pt.id
         LEFT JOIN 
             ${restaurant_id}_product_diet_type pdt ON p.diettype_id = pdt.id
         WHERE 
             cd.id = $1
     `;

  try {
    const result = await client.query(query, [id]);
    // client.release();
    // Transform the result to match the Zod schema
    console.log("comdrinks", result.rows)
    const transformedResult = result.rows.map(row => ({
      id: row.id,
      combo_drinks_id: row.combo_drink_id,
      name: row.name,
      product_type: row.type_name, // Rename type_name to product_type
      img_src: row.img,
      description: row.description,
      base_ingredient: row.base_ingredient.map((ing: any) => ({
        ing_id: ing.id,
        ing_name: ing.name,
        ing_qty: typeof ing.qty === 'string' ? parseFloat(ing.qty) : ing.qty, // Ensure ing_qty is a number or string
        ing_unit: ing.unit,
        custom_marker: ing.is_custom === 'true', // Convert 'true'/'false' string to boolean
      })),
      total_qty: row.quantity,
      price: Number(row.price),
      // Adjust other fields as necessary to match the Zod schema
    }));

    return {
      success: true,
      message: "Combo drinks successfully fetched.",
      combo_drinks: transformedResult,
    };
  } catch (error: any) {
    // client.release();
    console.error('Error fetching combo drink details:', error);
    return {
      success: false,
      message: "Error fetching combo drinks: " + error.message,
    };
  }
  // }return {
  //   success: false,
  //   message: "empty request data"
  // };
}
const getComboDessertsById = async (id: number, restaurant_id: string) => {
  console.log("dessertid", id)
  // let client = await db.connect();
  let client = await connectClientLocally();

  const query = ` 
         SELECT 
           cd.*, 
           cdd.*, 
           p.*,
           pc.name AS category_name,
           pt.name AS type_name,
           pdt.name AS diet_type_name,
           (SELECT json_agg(bi) FROM ${restaurant_id}_base_ingredient bi WHERE bi.id = ANY(p.baseing_ids)) AS base_ingredient
         FROM 
           ${restaurant_id}_combo_desserts cd
         JOIN 
           ${restaurant_id}_combo_dessert_details cdd ON cd.id = cdd.combo_dessert_id
         JOIN 
           ${restaurant_id}_products p ON cdd.dessert_id = p.id
         LEFT JOIN 
           ${restaurant_id}_product_category pc ON p.category_id = pc.id
         LEFT JOIN 
           ${restaurant_id}_product_type pt ON p.type_id = pt.id
         LEFT JOIN 
           ${restaurant_id}_product_diet_type pdt ON p.diettype_id = pdt.id
         WHERE 
           cd.id = $1
       `;

  try {
    const result = await client.query(query, [id]);
    // client.release();

    // Transform the result to match the Zod schema
    console.log('asdfasd', result.rows)
    const transformedResult = result.rows.map(row => ({

      id: row.id,
      combo_dessert_id: id,
      name: row.name,
      product_type: row.type_name, // Rename type_name to product_type
      img_src: row.img,
      description: row.description,
      base_ingredient: row.base_ingredient.map((ing: any) => ({
        ing_id: ing.id,
        ing_name: ing.name,
        ing_qty: typeof ing.qty === 'string' ? parseFloat(ing.qty) : ing.qty, // Ensure ing_qty is a number or string
        ing_unit: ing.unit,
        custom_marker: ing.is_custom === 'true', // Convert 'true'/'false' string to boolean
      })),
      total_qty: row.quantity,
      price: Number(row.price),
      // Adjust other fields as necessary to match the Zod schema
    }));

    return {
      success: true,
      message: "Combo dessert successfully fetched.",
      combo_desserts: transformedResult,
    };
  } catch (error: any) {
    // client.release();
    console.error('Error fetching combo dessert details:', error);
    return {
      success: false,
      message: "Error fetching combo dessert: " + error.message,
    };
  }
}


//...........update............
const updateOrInsertBaseIngredientByRestaurant = async (productId: any, ingredients: any[], client: any, restaurant_id: string) => {
  try {
    // Start a transaction
    await client.query('BEGIN');

    // Array to collect new ingredient IDs
    const newIngredientIds = [];

    try {
      // Fetch all base ingredient IDs from the product table
      const productIngredientIdsResult = await client.query(
        `SELECT baseing_ids FROM ${restaurant_id}_products where id = ${productId}`
      );
      const productIngredientIds = productIngredientIdsResult.rows[0].baseing_ids;

      // Compare and remove unmatched ingredients
      const providedIngIds = ingredients.map(ingredient => ingredient.ing_id);
      const unmatchedIngIds = productIngredientIds.filter((id: any) => !providedIngIds.includes(id));

      // Remove unmatched ingredients from the base_ingredient table
      for (const id of unmatchedIngIds) {
        await client.query(
          `DELETE FROM ${restaurant_id}_base_ingredient WHERE id = $1`,
          [id]
        );
      }

      //removing any empty ingredients base on empty name
      let finalIngredients = ingredients.filter((ing) => ing.ing_name !== "");
      // Update or insert ingredients
      for (const ingredient of finalIngredients) {
        const { ing_id, ing_name, ing_qty, ing_unit, custom_marker } = ingredient;

        // Check if the ingredient exists
        const exists = await client.query(
          `SELECT id FROM ${restaurant_id}_base_ingredient WHERE id = $1`,
          [ing_id]
        );

        if (exists.rows.length > 0) {
          // If the ingredient exists, update it
          await client.query(
            `UPDATE ${restaurant_id}_base_ingredient SET name = $1, qty = $2, unit = $3, is_custom = $4 WHERE id = $5`,
            [ing_name, ing_qty, ing_unit, custom_marker, ing_id]
          );
        } else {
          // If the ingredient does not exist, insert it
          const insertResult = await client.query(
            `INSERT INTO ${restaurant_id}_base_ingredient (name, qty, unit, is_custom) VALUES ($1, $2, $3, $4) RETURNING id`,
            [ing_name, ing_qty, ing_unit, custom_marker]
          );
          // Push the new ingredient ID into the array
          newIngredientIds.push(insertResult.rows[0].id);
        }
      }
      // Fetch the updated list of ingredient IDs for the product
      const updatedIngredientIdsResult = await client.query(
        `SELECT ${restaurant_id}_baseing_ids FROM products WHERE id = $1`,
        [productId]
      );
      // Commit the transaction
      await client.query('COMMIT');

      const updatedIngredientIds: any = updatedIngredientIdsResult.rows[0].baseing_ids
      // console.log("baseingids",...updatedIngredientIds,...newIngredientIds)
      // Return the updated list of ingredient IDs
      return { ids: [...updatedIngredientIds, ...newIngredientIds] };
    } catch (error) {
      // Rollback the transaction in case of any error
      await client.query('ROLLBACK');
      throw error; // Rethrow the error to be handled by the caller
    }
  } catch (error) {
    console.error('Error updating or inserting base ingredients:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const updateOrInsertCustomIngredientByRestaurant = async (productId: any, ingredients: any[], client: any, restaurant_id: string) => {
  try {
    // Start a transaction
    await client.query('BEGIN');

    // Array to collect new ingredient IDs
    const newIngredientIds = [];

    try {
      // Fetch all custom ingredient IDs from the product table
      const productIngredientIdsResult = await client.query(
        `SELECT customing_ids FROM ${restaurant_id}_products WHERE id = ${productId}`
      );

      const productIngredientIds = productIngredientIdsResult.rows[0].customing_ids;

      // Compare and remove unmatched ingredients
      const providedIngIds = ingredients.map(ingredient => ingredient.ing_id);
      const unmatchedIngIds = productIngredientIds.filter((id: any) => !providedIngIds.includes(id));

      // Remove unmatched ingredients from the custom_ingredient table
      for (const id of unmatchedIngIds) {
        await client.query(
          `DELETE FROM ${restaurant_id}_custom_ingredient WHERE id = $1`,
          [id]
        );
      }

      //removing any empty ingredients base on empty name
      let finalIngredients = ingredients.filter((ing) => ing.ing_name !== "");
      // Update or insert ingredients
      for (const ingredient of finalIngredients) {
        const { ing_id, ing_name, ing_qty, ing_unit, ing_price } = ingredient;

        // Check if the ingredient exists
        const exists = await client.query(
          `SELECT id FROM ${restaurant_id}_custom_ingredient WHERE id = $1`,
          [ing_id]
        );

        if (exists.rows.length > 0) {
          // If the ingredient exists, update it
          //  console.log("ingid",ing_id)
          await client.query(
            `UPDATE ${restaurant_id}_custom_ingredient SET name = $1, qty = $2, unit = $3, price = $4 WHERE id = $5`,
            [ing_name, ing_qty, ing_unit, ing_price, ing_id]
          );
        } else {
          // If the ingredient does not exist, insert it

          const insertResult = await client.query(
            `INSERT INTO ${restaurant_id}_custom_ingredient (name, qty, unit, price) VALUES ($1, $2, $3, $4) Returning id`,
            [ing_name, ing_qty, ing_unit, ing_price]
          );

          // Push the new ingredient ID into the array
          newIngredientIds.push(insertResult.rows[0].id);
        }
      }

      // Commit the transaction
      await client.query('COMMIT');

      // Fetch the updated list of ingredient IDs for the product
      const updatedIngredientIdsResult = await client.query(
        `SELECT customing_ids FROM ${restaurant_id}_products WHERE id = $1`,
        [productId]
      );

      const updatedIngredientIds: Array<number> = updatedIngredientIdsResult.rows[0].customing_ids;
      // console.log(updatedIngredientIdsResult.rows[0],...newIngredientIds)
      // Return the updated list of ingredient IDs
      return { ids: [...updatedIngredientIds, ...newIngredientIds] };
    } catch (error) {
      // Rollback the transaction in case of any error
      await client.query('ROLLBACK');
      throw error; // Rethrow the error to be handled by the caller
    }
  } catch (error) {
    console.error('Error updating or inserting custom ingredients:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};


const updateOrInsertComboDrinksByRestaurant = async (comboDrinks: any[], comboDrinksId: number, client: any, restaurant_id: string) => {
  try {
    // Start a transaction
    await client.query('BEGIN');

    try {
      // Fetch all drink IDs from the combo_drink_details table for the specified combo drink
      const comboDrinkDetailsResult = await client.query(
        `SELECT drink_id FROM ${restaurant_id}_combo_drink_details WHERE combo_drink_id = $1`,
        [comboDrinksId]
      );
      const comboDrinkDetailsIds = comboDrinkDetailsResult.rows.map((row: any) => row.drink_id);

      // Compare and remove unmatched drinks
      const providedDrinkIds = comboDrinks.map(comboDrink => comboDrink.id);
      const unmatchedDrinkIds = comboDrinkDetailsIds.filter((id: any) => !providedDrinkIds.includes(id));

      // Remove unmatched drinks from the combo_drink_details table
      for (const id of unmatchedDrinkIds) {
        await client.query(
          `DELETE FROM ${restaurant_id}_combo_drink_details WHERE combo_drink_id = $1 AND drink_id = $2`,
          [comboDrinksId, id]
        );
      }

      // Calculate the total price for the combo dessert
      let totalPrice = 0;
      comboDrinks?.forEach(drink => {
        totalPrice += drink.total_qty * Number(drink.price);
      });

      // Update or insert combo drinks
      for (const comboDrink of comboDrinks) {
        const { id } = comboDrink;

        // Check if the combo drink exists
        const exists = await client.query(
          `SELECT id FROM ${restaurant_id}_combo_drink_details WHERE combo_drink_id = $1 AND drink_id = $2`,
          [comboDrinksId, id]
        );

        if (exists.rows.length > 0) {
          // If the combo drink exists, update it
          await client.query(
            `UPDATE ${restaurant_id}_combo_drink_details SET quantity = $1, WHERE combo_drink_id = $2 AND drink_id = $3`,
            [comboDrink.total_qty, comboDrinksId, id]
          );
        } else {
          // If the combo drink does not exist, insert it
          await client.query(
            `INSERT INTO ${restaurant_id}_combo_drink_details (combo_drink_id, drink_id, quantity) VALUES ($1, $2, $3, $4)`,
            [comboDrinksId, id, comboDrink.total_qty]
          );
        }
        // Update the price in the combo_drinks table

      }
      await client.query(
        `UPDATE ${restaurant_id}_combo_drinks SET price = $1 WHERE id = $2`,
        [totalPrice, comboDrinksId]
      );

      // Commit the transaction
      await client.query('COMMIT');
    } catch (error) {
      // Rollback the transaction in case of any error
      await client.query('ROLLBACK');
      throw error; // Rethrow the error to be handled by the caller
    }
  } catch (error) {
    console.error('Error updating or inserting combo drinks:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const updateOrInsertComboDessertsByRestaurant = async (comboDesserts: any[], comboDessertsId: number, client: any, restaurant_id: string) => {
  try {
    // Start a transaction
    await client.query('BEGIN');

    try {
      // Fetch all dessert IDs from the combo_dessert_details table for the specified combo dessert
      const comboDessertDetailsResult = await client.query(
        `SELECT dessert_id FROM ${restaurant_id}_combo_dessert_details WHERE combo_dessert_id = $1`,
        [comboDessertsId]
      );
      const comboDessertDetailsIds = comboDessertDetailsResult.rows.map((row: any) => row.dessert_id);

      // Compare and remove unmatched desserts
      const providedDessertIds = comboDesserts.map(comboDessert => comboDessert.id);
      const unmatchedDessertIds = comboDessertDetailsIds.filter((id: any) => !providedDessertIds.includes(id));

      // Remove unmatched desserts from the combo_dessert_details table
      for (const id of unmatchedDessertIds) {
        await client.query(
          `DELETE FROM ${restaurant_id}_combo_dessert_details WHERE combo_dessert_id = $1 AND dessert_id = $2`,
          [comboDessertsId, id]
        );
      }

      // Calculate the total price for the combo dessert
      let totalPrice = 0;
      comboDesserts?.forEach(dessert => {
        totalPrice += dessert.total_qty * Number(dessert.price);
      });

      // Update or insert combo desserts
      for (const comboDessert of comboDesserts) {
        const { id, name, price } = comboDessert;

        // Check if the combo dessert exists
        const exists = await client.query(
          `SELECT id FROM ${restaurant_id}_combo_dessert_details WHERE combo_dessert_id = $1 AND dessert_id = $2`,
          [comboDessertsId, id]
        );

        if (exists.rows.length > 0) {
          // If the combo dessert exists, update it
          await client.query(
            `UPDATE ${restaurant_id}_combo_dessert_details SET quantity = $1 WHERE combo_dessert_id = $2 AND dessert_id = $3`,
            [comboDessert.total_qty, comboDessertsId, id]
          );
        } else {
          // If the combo dessert does not exist, insert it
          await client.query(
            `INSERT INTO ${restaurant_id}_combo_dessert_details (combo_dessert_id, dessert_id, price) VALUES ($1, $2, $3)`,
            [comboDessertsId, id, totalPrice]
          );
        }
      }
      await client.query(
        `UPDATE ${restaurant_id}_combo_desserts SET price = $1 WHERE id = $2`,
        [totalPrice, comboDessertsId]
      );

      // Commit the transaction
      await client.query('COMMIT');
    } catch (error) {
      // Rollback the transaction in case of any error
      await client.query('ROLLBACK');
      throw error; // Rethrow the error to be handled by the caller
    }
  } catch (error) {
    console.error('Error updating or inserting combo desserts:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};


export const updateProductByRestaurant = async (product: any, restaurant_id: string) => {
  // let client = await db.connect();

  let client = await connectClientLocally();


  try {
    let { product_name, product_img, product_des, product_price, base_ingredient, custom_ingredient, combo_drinks, combo_desserts, product_id } = product;
    // console.log("for update",product,product_id);
    let baseIngIds: Array<number> = [];
    let customIngIds: Array<number> = [];
    let comboDrinkId: string = '';
    let comboDessertId: string = '';// Start a transaction
    //    await client.query('BEGIN');

    // Create an array of promises
    const promises = [];
    // Add promises to the array if the conditions are met
    if (product.base_ingredient && product.base_ingredient.length > 0) {
      promises.push(updateOrInsertBaseIngredientByRestaurant(product_id, base_ingredient, client, restaurant_id).then(result => baseIngIds = result.ids));
    }
    if (product.custom_ingredient && product.custom_ingredient.length > 0) {
      promises.push(updateOrInsertCustomIngredientByRestaurant(product_id, custom_ingredient, client, restaurant_id).then(result => customIngIds = result.ids));
    }
    if (product.combo_drinks && product.combo_drinks.length > 0) {
      promises.push(updateOrInsertComboDrinksByRestaurant(combo_drinks, combo_drinks[0]?.combo_drinks_id, client, restaurant_id));
    }
    if (product.combo_desserts && product.combo_desserts.length > 0) {
      promises.push(updateOrInsertComboDessertsByRestaurant(combo_desserts, combo_desserts[0]?.combo_dessert_id, client, restaurant_id));
    }

    // Wait for all promises to resolve
    await Promise.all(promises);

    try {
      // Update the product with the new details
      (combo_desserts && combo_desserts.length > 0) ? comboDessertId = combo_desserts[0].combo_dessert_id : null;
      (combo_drinks && combo_drinks.length > 0) ? comboDrinkId = combo_drinks[0].combo_drinks_id : null;
      await client.query(
        `UPDATE ${restaurant_id}_products SET name = $1, img = $2, description = $3, price = $4, baseing_ids = $5, customing_ids = $6, combo_drinks_id = $7, combo_dessert_id = $8 WHERE id = $9`,
        [product_name, product_img, product_des, Number(product_price), baseIngIds ?? null, customIngIds ?? null, Number(comboDrinkId) ?? null, Number(comboDessertId) ?? null, product_id]
      );

      // Commit the transaction
      await client.query('COMMIT');
      // client.release();
      return { success: true }
    } catch (error) {
      // Rollback the transaction in case of any error

      await client.query('ROLLBACK');
      // client.release();
      throw error; // Rethrow the error to be handled by the caller

    }
  } catch (error) {
    // client.release();
    console.error('Error updating product:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};


export const deleteProductByRestaurant = async (productId: string, restaurant_id: string) => {
  // let client = await db.connect();
  let client = await connectClientLocally();

  await client.query('BEGIN');
  try {
    const baseIngredientIdsResult = await client.query(
      `SELECT ${restaurant_id}_baseing_ids FROM products WHERE id = $1`,
      [Number(productId)]
    );
    const customIngredientIdsResult = await client.query(
      `SELECT ${restaurant_id}_customing_ids FROM products WHERE id = $1`,
      [Number(productId)]
    );
    const comboDrinkIdsResult = await client.query(
      `SELECT ${restaurant_id}_combo_drinks_id FROM products WHERE id = $1`,
      [Number(productId)]
    );
    const comboDessertIdsResult = await client.query(
      `SELECT ${restaurant_id}_combo_dessert_id FROM products WHERE id = $1`,
      [Number(productId)]
    );

    const promises = [];

    if (baseIngredientIdsResult.rows[0].baseing_ids.length > 0) {
      promises.push(
        await client.query(
          `DELETE FROM ${restaurant_id}_base_ingredient WHERE id = ANY($1)`,
          [baseIngredientIdsResult.rows[0].baseing_ids]
        )
      )
    }

    if (customIngredientIdsResult.rows[0].customing_ids.length > 0) {
      promises.push(
        await client.query(
          `DELETE FROM ${restaurant_id}_custom_ingredient WHERE id = ANY($1)`,
          [customIngredientIdsResult.rows[0].customing_ids]
        )
      )
    }

    if (comboDrinkIdsResult.rows[0].combo_drinks_id !== 0 && comboDrinkIdsResult.rows[0].combo_drinks_id !== null) {
      promises.push(
        await client.query(
          `DELETE FROM ${restaurant_id}_combo_drink_details WHERE combo_drink_id = $1`,
          [comboDrinkIdsResult.rows[0].combo_drinks_id]
        )
      )
      promises.push(
        await client.query(
          `DELETE FROM ${restaurant_id}_combo_drinks WHERE id = $1`,
          [comboDrinkIdsResult.rows[0].combo_drinks_id]
        )
      )
    }

    if (comboDessertIdsResult.rows[0].combo_dessert_id !== 0 && comboDessertIdsResult.rows[0].combo_dessert_id !== null) {
      promises.push(
        await client.query(
          `DELETE FROM ${restaurant_id}_combo_dessert_details WHERE combo_drink_id = $1`,
          [comboDessertIdsResult.rows[0].combo_dessert_id]
        )
      )
      promises.push(
        await client.query(
          `DELETE FROM ${restaurant_id}_combo_desserts WHERE id = $1`,
          [comboDessertIdsResult.rows[0].combo_dessert_id]
        )
      )
    }

    // Wait for all promises to resolve
    await Promise.all(promises);

    // Delete the product
    await client.query(`DELETE FROM ${restaurant_id}_products WHERE id = $1`, [Number(productId)]);

    await client.query('COMMIT');
    // client.release();
    console.log(`Product with ID ${productId} has been deleted.`);
    return { success: true, message: `Product with ID ${productId} has been deleted.` }
  } catch (error) {
    await client.query('ROLLBACK');
    // client.release();
    console.error('Error deleting product:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
}