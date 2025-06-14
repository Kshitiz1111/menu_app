'use client'
import AdminLoginForm from "@/components/custom/form/AdminLoginForm"
import { cookies } from 'next/headers'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const AdminLogin = () => {
  // console.log("restaurant id", cookies().getAll())
  return (
    <div className="">

      <DotLottieReact
        src="https://lottie.host/d493e3f4-b287-4656-9d14-c0485eaa6fb7/zIu5uefDrN.lottie"
        autoplay
        loop
        className="w-24 m-auto"
      />
      <AdminLoginForm />

    </div>
  )
}

export default AdminLogin