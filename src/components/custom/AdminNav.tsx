"use client"
import React from 'react'
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


const AdminNav = () => {
   let currentPath = usePathname();
   return (
      <Sheet>
         <SheetTrigger className='p-1'>
            <Image src={'/icons/menu.svg'} width={30} height={30} alt='menu icon' />
         </SheetTrigger>
         <SheetContent side={"left"}>
            <SheetHeader className='w-full'>
               <Link href={"/admin"}><span className={`${currentPath === '/admin' ? 'bg-black text-white' : 'bg-gray-300 text-black'} hover:bg-black hover:text-white cursor-pointer px-2 py-1 rounded-full w-full`}>dashboard</span></Link>
               <Link href={"/admin/products"}><span className={`${currentPath === '/admin/products' ? 'bg-black text-white' : 'bg-gray-300 text-black'} hover:bg-black hover:text-white cursor-pointer px-2 py-1 rounded-full w-full`}>products</span></Link>
               <Link href={"/admin/addproduct"}><span className={`${currentPath === '/admin/addproduct' ? 'bg-black text-white' : 'bg-gray-300 text-black'} hover:bg-black hover:text-white cursor-pointer px-2 py-1 rounded-full w-full`}>add product</span></Link>
            </SheetHeader>

         </SheetContent>
      </Sheet>

   )
}

export default AdminNav