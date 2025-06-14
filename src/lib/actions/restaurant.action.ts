"use server";
// import pool from "@/lib/database/db";
import { db } from '@vercel/postgres';
import { connectMainLocally } from '../database/localmaindb';
import { connectClientLocally } from '../database/localdb';

export const getRestaurantData = async (rid: string) => {
  //  let rclient = await db.connect();
  let rclient = await connectClientLocally();
  try {
    await rclient.query("BEGIN")
    const restaurantData = await rclient.query(`
         SELECT username, reg_no, vat_no, pan_no, business_type, email, country_code, phone_number, package_id, join_date, package_expire_date, 
         country, city, street, verification_status, description, profile_photo, cover_photo FROM restaurants WHERE identity_code = '${rid}';
      `)
    await rclient.query('COMMIT');

    if (restaurantData.rowCount === 0) {
      throw new Error("restaurant data fetch failed");
    }
    return { success: true, payload: restaurantData.rows[0] }
  } catch (error: any) {
    console.log(error.message);
    await rclient.query('ROLLBACK')
    return { success: false, payload: '' }
  }
}