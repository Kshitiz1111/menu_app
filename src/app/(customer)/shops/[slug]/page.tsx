'use client'
import CustomerNav from "@/components/custom/CustomerNav";
import DishCard from "@/components/custom/DishCard";
import { orderContextType, useOrderContext } from "@/context/orderContext";
import { paymentVerificationLookup } from "@/lib/actions/payment.action";
import { getRestaurantId, setRestaurantId } from "@/lib/placeHolderData";
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react";

interface TransactionDetails {
  pidx: string;
  oAuDJMmFVUzKnvgnpyySV7: string;
  transaction_id: string;
  tidx: string;
  amount: number;
  total_amount: number;
  mobile: string;
  status: string;
  purchase_order_id: string;
  purchase_order_name: string;
  username: string;
  extra: string;
}

interface toastInfoType {
  title: string;
  description: string;
  status: boolean;
}

const DynamicShop = () => {
  const params = useParams();
  if (params === null) return <div>invalid route</div>
  const restaurant_id: string = params.slug as string;
  // Create a ref to track if the effect has run
  const hasRun = useRef(false);

  const searchParams = useSearchParams()
  let [toastInfo, setToastInfo] = useState<toastInfoType | undefined>(undefined);
  const context = useOrderContext()

  console.log("searchParams", searchParams?.get("restaurant_id"))

  // Display the key/value pairs
  const entities = searchParams?.entries();

  useEffect(() => {
    console.log("hello")
    if (!context) return;

    const { orders } = context as orderContextType;
    setToastInfo(undefined)
    if (!entities) {
      return;
    }

    const entriesArray = Array.from(entities);;
    const transactionDetails: TransactionDetails = entriesArray.reduce((acc: any, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    const verifyPayment = async () => {
      const response = await paymentVerificationLookup(transactionDetails.pidx);
      const data = await response?.json();
      console.log("lookup data", data)
      if (!response?.ok) {
        if (data?.status === "Expired") {
          setToastInfo({
            title: "Payment Link Expired!",
            description: "please complete your transaction within 60min.",
            status: false
          })
        }
        if (data?.status === "User canceled") {
          setToastInfo({
            title: "Payment Canceled!",
            description: "transaction has been successfully cancled, please try again later.",
            status: false
          })
        }
      }
      if (data?.status === "Pending") {
        setToastInfo({
          title: "Payment Pending!",
          description: "please wait",
          status: true
        })
      }
      if (data?.status === "Refunded") {
        setToastInfo({
          title: "Payment Refunded!",
          description: "transaction has been refunded successfully.",
          status: true
        })
      }
      if (data?.status === "Partially refunded") {
        setToastInfo({
          title: "Payment Partially refunded!",
          description: "transaction has been partially refunded successfully.",
          status: true
        })
      }
      if (data?.status === "Completed") {
        setToastInfo({
          title: "Payment Successful!",
          description: "transaction has been successfully, thank you!.",
          status: true
        })
      }
    }

    //change purchase_confirm in order items
    const updatedOrders = orders.map((order, index) => {
      const isConditionMet = transactionDetails.purchase_order_id === order.purchase_order_id && transactionDetails.status === "Completed";
      //store confirm order in database
      if (isConditionMet) {

      }
      // Return a new object that includes all properties of the original order and a new boolean property
      console.log(order.purchase_confirm, isConditionMet)
      return {
        ...order,
        purchase_confirm: (order.purchase_confirm === true) ? true : isConditionMet, // This is the new boolean property
      };
    });

    console.log("transactionDetails: ", transactionDetails)

    try {
      if (transactionDetails?.hasOwnProperty("pidx")) {
        (async () => {
          await verifyPayment();
        })();
      }
      /* 
      remove use ref in production
      */
      if (!hasRun.current) {
        //store completed order in database
        if (transactionDetails.status === "Completed") {
          // Your database storage logic here...
          //store completed order in database
          if (transactionDetails.status === "Completed") {
            let currentOrderItem = orders.filter((order) => order.purchase_order_id === transactionDetails.purchase_order_id);

            let filteredOrderItems = currentOrderItem.map((order) => {
              return (
                {
                  product_id: Number(order.product_id),
                  total_quantity: Number(order.total_quantity),
                  total_price: Number(order.total_price),
                  customer_note: order.customer_note,
                  customized_ingredients: (order.custom_ingredient && order.custom_ingredient?.length > 0) ? order.custom_ingredient.filter((ing) => Number(ing.ing_qty) > 0) : null,
                }
              )
            });
            console.log("filteredOrderItems", filteredOrderItems);
            //let payload: OrderType = {

            let payload: any = {
              purchase_order_id: transactionDetails.purchase_order_id,
              no_of_item: filteredOrderItems.length,
              total_price: transactionDetails.total_amount / 100,
              compensation: null,
              status: "paid",
              details: filteredOrderItems,
            };
            (async () => {
              try {
                // Create the fetch request
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASEURL}/api/customer/orders`, {
                  method: 'POST', // Specify the method
                  headers: {
                    'Content-Type': 'application/json', // Set the content type header
                  },
                  body: JSON.stringify(payload), // Convert the payload to a JSON string
                });

                // Check if the request was successful
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }

                // Parse the response
                const data = await response.json();

                console.log('Success:', data);
              } catch (error) {
                console.error('Error:', error);
              }
            })()
          }
        }


        // Now, you can use setOrders to update your state with the new array
        setOrders(updatedOrders);
        let guestId = localStorage.getItem('guestId');

        const ordersWithUserId: any = {
          orders: [...orders],
          userId: guestId, // Use the guest ID for guests
        };

        const ordersString = JSON.stringify(ordersWithUserId);
        localStorage.setItem(`${restaurant_id}_orders`, ordersString);
        console.log("totalOrder after edit from cart", ordersWithUserId,);
        // Mark the effect as having run
        hasRun.current = true;
      }
    } catch (error) {
      console.log("error", error);
    }

    if (typeof window !== 'undefined' && transactionDetails?.hasOwnProperty("pidx")) {
      setTimeout(() => {
        window.history.pushState({}, document.title, "/" + "");
        console.log("time our run")
      }, 1000)
    }

    // }
  }, [])
  if (!context) {
    // Return null or some fallback UI
    return null;
  }
  const { orders, setOrders } = context as orderContextType;


  console.log("router.query.slug", restaurant_id)
  return (
    <div>
      {
        toastInfo &&
        <div className={`max-w-xs fixed bottom-4 border border-black right-4 bg-white text-black p-2 rounded-lg shadow-md flex gap-1 items-center justify-between ${toastInfo.status ? '' : 'border-red-500'}`}>
          <div>
            <h3 className={`text-lg font-bold ${toastInfo.status ? '' : 'text-red-500'}`}>{toastInfo.title}</h3>
            <p className="text-sm">{toastInfo.description}</p>
          </div>
          <button onClick={() => setToastInfo(undefined)} className={`bg-black text-white px-2 py-1 rounded-lg ${toastInfo.status ? '' : 'bg-red-500 text-white'}`}>
            Close
          </button>
        </div>
      }
      <DishCard restaurant_id={restaurant_id} />
    </div>
  )
}
export default DynamicShop