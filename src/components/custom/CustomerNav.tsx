"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import CartItem from './CartItem'
import OrderBtn from "./OrderBtn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrderedItem from "./OrderedItem";
import { useEffect, useState } from "react";



const CustomerNav = () => {
  let currentPath = usePathname();
  let currentShop = currentPath?.split("/")[2] || 'r01';
  let [domain, setDomain] = useState('http://localhost:3000')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.origin);
    }
  }, [])

  return (
    <div className="flex justify-between">
      <Sheet>
        <SheetTrigger className='p-2'>
          <Image src={'/icons/menu.svg'} width={30} height={30} alt='menu icon' />
        </SheetTrigger>
        <SheetContent side={"left"}>
          <SheetHeader className='w-full'>
            <Link href={"/"}><span className={`${currentPath === '/' ? 'bg-black text-white' : 'bg-gray-300 text-black'} hover:bg-black hover:text-white cursor-pointer px-2 py-1 rounded-full w-full`}>home</span></Link>
            {/* <Link href={"/cart"}><span className={`${currentPath === '/cart' ? 'bg-black text-white' : 'bg-gray-300 text-black'} hover:bg-black hover:text-white cursor-pointer px-2 py-1 rounded-full w-full`}>cart</span></Link>
               <Link href={"/dishes"}><span className={`${currentPath === '/dish' ? 'bg-black text-white' : 'bg-gray-300 text-black'} hover:bg-black hover:text-white cursor-pointer px-2 py-1 rounded-full w-full`}>dishes</span></Link> */}
          </SheetHeader>

        </SheetContent>
      </Sheet>

      <Sheet>

        <SheetTrigger className='p-2'>
          <Image src={'/icons/cart.png'} width={30} height={30} alt='menu icon' />
        </SheetTrigger>
        <SheetContent side={"right"} className='overflow-y-scroll w-4/5 sm:w-[540px] p-2'>
          <SheetHeader className='w-full mb-2'>
            Cart Items
          </SheetHeader>
          <Tabs defaultValue="unpaid" className="p-1">
            <TabsList className="w-full">
              {/* //Reserved */}
              <TabsTrigger value="unpaid" className="w-full">Pending</TabsTrigger>
              <TabsTrigger value="paid" className="w-full">Ordered</TabsTrigger>
            </TabsList>
            <TabsContent value="unpaid">
              <CartItem restaurantId={currentShop} />
              <OrderBtn restaurantId={currentShop} domainUrl={domain} />
            </TabsContent>
            <TabsContent value="paid">
              <OrderedItem restaurantId={currentShop} />
            </TabsContent>
          </Tabs>

        </SheetContent>
      </Sheet>
    </div>

  )
}

export default CustomerNav