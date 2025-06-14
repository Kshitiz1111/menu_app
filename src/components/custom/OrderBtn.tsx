import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { useOrderContext } from '@/context/orderContext'
import type { orderContextType } from "@/context/orderContext"
import { PaymentPayload } from '@/lib/validator'
import { khaltiPay } from '@/lib/actions/payment.action'
import { validateAndSanitizeUrl } from '@/lib/utils'
import { getRestaurantId } from '@/lib/placeHolderData'
import { useRouter } from 'next/router'

const OrderBtn = ({ restaurantId, domainUrl }: { restaurantId: string, domainUrl: string }) => {
  const restaurant_id = restaurantId;
  const [totalItem, setTotalItem] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0)
  const guestId: string = JSON.parse(localStorage.getItem(`${restaurant_id}_orders`)!)?.userId;
  const vatPercentage = 0.13;
  const tempOrderId = generateUniquePurchaseOrderId();
  const context: any = useOrderContext()
  let orders: any;
  orders = context.orders as any;
  console.log("orders", orders)
  useEffect(() => {
    let price = 0;
    let itemsLength = 0;
    orders.map((item: any) => {
      if (!item.purchase_confirm) {
        price += Number(item.total_price);
        itemsLength++;
      }
    })
    setTotalItem(itemsLength);
    setTotalPrice(price);
  }, [orders])
  if (!context) {
    // Return null or some fallback UI
    return null;
  }


  const { setOrders } = context as any;


  function generateUniquePurchaseOrderId() {
    // Get the current timestamp
    const timestamp = new Date().getTime();

    // Generate a random number between 1000 and 9999
    const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    // Combine the timestamp and random number to form a unique ID
    const uniqueId = `PO-${timestamp}-${randomNumber}`;

    return uniqueId;
  }

  const paymentPayload: PaymentPayload = {
    "return_url": `${domainUrl}/shops/${restaurant_id}`,
    "website_url": "https://example.com/",
    "amount": (totalPrice + Math.ceil(totalPrice * vatPercentage)) * 100,
    "purchase_order_id": guestId + "_" + tempOrderId,
    "purchase_order_name": guestId,
    "customer_info": {
      "name": "guest" + guestId,
      "email": "example@gmail.com",
      "phone": "9800000123"
    },
    "amount_breakdown": [
      {
        "label": "Mark Price",
        "amount": totalPrice * 100
      },
      {
        "label": "VAT",
        "amount": Math.ceil(totalPrice * vatPercentage) * 100
      }
    ],
    "product_details": [
      {
        "identity": tempOrderId,
        "name": "Dish",
        "total_price": (totalPrice + Math.ceil(totalPrice * vatPercentage)) * 100,
        "quantity": 1,
        "unit_price": (totalPrice + Math.ceil(totalPrice * vatPercentage)) * 100,
      }
    ],
    "merchant_username": restaurant_id + "_restaurant",
    "merchant_extra": "baneshwor branch"
  }

  const handlePayment = async () => {
    try {
      let response = await khaltiPay(paymentPayload);
      console.log("response", response);
      if (response?.status != 200) {
        throw new Error("Payment initiation failed");
      }

      const data = response?.data;
      console.log("data", data);
      console.log("data.payment_url", data.payment_url);

      if (response?.status === 200) {
        // Parse the URL
        let sanitizedUrl = validateAndSanitizeUrl(data.payment_url);
        if (sanitizedUrl) {
          console.log("khalti initial payment success: ", data);
          let guestId = localStorage.getItem('guestId');

          setOrders(orders.map((item: any) => {
            // Check if item.purchase_confirm is false or undefined
            if (item.purchase_confirm === false || item.purchase_confirm === undefined) {
              // If the condition is met, return a new object with the modified purchase_order_id
              return { ...item, purchase_order_id: guestId + "_" + tempOrderId };
            } else {
              // If the condition is not met, return the item as is
              return item;
            }
          }));
          // Check if a guest ID already exists
          const ordersWithUserId: any = {
            orders: [...orders],
            userId: guestId, // Use the guest ID for guests
          };
          const ordersString = JSON.stringify(ordersWithUserId);
          // localStorage.setItem(`${restaurant_id}_orders`, ordersString);

          window.location.href = data.payment_url;
        }
      }

    } catch (error) {
      console.log("khalti payment error: ", error)
    }
  }

  return (
    <div className='sticky -bottom-5 px-2 pb-4 bg-white border-t border-black'>
      <div className="mt-4">
        <div className='flex flex-wrap justify-between'>
          <p className="text-md font-semibold">total price: <span className='font-normal'>Rs.{totalPrice + Math.ceil(totalPrice * vatPercentage)}</span></p>
          <p className="text-md font-semibold">no of item: <span className='font-normal'>{totalItem}</span></p>
        </div>
        <p className="text-sm text-gray-500">Including 13% VAT and Service Charge</p>
      </div>
      <div className="mt-4">
        <Button variant={'secondary'}
          className="w-full bg-black hover:bg-gray-800 text-white "
          disabled={(totalPrice > 10) ? false : true}
          onClick={handlePayment}
        >
          Place Order
        </Button>
      </div>
    </div>
  )
}

export default OrderBtn