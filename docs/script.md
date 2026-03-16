Here's your full demo script, timed to fit comfortably within 4 minutes:

---

# 🎬 InstaGoods — Demo Script (~4 minutes)

---

## 🎙️ INTRO [0:00 – 0:20]

> *Start on the homepage*

"Meet **InstaGoods** — a location-aware marketplace that connects everyday customers with local suppliers offering physical goods, groceries, services, and freelance work.
Let's walk through it."

---

## 📦 CHAPTER 1 — Customer Experience [0:20 – 1:30]

> *On the homepage (`/`)*

"When a customer lands on InstaGoods, they see a **live marketplace** — products pulled directly from the database, 

users can filter by what's actually available in their area.

At the top we have a **category navigation** — Physical Goods, Groceries, Services, and Freelance(!) — and a **Shop by Business** view to browse by supplier."

> *Click a category, e.g. Groceries*

Only items that can actually be delivered to you show up — no dead listings."

> *Click on a product to open the detail page*

"Each product page shows the price, description, delivery fee, supplier badge, and stock availability. Let's add this to cart."

> *Add to cart, then navigate to `/cart`*

"The cart updates in real time. We can review items, quantities, and the total before checking out."

> *Briefly show the wishlist icon or `/wishlist`*

"Customers can also save items to a **wishlist** for later."

> *Show the search bar — type something*

"And a **global search** lets you find products or services across all categories instantly."

---

## 👤 CHAPTER 2 — Customer Portal & AI Agent [1:30 – 2:45]

> *Click "Customer Portal" → sign in or show the dashboard at `/customer/dashboard`*

"Once logged in, the **Customer Portal** gives shoppers a personal hub — their order history, profile details, and account settings all in one place."

> *Navigate to `/customer/orders`*

"Past orders are tracked here with status updates — so customers always know where their purchase stands."

> *Navigate back to homepage, then open the AI Chat Widget (bot icon, bottom corner)*

"Now, the highlight — our **AI Shopping Assistant**, powered by a Gemini-based agent running on a **Huawei Cloud ECS instance** in Singapore, proxied securely through Vercel.

Let me ask it something."

> *Type: "What groceries are available near me?"*

"The agent searches the live marketplace and responds with real products, prices, and suppliers — not static answers."

> *Type: "Tell me more about x"*

"It maintains **conversation context**, so follow-up questions work naturally. It can browse categories, filter by price, check stock, and even read your cart and wishlist if you're logged in."

> *Show mic button*

"It also supports **voice input** — tap the mic, speak your request, and it transcribes and responds. You can even toggle **text-to-speech** to have the agent read responses aloud."

---

## 🏪 CHAPTER 3 — Supplier Portal [2:45 – 3:50]

> *Navigate to `/auth` — log in as a supplier*

"On the other side of InstaGoods is the **Supplier Portal** — a full business management dashboard."

> *Land on `/supplier/dashboard`*

"The **dashboard** gives suppliers a live overview — total revenue, active orders, product count, and an area chart of income over time. All pulled from their real transaction data."

> *Navigate to `/supplier/products`*

"In **Products**, suppliers manage their entire catalogue. Let me add a new product."

> *Click Add Product — fill in name, price, category, delivery radius*

"They set the product name, price, category, stock quantity, and — crucially — **delivery coverage**: a custom radius, available everywhere, or collection only. This is what drives the location filtering customers see."

> *Navigate to `/supplier/orders`*

"**Orders** shows every incoming purchase with customer details, status, and timestamps. Suppliers update order status right from here."

> *Navigate to `/supplier/incomes` or `/supplier/expenses`*

"There's also built-in **financial tracking** — income and expenses logged separately, giving suppliers a clear picture of their profitability."

> *Navigate to `/supplier/optimize`*

"And this is our **Optimization Tool** — suppliers enter their products and a budget, and it uses a linear programming algorithm to recommend the product mix that **maximizes profit**. This is especially useful for stock purchasing decisions."

> *Navigate to `/supplier/shop-settings`*

"Finally, **Shop Settings** lets suppliers customize their storefront — upload a logo, add a business description, and set their profile."

---

## 🏁 OUTRO [3:50 – 4:00]

> *Back to the homepage*

"InstaGoods — a full-stack marketplace with real-time location filtering, an AI shopping assistant on Huawei Cloud, and a complete supplier business portal. Thank you."

---

## ⏱️ Timing Summary

| Chapter | Section | Time |
|---|---|---|
| Intro | Overview | 0:00 – 0:20 |
| 1 | Customer Experience | 0:20 – 1:30 |
| 2 | Customer Portal & AI Agent | 1:30 – 2:45 |
| 3 | Supplier Portal | 2:45 – 3:50 |
| Outro | Close | 3:50 – 4:00 |

---

## 💡 Tips Before Recording

- **Pre-login** both a customer and supplier account in separate browser profiles so you're not typing passwords on screen
- Have a product already in the cart and wishlist before recording chapter 1 to save time
- Make sure the AI agent is running and warm before you hit record — send a test message first
- Use a **1080p window** and hide browser bookmarks bar for a cleaner look