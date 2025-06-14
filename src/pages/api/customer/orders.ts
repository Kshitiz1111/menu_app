import { saveOrdersByRestaurant } from "@/lib/actions/customer/order.action";
import { getRestaurantId } from "@/lib/placeHolderData";
import { OrderType } from "@/types/orders";
import { throws } from "assert";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const restaurant_id = getRestaurantId();
  try {
    if (req.method === "POST") {
      const result = await saveOrdersByRestaurant(req.body, restaurant_id);
      if (!result.success) {
        res.json({ message: result });
        throw new Error("error on order handler: ", result.message);
      }
      res.json({ message: result });
    }
    if (req.method === "GET") {

    }
    if (req.method === "PUT") {

    }


  } catch (error: any) {
    console.log("error on order handler", error)
    res.status(500).json({ error: error });
  }
}