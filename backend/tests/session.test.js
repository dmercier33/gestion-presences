import dotenv from "dotenv";

console.log("AVANT DOTENV URL =", process.env.SUPABASE_URL);

dotenv.config({
  path: process.env.NODE_ENV === "test"
    ? ".env.test"
    : ".env"
});

console.log("APRES DOTENV URL =", process.env.SUPABASE_URL);


import { beforeEach } from "vitest";
import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

beforeEach(async () => {

  await supabase
    .from("sessions")
    .delete()
    .eq("groupe_id", "GRP_G1");

});

describe("Sessions API", () => {

  test("une deuxième session active du même groupe est refusée", async () => {


    const firstResponse = await request(app)
      .post("/sessions")
      .send({
        groupe_id: "GRP_G1",
        duration_minutes: 120
      });


    expect(firstResponse.status).toBe(200);



    const secondResponse = await request(app)
      .post("/sessions")
      .send({
        groupe_id: "GRP_G1",
        duration_minutes: 120
      });


    expect(secondResponse.status).toBe(409);


  });


});