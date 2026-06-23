# 🧪 Atlas-360: A Beginner's Guide to Testing

Welcome! If you've never run automated tests before, don't worry. This guide will walk you through exactly how to test the Atlas-360 app step-by-step.

Automated tests are essentially scripts that click around the app and check the math behind the scenes to make sure everything works perfectly before we launch.

---

## 🛑 Step 1: Keep Your Passwords Safe

We never want to accidentally upload our real passwords to the internet. To keep things safe, we use a hidden file just for testing.

1. In the main folder of the project, create a new file and name it exactly **`.env.test`**.
2. Because of its name, our system knows to keep this file a secret (it won't be pushed to GitHub).
3. Copy all the text from your normal `.env.local` or `.env` file and paste it into `.env.test`.
4. At the very bottom of `.env.test`, add these four lines:

```env
TEST_USER_EMAIL="your_test_user@example.com"
TEST_USER_PASSWORD="your_secure_password"

TEST_GUIDE_EMAIL="your_guide_account@example.com"
TEST_GUIDE_PASSWORD="your_secure_password"
```

*(Leave those exact lines in there for now. We will replace them in Step 2.)*

---

## 👤 Step 2: Create Your Test Accounts

Our tests are going to open a real browser and try to log in. That means they need real accounts to use!

1. Start the app normally (`npm run dev`) and open `http://localhost:3000` in your browser.
2. **Create a Normal User:** Sign up for a brand new account. Once you finish, copy the email and password you used and paste them into the `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` lines in your `.env.test` file.
3. **Create a Guide User:** Sign up for a *second* account, but this time check the box that says "I want to list my services as a local Tour Guide". Copy this email and password into the `TEST_GUIDE_EMAIL` and `TEST_GUIDE_PASSWORD` lines.

You're done setting up! 

---

## 🚀 Step 3: Run the Tests

There are two types of tests you can run. You run these by typing commands into your terminal.

### 1. The Fast Tests (Unit & Integration)
These tests happen behind the scenes in milliseconds. They check math (like calculating booking prices) and database connections.

To run them, open your terminal and type:
```bash
npm run test
```

### 2. The Browser Tests (End-to-End or "E2E")
These tests literally open up a Google Chrome window, click buttons, type in forms, and make sure the actual website looks and acts correctly. 

**Important:** The website *must* be running for these to work.
1. In one terminal window, start the app: `npm run dev`
2. Open a *second* terminal window and type:
```bash
npm run test:e2e
```
Sit back and watch the browser magically click through the app!

---

## ❓ FAQ & Troubleshooting

**Why did some tests say "Skipped"?**
Sometimes a test will skip itself instead of failing. This is normal! 
- If the **Guide Dashboard** test skips, it just means you forgot to put your Guide email/password in the `.env.test` file.
- If the **Signup** test skips, it's because Supabase (our database) caught us making too many fake accounts too fast and temporarily blocked the emails to prevent spam. The test is smart enough to skip gracefully when this happens.
