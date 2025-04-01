const request = require("supertest");
const { app } = require("../main");
const { Administrator } = require("../main");
const bcrypt = require("bcrypt");

describe("Admin Password Reset", () => {
  let adminToken;

  beforeAll(async () => {
    // Create a test admin
    await Administrator.create({
      username: "admin",
      email: "admin@example.com",
      password_hash: await bcrypt.hash("oldpass", 10),
      security_question: "What is your favorite color?",
      security_answer_hash: await bcrypt.hash("blue", 10),
    });

    // Login to get token
    const loginResponse = await request(app)
      .post("/api/login/admin")
      .send({ username: "admin", password: "oldpass" });

    adminToken = loginResponse.body.token;
    
  });

  test("should reset password with valid credentials", async () => {
    // // Create a test admin
    // await Administrator.create({
    //   username: "admin",
    //   email: "admin@example.com",
    //   password_hash: await bcrypt.hash("oldpass", 10),
    //   security_question: "What is your favorite color?",
    //   security_answer_hash: await bcrypt.hash("blue", 10),
    // });

    // // Login to get token
    // const loginResponse1 = await request(app)
    //   .post("/api/login/admin")
    //   .send({ username: "admin", password: "oldpass" });

    // adminToken = loginResponse1.body.token;

    const response = await request(app)
      .post("/api/admin/changepassword")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        current_password: "oldpass",
        new_password: "newpass",
      });

    expect(response.status).toBe(200);

    // Verify new password works
    const loginResponse = await request(app)
      .post("/api/login/admin")
      .send({ username: "admin", password: "newpass" });

    expect(loginResponse.status).toBe(200);
  });

  test("should reject reset with incorrect current password", async () => {
    const response = await request(app)
      .post("/api/admin/changepassword")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        current_password: "wrongpass",
        new_password: "newpass",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Incorrect current_password");
  });
});
