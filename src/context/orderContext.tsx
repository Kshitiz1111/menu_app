"use client"
import { getRestaurantId } from "@/lib/placeHolderData";
import { ProductFormSchema } from "@/lib/validator";
import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";
import { z } from "zod";

export type orderContextType = {
  orders: z.infer<typeof ProductFormSchema>[] | [];
  setOrders: Dispatch<SetStateAction<z.infer<typeof ProductFormSchema>[]>>;
}
const OrderContext = createContext<orderContextType | []>([]);;

// Function to load orders from localStorage
const loadOrdersFromLocalStorage = () => {
  const restaurant_id = getRestaurantId();
  // Check if the code is running in a browser environment
  if (typeof window !== 'undefined') {
    const ordersString = localStorage.getItem(`${restaurant_id}_orders`);

    return ordersString ? JSON.parse(ordersString).orders : [];
  }
  // Return an empty array if the code is not running in a browser environment
  return [];
};


export const OrderWrapper = ({ children }: { children: React.ReactNode }) => {
  let [orders, setOrders] = useState<z.infer<typeof ProductFormSchema>[] | []>(loadOrdersFromLocalStorage());
  return (
    <OrderContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrderContext = () => useContext(OrderContext);
