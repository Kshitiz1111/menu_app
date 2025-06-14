'use client'
import React, { useEffect } from 'react';

type RestaurantProfileType = {
  username: string;
  reg_no: string;
  vat_no: string;
  pan_no: string;
  business_type: string;
  email: string;
  country_code: string;
  phone_number: string;
  package_id: string;
  join_date: string; // ISO 8601 date string format
  package_expire_date: string; // ISO 8601 date string format
  country: string;
  city: string;
  street: string;
  verification_status: 'Approved' | 'Pending' | 'Rejected'; // Assuming verification status can be one of these three states
  description: string | null;
  profile_photo: string | null;
  cover_photo: string | null;
};

const RestaurantProfile = ({ rid }: { rid: string | undefined }) => {
  const [restaurant, setRestaurant] = React.useState<RestaurantProfileType | undefined>();
  console.log("hello", rid)

  useEffect(() => {
    if (rid) {
      try {
        (async () => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASEURL}/api/get_restaurant_info`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rid)
          });
          const data = await response.json();
          setRestaurant(data.message.payload)
          console.log("restaurant", data.message)
        })()
      } catch (error) {
        console.log('failed fetching restaurant info: ', error)
      }
    }
  }, [])

  console.log("restaurant", restaurant)
  return (
    <div className="max-w-4xl mx-auto my-10">
      {(restaurant) ?
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <img className="h-48 w-full object-cover rounded-t-lg mb-4" src={restaurant.cover_photo || 'https://via.placeholder.com/400'} alt="Cover" />
          <div className="px-6 py-4">
            <h3 className="text-xl font-semibold">{restaurant.username}</h3>
            <p className="text-lg text-gray-700">{restaurant.business_type} - {restaurant.country}, {restaurant.city}</p>
            <p className="text-base text-gray-500">{restaurant.email}</p>
            <p className="text-sm text-gray-500">Registration No.: {restaurant.reg_no}</p>
            <p className="text-sm text-gray-500">VAT No.: {restaurant.vat_no}</p>
            <p className="text-sm text-gray-500">PAN No.: {restaurant.pan_no}</p>
            <p className="text-sm text-gray-500">Phone: {restaurant.phone_number}</p>
            <p className="text-sm text-gray-500">Package ID: {restaurant.package_id}</p>
            <p className="text-sm text-gray-500">Joined on: {new Date(restaurant.join_date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">Expires on: {new Date(restaurant.package_expire_date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">Verification Status: {restaurant.verification_status}</p>
            {restaurant.description && <p className="text-sm text-gray-500">{restaurant.description}</p>}
            {restaurant.profile_photo ? null : <img className="h-32 w-32 object-cover rounded-full mx-auto" src={restaurant.profile_photo || ''} alt="Profile" />}
          </div>
        </div>
        :
        <span className="animate-pulse p-20">loading...</span>
      }

    </div>
  );
};

export default RestaurantProfile;