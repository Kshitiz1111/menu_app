"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation';


const NotFound = () => {
   const path = usePathname();
   return (
      <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center px-4 py-8">
         <h1 className="text-5xl font-bold text-gray-800">404 Page Not Found</h1>
         <p className="text-lg text-gray-600 mt-4">Oops! Looks like the page <strong>{path}</strong> you&apos;re looking for doesn&apos;t exist.</p>
         <Link href="/" className="inline-flex items-center px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 font-medium text-md">Go back to the homepage</Link>
      </div>
   );
};

export default NotFound;
