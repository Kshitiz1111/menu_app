"use client"
import { useEditProductContext } from "@/context/editProductContext";
import { getSingleProduct } from "@/lib/actions/product.action";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";
import { getSingleProductByRestaurant } from "@/lib/actions/admin/product.action";


interface Product {
  baseing_ids: number[] | null;
  category_id: number;
  combo_dessert_id: number | null;
  combo_drinks_id: number | null;
  customing_ids: number[];
  description: string;
  diettype_id: number;
  id: number;
  img: string;
  name: string;
  price: string;
  type_id: number;
}
const ProductTable = () => {
  const [products, setProducts] = useState<Array<Product>>();
  const router = useRouter();
  console.log("products", products)
  async function getProducts() {
    try {
      let response = await fetch("/api/admin/product", {
        method: 'GET', // Specify the method
        headers: {
          'Content-Type': 'application/json' // Set the content type header
        },
        credentials: 'include'
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

  const context = useEditProductContext();
  if (!context) {
    // Return null or some fallback UI
    return null;
  }

  const { setToBeEditedProduct, toBeEditedProduct } = context;
  const handleEdit = async (product: any) => {
    console.log("to be edited product", product);
    let result = await getSingleProductByRestaurant(product, 'r02');
    setToBeEditedProduct({ product: JSON.stringify(result.product), productRawData: JSON.stringify(product) })
    router.push(`/admin/updateproduct/${product.product_id}`);
  }


  const handleDelete = async (product_id: number) => {
    console.log(product_id)

    try {
      // Construct the URL for the DELETE request
      const url = `/api/product`;

      // Make the DELETE request
      const response = await fetch(url, {
        method: 'DELETE', // Specify the method as DELETE
        headers: {
          'Content-Type': 'application/json', // Set the content type header
        },
        body: JSON.stringify({ productId: product_id })
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optionally, you can parse the response if the server returns any data
      const data = await response.json();
      if (data) {
        try {
          await getProducts();
        } catch (error) {
          console.log(`error while refetching data after delete, error: ${error}`)
        }
      }
      console.log('Product deleted successfully:', data);
    } catch (error) {
      console.error('Error deleting product:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  }

  return (
    <table className="w-full text-left table-auto">
      <thead>
        <tr>
          <th className="p-1">Image</th>
          <th className="p-1">Name</th>
          <th className="p-1">Description</th>
          <th className="p-1">Actions</th>
        </tr>
      </thead>
      {
        (products && products.length > 0) ?
          <tbody>
            {products?.map((product: any) => (
              <tr key={product.product_id} >
                <td className="border p-1">
                  <Image src={'/images/dish1.jpg'} width={30} height={30} alt={product.product_name} className="m-auto object-cover rounded-md" />
                </td>
                <td className="border p-1">{product.product_name}</td>
                <td className="border p-1">{product.product_des.substring(0, 20)}...</td>
                <td className="border p-1 flex justify-evenly">
                  <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 font-bold py-1 px-2 rounded mr-2">Edit</button>
                  <AlertDialog>
                    <AlertDialogTrigger className="text-red-500 hover:text-red-700 font-bold py-1 px-2 rounded">Delete</AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure you?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete <strong>{product.product_name}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(product.product_id)}
                          className="bg-red-500"
                        >Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                </td>
              </tr>
            ))}
          </tbody>
          : <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-100">
              <td className="border p-1" colSpan={4}>
                <div className="flex justify-center items-center">
                  <span className="animate-pulse p-20">no data</span>
                </div>
              </td>
            </tr>
          </tbody>
      }
    </table>

  )
}

export default ProductTable