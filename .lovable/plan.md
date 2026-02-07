

# LolaDrop -- Comprehensive Feature Upgrade Plan

This plan covers all the requested improvements grouped into logical phases. Due to the large scope, this will be implemented in a structured manner across multiple files.

---

## Phase 1: Realtime Order Status + Delivery Partner Visibility for Users

**What it does:** Users will see live order status updates and delivery partner info (name, phone, WhatsApp link) once assigned.

**Changes:**
- **OrdersPage.tsx**: Add delivery partner info display (name, phone number, WhatsApp chat link) when a partner is assigned. Show real-time order status using Supabase Realtime subscriptions on the `orders` table.
- **useOrders.ts**: Add realtime subscription to auto-refresh order data when status changes. This leverages the already-enabled realtime publication on the `orders` table.
- **Database**: Add an RLS SELECT policy on `delivery_partners` so users can view their assigned delivery partner's info (phone, name) through order joins. Also add a profile-reading policy so delivery partner profiles (name, phone) are accessible in the context of an order.

---

## Phase 2: Minimum Order Amount + Delivery Charges

**What it does:** Enforces a minimum order of 300 rupees for non-kit items. Orders below 550 rupees will have a delivery charge applied.

**Changes:**
- **Checkout.tsx**: Add validation to block checkout if total is below 300 rupees. Show delivery charge calculation: free for orders 550+ rupees, a fixed charge (e.g., 30 rupees) for orders below 550.
- **Cart.tsx**: Display delivery charge info in the order summary section. Show a progress bar or message indicating how much more to add for free delivery.
- **useOrders.ts / useCreateOrder**: Include delivery charges in the total amount when creating the order.

---

## Phase 3: Delivery Partner Notifications + Order Details

**What it does:** When admin assigns an order to a delivery partner, the partner sees a notification with customer phone, items, address, and amount to collect.

**Changes:**
- **Database migration**: Create a `notifications` table with fields: `id`, `user_id`, `title`, `message`, `is_read`, `order_id`, `created_at`. Enable realtime on it.
- **RLS policies**: Users can read their own notifications.
- **DeliveryPartnerPortal.tsx**: Add notification bell icon showing unread count. Display notification list with order details (customer name, phone, items, address, amount). Show customer phone number and WhatsApp link on each order card.
- **Admin OrdersTab.tsx**: When assigning a delivery partner, automatically create a notification for that partner with order details.
- **useOrders.ts (useAssignDeliveryPartner)**: After assigning, insert a notification record.

---

## Phase 4: Full Order Details View (All Items Visible)

**What it does:** "View More" in orders shows complete item list with all details.

**Changes:**
- **OrdersPage.tsx**: Add an expandable/collapsible section per order showing ALL items with product name, quantity, unit price, and total. Currently items are shown but truncated -- ensure full list is always visible.
- **Admin OrdersTab.tsx (OrderDetails)**: Already shows full details -- verify it works correctly and includes customer profile info.

---

## Phase 5: Product Suggestions Based on Orders

**What it does:** After ordering, users see product suggestions similar to what they ordered (same category).

**Changes:**
- **OrdersPage.tsx**: Add a "You might also like" section at the bottom. Query products from the same categories as the user's recently ordered items, excluding items they already bought.
- **Create a new hook `useProductSuggestions.ts`**: Takes an array of product IDs/categories from past orders, returns related products.

---

## Phase 6: User Profile Page

**What it does:** Users can view and edit their account info -- name, email, phone number.

**Changes:**
- **Create `src/pages/ProfilePage.tsx`**: Display user email (read-only from auth), full name, phone number, and saved delivery address. Allow editing name, phone, and address with save functionality.
- **App.tsx**: Replace the ComingSoon route for `/profile` with the new ProfilePage component.
- **Database**: The `profiles` table already has `full_name`, `phone`, `address`, `delivery_address` fields with proper RLS policies.

---

## Phase 7: Admin Promotional Offers / Discount Banner

**What it does:** Admin can create promotional offers/banners that show on the homepage.

**Changes:**
- **Database migration**: Create a `promotions` table with: `id`, `title`, `description`, `discount_percentage`, `banner_image_url`, `is_active`, `start_date`, `end_date`, `created_at`. RLS: everyone can read active promotions, admins can manage.
- **Admin panel**: Add a "Promotions" tab for creating/editing/toggling promotional banners with discount info.
- **Index.tsx / HeroBanner.tsx**: Display active promotions as a carousel/banner section on the homepage showing current offers and discounts.

---

## Phase 8: MRP + Discount Display on Products

**What it does:** Products show MRP (original price), discount percentage, and the selling price clearly.

**Changes:**
- **ProductCard.tsx**: The MRP/discount display already exists but needs refinement -- show "MRP" label next to the strikethrough price and make the discount badge more prominent (green "SAVE X%" style).
- **Product detail areas** (Cart.tsx, OrdersPage.tsx, Checkout.tsx): Show original price with strikethrough alongside the selling price wherever products appear.

---

## Phase 9: About Us Page

**What it does:** Full About Us page with all provided content.

**Changes:**
- **Create `src/pages/AboutPage.tsx`**: Build a beautiful, well-structured page with:
  - Hero section with LolaDrop description
  - "What LolaDrop Offers" section split into "For Households" and "For Shopkeepers/Retailers"
  - "Our Vision" section
  - "Why We Built LolaDrop" section
  - "Our Promise" section (Fast, Reliable, Transparent, Community-focused)
- **App.tsx**: Replace the ComingSoon route for `/about` with the AboutPage.

---

## Phase 10: "Make Your Own Order" on Homepage

**What it does:** Rename "Custom Orders" to "Make Your Own Order" and add a CTA section on the homepage linking to it.

**Changes:**
- **Index.tsx**: Add a new section between products and the CTA section with a card/banner titled "Make Your Own Order" that links to the feedback/messages page (custom order tab).
- **FeedbackPage.tsx**: Update the tab label from "Custom Orders" to "Make Your Own Order".
- **Header.tsx**: Add "Make Your Own Order" link in the navigation.

---

## Phase 11: Flipkart-Inspired UI Enhancements

**What it does:** Add commonly seen e-commerce features inspired by Flipkart that are currently missing.

**Changes:**
- **Category navigation bar**: Add a horizontal scrollable category strip below the header on the homepage (like Flipkart's category bar). Clicking a category filters to that category's products page.
- **Search functionality**: Make the existing search bar in the header functional -- filter products by name as user types, show results in a dropdown.
- **Index.tsx**: Add a "Shop by Category" section with category icons/cards.

---

## Technical Details

### Database Migrations Required:
1. `notifications` table with RLS policies and realtime enabled
2. `promotions` table with RLS policies
3. RLS policy updates for `delivery_partners` and `profiles` to allow order-context reads

### New Files:
- `src/pages/ProfilePage.tsx`
- `src/pages/AboutPage.tsx`
- `src/hooks/useProductSuggestions.ts`
- `src/hooks/useNotifications.ts`
- `src/hooks/usePromotions.ts`
- `src/components/admin/PromotionsTab.tsx`
- `src/components/home/CategoryBar.tsx`
- `src/components/home/PromoBanner.tsx`
- `src/components/home/MakeYourOrder.tsx`

### Modified Files:
- `src/App.tsx` -- new routes for Profile, About
- `src/pages/Index.tsx` -- add category bar, promo banner, Make Your Own Order section, product suggestions
- `src/pages/OrdersPage.tsx` -- realtime updates, delivery partner info, full item details, suggestions
- `src/pages/Checkout.tsx` -- minimum order validation, delivery charges
- `src/pages/Cart.tsx` -- delivery charge display, free delivery progress
- `src/pages/DeliveryPartnerPortal.tsx` -- notifications, customer phone/WhatsApp
- `src/pages/FeedbackPage.tsx` -- rename Custom Orders tab
- `src/pages/Admin.tsx` -- add Promotions tab
- `src/components/layout/Header.tsx` -- functional search, "Make Your Own Order" link
- `src/components/products/ProductCard.tsx` -- enhanced MRP/discount display
- `src/hooks/useOrders.ts` -- realtime subscriptions, delivery charge logic, notification creation on partner assignment
- `src/components/admin/OrdersTab.tsx` -- create notification on partner assignment
- `src/lib/types.ts` -- add Notification and Promotion types

