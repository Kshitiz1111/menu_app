"use client"

import { ProductFormSchema } from "@/lib/validator";
import Image from "next/image";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "../ui/separator";
import { useOrderContext } from "@/context/orderContext";
import type { orderContextType } from "@/context/orderContext"
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { getRestaurantId } from "@/lib/placeHolderData";

let orders: any;
const CartItem = ({ restaurantId }: { restaurantId: string }) => {
  const restaurant_id = restaurantId;

  const context: any = useOrderContext()
  useEffect(() => {
    if (!context) return;

    const { orders, setOrders } = context as any;
    // Check if a guest ID already exists
    let guestId = localStorage.getItem('guestId');

    const ordersWithUserId: any = {
      orders: [...orders],
      userId: guestId, // Use the guest ID for guests
    };

    const ordersString = JSON.stringify(ordersWithUserId);
    localStorage.setItem(`${restaurant_id}_orders`, ordersString);
    // console.log("totalOrder after edit from cart", ordersWithUserId,);
    console.log("hello")
  }, [orders]);

  if (!context) {
    // Return null or some fallback UI
    return null;
  }

  orders = context.orders as any;
  console.log("orders", orders)
  const { setOrders } = context as any;
  // setOrders(selectedProducts)

  const updateQuantity = (id: any, quantity: any) => {
    setOrders(orders.map((item: any) => item.product_id == id ? { ...item, total_quantity: quantity, total_price: (Number(item.product_price) * Number(quantity)).toFixed(2) } : item));
  };

  const removeItem = (id: any) => {
    setOrders(orders.filter((item: any) => item.product_id !== id));
  };
  // console.log("orders cart", orders)
  return (
    <div className=" overflow-y-scroll h-screen">
      {orders &&
        orders.map((item: z.infer<typeof ProductFormSchema>, index: number) => {

          return (
            <div key={index}>
              {(!item.purchase_confirm) ?
                <div className="relative p-4 bg-white shadow-md rounded-lg mb-4">
                  <Image
                    src={'/icons/delete.svg'}
                    width={20}
                    height={20}
                    alt="del"
                    onClick={() => removeItem(item.product_id)}
                    className="absolute top-0 left-0 shadow-sm rounded-md cursor-pointer hover:shadow-md hover:bg-red-100"
                  />
                  <div className="cart-item flex flex-wrap items-center justify-between">
                    <div className="">
                      <h4 className="text-lg font-semibold text-gray-800">{item.product_name}</h4>
                      <p className="absolute top-0 right-0 py-0 px-2 text-gray-500 text-sm text-gray-500">${Number(item.total_price)}</p>
                    </div>
                    <div className="flex items-center w-full gap-1">
                      <button
                        onClick={() => updateQuantity(item.product_id, Number(item.total_quantity) - 1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-3 rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="bg-gray-200 text-gray-800 font-bold text-center py-2 px-3 w-full">{item.total_quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, Number(item.total_quantity) + 1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-3 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <Accordion type="single" collapsible className="">
                    <AccordionItem value="item-1" className="border-0">
                      <AccordionTrigger className='pt-2 pb-0 text-xs'>ingredients and note</AccordionTrigger>
                      <AccordionContent className="p-0">
                        <div className="text-xs">
                          {
                            (item.base_ingredient && item.base_ingredient.length > 0) ?
                              <div className="py-1">
                                <span className="font-semibold">base ingredients</span>
                                <div className="flex flex-wrap px-1">
                                  {
                                    item.base_ingredient.map((ing, index: number) => (
                                      <span key={index} className="mr-1">{ing.ing_name},</span>
                                    ))
                                  }

                                </div>
                              </div>
                              : ""
                          }

                          {
                            (item.custom_ingredient && item.custom_ingredient.length > 0) ?
                              <div className="pb-1">
                                <span className="font-semibold">custom ingredients</span>
                                <div className="flex flex-wrap px-1">
                                  {
                                    item.custom_ingredient.map((ing, i: number) => (
                                      <div className="flex" key={i}>
                                        <span className="font-semibold">{++i}. </span>
                                        <span className={`${Number(ing.ing_qty) === 0 ? 'line-through' : ''} mr-1`} >
                                          {ing.ing_name}
                                          {Number(ing.ing_qty) > 0 && (
                                            <>, qty: {ing.ing_qty} {ing.ing_unit}, price: {Number(ing.ing_price) * Number(ing.ing_qty)}</>
                                          )}</span>
                                      </div>

                                    ))
                                  }

                                </div>
                              </div>
                              : ""
                          }

                          {
                            (item.combo_drinks && item.combo_drinks.length > 0) ?
                              <>
                                <Separator orientation="horizontal" />
                                <div className="pb-1">
                                  <span className="font-semibold">combo drinks</span>
                                  <ul className="px-1">
                                    {
                                      item.combo_drinks.map((drink, i: number) => (
                                        <div className="flex" key={i}>
                                          <span className="font-semibold">{++i}. </span>
                                          <li className="mr-1 mb-1">
                                            <span className="mr-1">name: {drink.name},</span>
                                            <span className="mr-1">qty: {drink.total_qty}</span>
                                            <span className="mr-1">total price: ${Number(drink.price) * Number(drink.total_qty)}</span>
                                          </li>
                                        </div>
                                      ))
                                    }

                                  </ul>
                                </div>
                              </>
                              : ""
                          }

                          {
                            (item.combo_desserts && item.combo_desserts.length > 0) ?
                              <>
                                <Separator orientation="horizontal" />
                                <div className="pb-1">
                                  <span className="font-semibold">combo dessert</span>
                                  <ul className="px-1">
                                    {
                                      item.combo_desserts.map((dessert, i: number) => (
                                        <div className="flex" key={i}>
                                          <span className="font-semibold">{++i}. </span>
                                          <li className="mr-1 mb-1">
                                            <span className="mr-1">name: {dessert.name},</span>
                                            <span className="mr-1">quantity: {dessert.total_qty}</span>
                                            <span className="mr-1">total price: ${Number(dessert.price) * Number(dessert.total_qty)}</span>
                                          </li>
                                        </div>
                                      ))
                                    }

                                  </ul>
                                </div>
                              </>
                              : ""
                          }

                          {
                            (item.customer_note && item.customer_note.length > 0) ?
                              <>
                                <Separator orientation="horizontal" />
                                <div className="pb-1">
                                  <span className="font-semibold">note</span>
                                  <p>{item.customer_note}</p>
                                </div>
                              </> :
                              ""
                          }


                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>


                </div>
                : ''}
            </div>
          )
        })
      }

    </div>

  );
};

export default CartItem;