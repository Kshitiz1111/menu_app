"use server"
import { db } from '@vercel/postgres';
import { z } from 'zod';
import { AdminLoginType } from '../validator';
import * as argon2 from "argon2";
import { cookies } from 'next/headers';
import { connectClientLocally } from '../database/localdb';

export const adminLogin = async ({ email, password }: { email: string, password: string }) => {
  //  const rClient = await db.connect();//r in client means reference to the restaurant database, not the main database

  const rClient = await connectClientLocally();
  try {
    await rClient.query("BEGIN");

    const IdenityCodeAndAdminId = await rClient.query(`
         SELECT identity_code, admin_id FROM restaurants WHERE email = '${email}'
      `)

    if (IdenityCodeAndAdminId.rowCount === 0) {
      throw new Error("email didn't match");
    }

    console.log("identityCode and admin_id: ", IdenityCodeAndAdminId.rows[0], IdenityCodeAndAdminId.rowCount);
    const { identity_code, admin_id } = IdenityCodeAndAdminId.rows[0];

    const pwd = await rClient.query(`
         SELECT password FROM ${identity_code}_employees WHERE id = ${admin_id}
      `)
    if (pwd.rowCount === 0) { throw new Error("something went wrong. wp"); }

    const passwordVerified = await argon2.verify(pwd.rows[0].password, password);
    if (!passwordVerified) {
      throw new Error("password incorrect.");
    }

    await rClient.query("COMMIT")
    return { success: true, restauranIdentityCode: identity_code, error: "" };
  } catch (error: any) {
    console.log(error)
    await rClient.query("ROLLBACK")
    return { success: false, restauranIdentityCode: null, error: error.message };
  }
}