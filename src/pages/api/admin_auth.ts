import { adminLogin } from "@/lib/actions/adminLogin.action";
import { AdminLoginType } from "@/lib/validator";
import { SignJWT } from "jose";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { nanoid } from 'nanoid'
import { getAdminJwtSecretKey } from "@/lib/auth";
import cookie from "cookie"
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

export default async function handler(req:NextApiRequest, res:NextApiResponse){
   const reqObj:z.infer<typeof AdminLoginType> = req.body;
   
   try {
      if(req.method === 'POST'){
         // console.log(reqObj,"asdf");
         let result:any = await adminLogin({email:reqObj.email, password: reqObj.password});
         // console.log('asdf')
         if(!result.success){
            throw new Error(`${result.error}`);
         }
         let jwtExpiretime: string = (reqObj.remember)? '5m':'1m';
         const token = await new SignJWT({})
         .setProtectedHeader({alg: 'HS256'})
         .setJti(nanoid())
         .setIssuedAt()
         .setExpirationTime(jwtExpiretime)
         .sign(new TextEncoder().encode(getAdminJwtSecretKey()))
         
         res.setHeader('Set-Cookie', cookie.serialize('admin_auth_tkn', token,{
            httpOnly: true,
            path: '/',
            // secure: process.env.NODE_ENV === 'production'
         }));

         res.status(200).json({success: result.success, identity_code: result.restauranIdentityCode, error: ""});
      }
      if(req.method === 'GET'){
         
      }

   } catch (error:any) {
      console.log(error);
      res.status(401).json({success: false, identity_code: "", error: error.message});
   }

}