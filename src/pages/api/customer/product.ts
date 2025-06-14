// import { createProductByRestaurant, deleteProduct, getAllProductByRestaurant, updateProduct } from "@/lib/actions/product.action";
import { getAllProductByRestaurant, updateProductByRestaurant, deleteProductByRestaurant, createProductByRestaurant } from "@/lib/actions/admin/product.action";
import { getRestaurantId } from "@/lib/placeHolderData";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { restaurant_id } = req.query as { restaurant_id: string };
  console.log("restaurant_id", restaurant_id)
  try {
    if (restaurant_id) {
      if (req.method === 'POST') {
        const result = await createProductByRestaurant(req.body, restaurant_id)
        res.json({ message: result });
      }
      if (req.method === 'GET') {
        const result = await getAllProductByRestaurant(restaurant_id)
        res.json({ message: result });
      }
      if (req.method === 'PUT') {
        const result = await updateProductByRestaurant(req.body, restaurant_id);
        res.json({ message: result });
      }
      if (req.method === 'DELETE') {
        // Access the product ID from the URL using req.query
        const productId = req.body.productId as string;
        console.log(productId);
        const result = await deleteProductByRestaurant(productId, restaurant_id);
        res.json({ message: result });
      }
    } else {
      throw new Error("authorization denied");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }

}