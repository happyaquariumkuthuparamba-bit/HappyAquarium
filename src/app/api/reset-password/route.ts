import { getDb } from "@/db";
import * as s from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const newHash = "pbkdf2$1000$R1CxYWh/pkmLy15HsbOKyA==$BbGM2pmLJTyfiWjERQaxi9+qvkJQUpzTigJsst3iteM=";
    
    await db.update(s.users)
      .set({ passwordHash: newHash })
      .where(eq(s.users.role, "admin"));
      
    return NextResponse.json({ success: true, message: "Admin password reset successfully." });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
