const request = require("supertest");
const { app, Administrator, User } = require("../main");
const bcrypt = require("bcrypt");

describe("Authentication Tests", () => {
  beforeEach(async () => {
    // Clear both tables before each test
    await Administrator.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe("Admin Authentication", () => {
    test("should authenticate admin with valid credentials", async () => {
      // Create a mock admin in the database
      const mockAdmin = {
        username: "testadmin",
        email: "admin@test.com",
        password_hash: await bcrypt.hash("adminpass", 10),
        security_question: "Test question",
        security_answer_hash: await bcrypt.hash("answer", 10),
      };
      await Administrator.create(mockAdmin);

      const response = await request(app)
        .post("/api/login/admin")
        .send({ username: "testadmin", password: "adminpass" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        token: expect.any(String),
        username: "testadmin",
        email: "admin@test.com",
        type: "administrator",
      });
    });

    test("should reject admin with invalid password", async () => {
      const mockAdmin = {
        username: "testadmin",
        email: "admin@test.com",
        password_hash: await bcrypt.hash("adminpass", 10),
        security_question: "Test question",
        security_answer_hash: await bcrypt.hash("answer", 10),
      };
      await Administrator.create(mockAdmin);

      const response = await request(app)
        .post("/api/login/admin")
        .send({ username: "testadmin", password: "wrongpass" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid password");
    });
  });

  describe("Password Change", () => {
    test("should allow password change with correct current password", async () => {
      const mockAdmin = {
        username: "testadmin",
        email: "admin@test.com",
        password_hash: await bcrypt.hash("oldpass", 10),
        security_question: "Test question",
        security_answer_hash: await bcrypt.hash("answer", 10),
      };
      await Administrator.create(mockAdmin);

      // First login
      const loginResponse = await request(app)
        .post("/api/login/admin")
        .send({ username: "testadmin", password: "oldpass" });

      const token = loginResponse.body.token;

      // Change password
      const changeResponse = await request(app)
        .post("/api/admin/changepassword")
        .set("Authorization", `Bearer ${token}`)
        .send({
          current_password: "oldpass",
          new_password: "newpass"
        });

      expect(changeResponse.status).toBe(200);

      // Verify new password works
      const newLoginResponse = await request(app)
        .post("/api/login/admin")
        .send({ username: "testadmin", password: "newpass" });

      expect(newLoginResponse.status).toBe(200);
    });

    test("should reject password change with incorrect current password", async () => {
      const mockAdmin = {
        username: "testadmin",
        email: "admin@test.com",
        password_hash: await bcrypt.hash("oldpass", 10),
        security_question: "Test question",
        security_answer_hash: await bcrypt.hash("answer", 10),
      };
      await Administrator.create(mockAdmin);

      const loginResponse = await request(app)
        .post("/api/login/admin")
        .send({ username: "testadmin", password: "oldpass" });

      const token = loginResponse.body.token;

      const changeResponse = await request(app)
        .post("/api/admin/changepassword")
        .set("Authorization", `Bearer ${token}`)
        .send({
          current_password: "wrongpass",
          new_password: "newpass"
        });

      expect(changeResponse.status).toBe(400);
      expect(changeResponse.body.error).toBe("Incorrect current_password");
    });
  });
});