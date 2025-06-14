"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  // CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useOrderContext } from "@/context/orderContext"
import { getSingleProduct } from "@/lib/actions/product.action"
import Image from "next/image"
import { useEffect, useState } from "react"
import { json } from "stream/consumers"
import { ProductFormSchema } from "@/lib/validator"
import { z } from "zod"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { getRestaurantId } from "@/lib/placeHolderData"
// import type { orderContextType } from "@/context/orderContext"


interface Product {
  baseing_ids: number[] | null;
  combo_dessert_id: number | null;
  combo_drinks_id: number | null;
  customing_ids: number[];
  product_id: number;
  product_name: string;
  product_des: string;
  product_img: string;
  product_category: string;
  product_type: string;
  diet_type: string;
  product_price: string;
}


const DishCard = ({ restaurant_id }: { restaurant_id: string }) => {
  // const restaurant_id = getRestaurantId()
  console.log("dishcard restaurant_id", restaurant_id)
  const [products, setProducts] = useState<Array<Product>>();
  const [singleProduct, setSingleProduct] = useState<z.infer<typeof ProductFormSchema> | any>()
  const [openNote, setOpenNote] = useState<Boolean>(false);
  const loggedInUser = "guest";

  async function getProducts() {
    try {
      let response = await fetch(`/api/customer/product?restaurant_id=${restaurant_id}`, {
        method: 'GET', // Specify the method
        headers: {
          'Content-Type': 'application/json' // Set the content type header
        },
      })
      let result = await response.json();
      setProducts(result.message.products);
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getProducts()
  }, [])

  const context: any = useOrderContext()


  const handleSelect = async (dish: any) => {
    try {
      let result: any = await getSingleProduct(dish);
      setSingleProduct({
        ...result.product,
        custom_ingredient: (result.product?.custom_ingredient && result.product.custom_ingredient.length > 0) ? result.product.custom_ingredient.map((customIngredient: any) => {
          const matchingBaseIngredient = result.product.base_ingredient?.find(
            (baseIngredient: any) => baseIngredient.ing_name === customIngredient.ing_name
          );
          if (matchingBaseIngredient) {
            return {
              ...customIngredient,
              ing_qty: Number(matchingBaseIngredient.ing_qty),
            };
          } else {
            return customIngredient;
          }
        }) : "",
        total_quantity: 1,
        total_price: 1 * Number(result.product?.product_price),
      });
      console.log("singleProduct", result.product);
      // console.log('customer context product', JSON.parse(product))
    } catch (error) {
      console.log(error)
    }
  }
  // console.log("singleProduct", result.product);

  let orders: any;

  useEffect(() => {
    // Serialize the orders array to a JSON string
    if (!context) return;

    const { orders, setOrders } = context as any;
    function generateGuestId() {
      return '_' + Math.random().toString(36).substring(2, 9);
    }
    console.log("orders", orders)
    // Check if a guest ID already exists
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = generateGuestId();
      localStorage.setItem('guestId', guestId);
    }

    const ordersWithUserId: any = {
      orders: [...orders],
      userId: guestId, // Use the guest ID for guests
    };

    const ordersString = JSON.stringify(ordersWithUserId);
    localStorage.setItem(`${restaurant_id}_orders`, ordersString);

    console.log("totalOrder", ordersWithUserId,);

  }, [orders])

  if (!context) {
    // Return null or some fallback UI
    return null;
  }
  orders = context.orders as any;
  console.log("orders", orders)
  const { setOrders } = context as any;
  return (
    <div className="flex flex-wrap gap-1">
      {(products && products.length > 0) ?
        products?.map((product, index) => {
          return (

            <Dialog key={index}>
              <Card key={product.product_id}
              >
                <CardHeader>
                  <CardTitle>{product.product_name}</CardTitle>
                  <CardDescription>{product.product_des.substring(0, 20) + "..."}</CardDescription>
                  <Image src={'/images/dish1.jpg'} className="m-auto" alt="dish image" width={50} height={50}></Image>
                </CardHeader>
                <DialogTrigger asChild>
                  <Button className="w-full" onClick={() => handleSelect(product)}>
                    open
                  </Button>
                </DialogTrigger>
                {singleProduct &&
                  <DialogContent className={`${(product.customing_ids.length > 2) ? 'overflow-y-scroll h-screen' : 'overflow-hidden h-auto'} md:h-auto`}>
                    <DialogHeader>
                      <DialogTitle>{singleProduct.product_name}</DialogTitle>
                      <Image src={'/images/dish1.jpg'} className={"rounded-md mx-auto block md:mx-0"} alt="dish image" width={50} height={50}></Image>
                      <DialogDescription>
                        {singleProduct.product_des}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="block m-auto md:m-1">
                      {/* <Badge >{`${singleProduct.product_category}`}</Badge> */}
                      <Badge className="mr-1">{` ${singleProduct.product_type}`}</Badge>
                      <Badge >{` ${singleProduct.diet_type}`}</Badge>
                    </div>


                    {singleProduct.base_ingredient && singleProduct.base_ingredient?.length > 0 &&
                      <div>
                        <strong>base ingredients</strong>
                        <div className="flex flex-wrap gap-1">
                          {
                            singleProduct.base_ingredient && singleProduct.base_ingredient?.length > 0 &&

                            singleProduct.base_ingredient.map((baseing: any, index: number) => (
                              <span key={index} className={'text-gray-500 font-semibold text-sm'}>{baseing.ing_name} ,</span>
                            ))
                          }
                        </div>
                      </div>
                    }
                    {singleProduct.custom_ingredient && singleProduct.custom_ingredient?.length > 0 &&
                      <div>
                        <strong>customizable ingredients</strong>
                        <div className="">
                          {
                            singleProduct.custom_ingredient && singleProduct.custom_ingredient?.length > 0 &&

                            singleProduct.custom_ingredient.map((customing: any, index: number) => (
                              <div key={index} className="flex flex-wrap justify-between items-center mb-1">
                                <span className="text-gray-500 font-semibold text-sm">{customing.ing_name}</span>
                                <div className="flex gap-1">
                                  <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
                                    onClick={() => {
                                      if (!singleProduct.custom_ingredient) return; // Safety check

                                      const updatedIngredients = [...singleProduct.custom_ingredient];
                                      let temp: any = (typeof (updatedIngredients[index].ing_qty) === "string") ? Number(updatedIngredients[index].ing_qty) : updatedIngredients[index].ing_qty;

                                      if (temp === 0) return;
                                      console.log("temp", temp)

                                      updatedIngredients[index].ing_qty = temp.toString(); // decrement the quantity
                                      // Calculate the new total price using the current quantity
                                      // const newTotalPrice = singleProduct.total_price + updatedIngredients.reduce((acc, curr) => acc + (curr.ing_qty * curr.ing_price), 0);
                                      // console.log(singleProduct.total_price, "newTotalPrice", newTotalPrice)

                                      setSingleProduct({
                                        ...singleProduct,
                                        custom_ingredient: updatedIngredients,
                                        total_price: Number(singleProduct.total_price) - (Number(customing.ing_price) * 1),
                                      });
                                    }}
                                  >-</button>
                                  <Input
                                    type="number"
                                    value={customing.ing_qty}
                                    min={0}
                                    max={1000}
                                    className="text-center bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4"
                                    readOnly
                                  />
                                  <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                                    onClick={() => {
                                      if (!singleProduct.custom_ingredient) return; // Safety check

                                      const updatedIngredients = [...singleProduct.custom_ingredient];
                                      let temp: any = (typeof (updatedIngredients[index].ing_qty) === "string") ? Number(updatedIngredients[index].ing_qty) : updatedIngredients[index].ing_qty;

                                      temp++;
                                      updatedIngredients[index].ing_qty = temp.toString(); // Increment the quantity

                                      // Calculate the new total price by adding the ingredient's price once
                                      // const newTotalPrice = singleProduct.total_price + updatedIngredients.reduce((acc, curr) => acc + (curr.ing_price), 0);
                                      // console.log(singleProduct.total_price, "newTotalPrice", newTotalPrice)
                                      console.log("newPrice", Number(singleProduct.total_price) + (Number(customing.ing_price) * Number(customing.ing_qty)))
                                      let tempQty = 0;
                                      setSingleProduct({
                                        ...singleProduct,
                                        custom_ingredient: updatedIngredients,
                                        total_price: (Number(singleProduct.total_price) + (Number(customing.ing_price) * ++tempQty)).toFixed(2),
                                      });
                                    }}
                                  >+</button>
                                </div>
                              </div>

                            ))
                          }
                        </div>
                      </div>
                    }


                    {singleProduct.combo_drinks && singleProduct.combo_drinks?.length > 0 &&
                      <div>
                        <strong>drinks</strong>
                        <div className="">
                          {
                            singleProduct.combo_drinks && singleProduct.combo_drinks?.length > 0 &&
                            <Accordion type="single" collapsible>
                              <ul className="px-1">
                                <AccordionItem value="item-1" className="border-0">
                                  <AccordionTrigger className='py-0 text-xs justify-normal flex flex-wrap gap-1'>
                                    {
                                      singleProduct.combo_drinks.map((drink: any, index: number) => (
                                        <div key={index} className="flex items-center gap-1">
                                          <span className="text-sm bg-black rounded-full px-2 text-white">{drink.total_qty}</span>
                                          <span className="text-gray text-md mr-2"> {drink.name}</span>
                                        </div>
                                      ))
                                    }
                                  </AccordionTrigger>
                                  <AccordionContent className="pb-0 px-2">
                                    {
                                      singleProduct.combo_drinks.map((drink: any, i: number) => (
                                        <div key={i} className="flex text-xs">
                                          <span className="font-semibold">{++i}. </span>
                                          <li className="mr-1 mb-1">
                                            <span className="mr-1">name: {drink.name},</span>
                                            <span>ingredients:
                                              {(drink.base_ingredient && drink.base_ingredient.length > 0) &&
                                                drink.base_ingredient.map((ing: any, index: number) => (
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
                          }
                        </div>
                      </div>
                    }

                    {singleProduct.combo_desserts && singleProduct.combo_desserts?.length > 0 &&
                      <div>
                        <strong>dessert</strong>
                        <div className="">
                          {
                            singleProduct.combo_desserts && singleProduct.combo_desserts?.length > 0 &&
                            singleProduct.combo_desserts.map((dessert: any, index: number) => (
                              <div key={index} className="flex items-center gap-1 m-1">
                                <span className="text-sm bg-black rounded-full px-2 text-white">{dessert.total_qty}</span>
                                <span className="text-gray text-md mr-2"> - {dessert.name}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    }

                    <div className="p-2 border border-gray-500 rounded-md">
                      <div className="flex flex-wrap items-center justify-between">
                        <p className="text-xs">if you have any <strong>special request</strong> / <strong>dietary note</strong></p>
                        <Toggle onClick={() => setOpenNote(!openNote)} className="mb-1 shadow-md">add +</Toggle>
                      </div>
                      {openNote && <Textarea placeholder="inform us if you have allergy with any ingredients in this dish or any special request"
                        value={singleProduct.customer_note}
                        onChange={(e) => {
                          setSingleProduct({ ...singleProduct, customer_note: e.currentTarget.value })
                        }}
                      ></Textarea>}
                    </div>

                    <Separator />

                    <div>
                      <h1 className="text-lg">combo dish <span className="text-sm">( recommended )</span></h1>
                      <div className="flex flex-wrap gap-1 pt-2">

                        <div className=" w-40 border rounded-md border-black p-1 text-sm">
                          <div className="flex flex-wrap justify-between">
                            <span className="font-semibold">name</span>
                            <span>34</span>
                            {/* <Image src={'/images/dish1.jpg'} className={"rounded-md mx-auto block md:mx-0"} alt="dish image" width={50} height={50}></Image> */}
                          </div>
                          <p className="text-gray-500">description</p>
                          <span className="text-gray-500"><span className="font-semibold">by: </span> restaurant</span>
                        </div>

                      </div>
                    </div>

                    <div className="bg-white border-t border-black sticky -bottom-10 flex flex-wrap justify-between items-center p-2 -mx-6 -mb-6">
                      <span className="font-semibold">price: <span>{singleProduct.total_price ?? singleProduct.product_price}</span>$</span>
                      <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-2">
                          <span>quantity: </span>
                          <TooltipProvider delayDuration={800} skipDelayDuration={500}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Input type="number" placeholder="qty" className="w-14" minLength={1}
                                  value={singleProduct.total_quantity ?? 1}
                                  onChange={(e) => {
                                    const newQuantity = Math.trunc(Number(e.target.value));
                                    setSingleProduct({
                                      ...singleProduct,
                                      total_quantity: (newQuantity < 1) ? "" : newQuantity,
                                      total_price: (newQuantity < 1) ? singleProduct.product_price : newQuantity * Number(singleProduct.product_price),
                                    });
                                    console.log("temp", singleProduct);
                                  }}
                                ></Input>
                              </TooltipTrigger>
                              {
                                (singleProduct.total_quantity == "") ? <TooltipContent className="bg-red-500 text-white" forceMount={singleProduct.total_quantity === "" ? true : undefined}>
                                  <p>enter quantity</p>
                                </TooltipContent>
                                  : false
                              }

                            </Tooltip>
                          </TooltipProvider>

                        </div>
                        <Separator orientation="vertical" />
                        <Button
                          variant="outline"
                          disabled={(singleProduct.total_quantity == "") ? true : false}
                          className="bg-black text-white"
                          onClick={() => setOrders([...orders, singleProduct])}
                        >add to cart</Button>
                      </div>
                    </div>
                  </DialogContent>
                }
              </Card>
            </Dialog>

          )
        })
        : "loading..."
      }

    </div >
  )
}

export default DishCard