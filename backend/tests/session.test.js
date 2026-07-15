import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";


dotenv.config();


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


describe("Sessions API", () => {

  test("une deuxième session active du même groupe est refusée", async () => {

    // Création d'une première session du groupe GRP_G1 deja faite avant

    const secondResponse = await request(app)
      .post("/sessions")
      .send({
        groupe_id:"GRP_G1",
        duration_minutes:120
      });


    expect(secondResponse.status).toBe(409);


    expect(secondResponse.body.error)
      .toBe("Une session est déjà ouverte pour ce groupe.");

  });

}); 