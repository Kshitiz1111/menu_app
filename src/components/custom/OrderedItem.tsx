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

interface orderedStackType {
  orderId: string;
  timeStamp?: string;
}
const OrderedItem = ({ restaurantId }: { restaurantId: string }) => {
  const restaurant_id = restaurantId
  const context: any = useOrderContext()

  // setOrders(selectedProducts)

  // const updateQuantity = (id: any, quantity: any) => {
  //    setOrders(orders.map(item => item.product_id == id ? { ...item, total_quantity: quantity, total_price: Math.ceil(Number(item.product_price)) * Number(quantity) } : item));
  // };

  // const removeItem = (id: any) => {
  //    setOrders(orders.filter(item => item.product_id !== id));
  // };
  // console.log("orders cart", orders)
  let orders: any;
  useEffect(() => {
    // Check if a guest ID already exists
    let guestId = localStorage.getItem('guestId');

    const ordersWithUserId: any = {
      orders: [...orders],
      userId: guestId, // Use the guest ID for guests
    };

    const ordersString = JSON.stringify(ordersWithUserId);
    localStorage.setItem(`${restaurant_id}_orders`, ordersString);
    // console.log("totalOrder after edit from cart", ordersWithUserId,);

  }, [orders])
  if (!context) {
    // Return null or some fallback UI
    return null;
  }

  orders = context.orders as any;
  console.log("orders", orders)
  const { setOrders } = context as any;

  let orderedStack: orderedStackType[] = [];
  orders.map((item: any) => {
    if (item.purchase_confirm && item.purchase_order_id) {

      const orderIdExists = orderedStack.some(stack => stack.orderId === item.purchase_order_id)
      if (!orderIdExists) {
        let newOrderStack: orderedStackType = {
          orderId: item.purchase_order_id,
        };
        orderedStack.push(newOrderStack)
      }
    }

  });
  return (
    <div className=" overflow-y-scroll h-screen">
      {orderedStack &&
        orderedStack.map((stack, i) =>
          <div key={i} className=" bg-gray-200 my-2 rounded-md p-2">
            <div className=" flex font-semibold items-center text-gray-900 gap-1">
              <span className="font-xl">{++i}.</span>
              <p className="text-sm">{stack.orderId}</p>
            </div>
            {orders &&
              orders.map((item: z.infer<typeof ProductFormSchema>, index: number) => {
                return (
                  <div key={index}>
                    {(item.purchase_confirm && (stack.orderId === item.purchase_order_id)) ?
                      <div className="relative p-2 bg-white rounded-md text-gray-700 shadow-md mb-2">
                        <div className="cart-item flex flex-wrap items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-700 rounded-full px-2 text-white text-center ">{item.total_quantity}</span>
                            <h4 className="text-lg font-semibold text-gray-700">{item.product_name}</h4>
                            <p className="absolute top-0 right-0 py-0 px-2 text-gray-700 text-sm">${Math.ceil(Number(item.total_price))}</p>
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
                                          item.base_ingredient.map((ing, i: number) => (
                                            <span className="mr-1" key={i}>{ing.ing_name},</span>
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
                                          item.custom_ingredient.map((ing, i) => (
                                            <div key={i} className="flex">
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
                                        <Accordion type="single" collapsible>
                                          <ul className="px-1">
                                            <AccordionItem value="item-1" className="border-0">
                                              <AccordionTrigger className='py-0 text-xs justify-normal'>
                                                {
                                                  item.combo_drinks.map((drink, i) => (
                                                    <div key={i} className="flex">
                                                      <li className="mr-1 mb-1">
                                                        <span className="mr-1 bg-gray-400 rounded-full px-1">{drink.total_qty}</span>
                                                        <span className="mr-1">{drink.name} </span>
                                                      </li>
                                                    </div>
                                                  ))
                                                }
                                              </AccordionTrigger>
                                              <AccordionContent className="pb-0">
                                                {
                                                  item.combo_drinks.map((drink, i) => (
                                                    <div key={i} className="flex text-xs">
                                                      <span className="font-semibold">{++i}. </span>
                                                      <li className="mr-1 mb-1">
                                                        <span className="mr-1">name: {drink.name},</span>
                                                        <span className="mr-1">qty: {drink.total_qty}, </span>
                                                        <span className="mr-1">total price: ${Number(drink.price) * Number(drink.total_qty)}, </span>
                                                        <span>ingredients:
                                                          {(drink.base_ingredient && drink.base_ingredient.length > 0) &&
                                                            drink.base_ingredient.map((ing, index: number) => (
                                                              <span key={i}> {ing.ing_name}, </span>
                                                            ))
                                                          }
                                                        </span>
                                                      </li>
                                                    </div>
                                                  ))
                                                }
                                              </AccordionContent>
                                            </AccordionItem>
                                          </ul>
                                        </Accordion>
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
                                        <Accordion type="single" collapsible>
                                          <ul className="px-1">
                                            <AccordionItem value="item-1" className="border-0">
                                              <AccordionTrigger className='py-0 text-xs justify-normal'>
                                                {
                                                  item.combo_desserts.map((dessert, i) => (
                                                    <div key={i} className="flex">
                                                      <li className="mr-1 mb-1">
                                                        <span className="mr-1 bg-gray-400 rounded-full px-1">{dessert.total_qty}</span>
                                                        <span className="mr-1">{dessert.name} </span>
                                                      </li>
                                                    </div>
                                                  ))
                                                }
                                              </AccordionTrigger>
                                              <AccordionContent className="pb-0">
                                                {
                                                  item.combo_desserts.map((dessert, i) => (
                                                    <div key={i} className="flex text-xs">
                                                      <span className="font-semibold">{++i}. </span>
                                                      <li className="mr-1 mb-1">
                                                        <span className="mr-1">name: {dessert.name},</span>
                                                        <span className="mr-1">qty: {dessert.total_qty}, </span>
                                                        <span className="mr-1">total price: ${Number(dessert.price) * Number(dessert.total_qty)}, </span>
                                                        <span>ingredients:
                                                          {(dessert.base_ingredient && dessert.base_ingredient.length > 0) &&
                                                            dessert.base_ingredient.map((ing, index: number) => (
                                                              <span key={index}> {ing.ing_name}, </span>
                                                            ))
                                                          }
                                                        </span>
                                                      </li>
                                                    </div>
                                                  ))
                                                }
                                              </AccordionContent>
                                            </AccordionItem>
                                          </ul>
                                        </Accordion>
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
            <div>
              <span>orderStatus</span>
            </div>
          </div>
        )

      }


    </div>

  );
};

export default OrderedItem;