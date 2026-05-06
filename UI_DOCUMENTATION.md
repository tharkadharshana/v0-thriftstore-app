# DuDu Marketplace UI Documentation

## 1. App Root Structure

### Root layout
- `app/layout.tsx` wraps the app with:
  - `ThemeProvider` for dark/light theming
  - `QueryProvider` for global query state
  - `AuthProvider` for Supabase auth and profile state
  - `LanguageProvider` for translations and language switching
  - `Toaster` for toast notifications
- Page entrypoint: `app/page.tsx` calls `ensureCategoriesSeeded()` and renders `AppShellWrapper`.
- `AppShellWrapper` imports `AppShell` dynamically with SSR disabled.

### AppShell
- `components/app-shell.tsx` renders the active screen based on `useAppStore().currentScreen`.
- Screens rendered:
  - `home` → `HomeFeed`
  - `listing` → `ListingDetail`
  - `sell` → `CreateListing`
  - `categories` → `CategoriesScreen`
  - `search` → `SearchScreen`
  - `saved` → `SavedScreen`
  - `profile` → `ProfileScreen`
  - `my-listings` → `MyListingsScreen`
  - `notifications` → `NotificationsScreen`
  - `chat` → `ChatScreen`
- Always renders `BottomNav` except on `listing` and `search` screens.
- Shows `AuthModal` when `showAuthModal` is true.

## 2. App State and Navigation

### Global app state (`lib/store.ts`)
State fields:
- `currentScreen`: current view
- `previousScreen`: previous screen for back navigation
- `selectedListingId`: listing id for `ListingDetail`
- `chatListingId` and `chatUserId`: reserved for chat state
- `searchQuery`: current search term
- `activeCategory`: selected category filter
- `activeFilter`: advanced filter state
- `showAuthModal`: whether auth modal is open
- `authModalMode`: `signin` or `signup`

Actions:
- `navigate(screen, listingId?)`: switch screen and optionally set selected listing
- `goBack()`: return to previous screen or `home`
- `setSearchQuery(query)`
- `setActiveCategory(category)`
- `setActiveFilter(filter)`
- `openChat(listingId, userId)`
- `openAuthModal(mode)`
- `closeAuthModal()`

### Bottom navigation (`components/bottom-nav.tsx`)
- Buttons:
  - Home → `home`
  - Categories → `categories`
  - Sell → `sell`
  - Saved → `saved`
  - Profile → `profile`
- `Plus` button is special (main action) and navigates to `sell`.

## 3. Authentication

### Auth provider (`components/providers/auth-provider.tsx`)
- Uses Supabase browser client from `lib/supabase/client.ts`.
- Fetches current user on mount.
- Loads profile from `profiles` table when authenticated.
- Subscribes to `supabase.auth.onAuthStateChange`.
- Exposes:
  - `user`
  - `profile`
  - `isLoading`
  - `signIn(email, password)`
  - `signUp(email, password, username)`
  - `signOut()`
  - `refreshProfile()`

### Auth modal (`components/auth-modal.tsx`)
- Modes: sign-in and sign-up.
- Sign-up creates Supabase auth user and sends email confirmation.
- Sign-in authenticates and closes modal.
- On success, `AuthModal` either closes or switches to sign-in after registration.

## 4. Screen Flows and UI Actions

### HomeFeed (`components/home-feed.tsx`)
Primary UI:
- Category pill buttons
- Buy Now / Auction / All filter buttons
- Filter sheet for sort, price range, and condition
- Listing grid with `ListingCard`

Logic:
- Fetches active listings from `listings` where `is_active=true` and `is_sold=false`.
- Applies filters:
  - category
  - listing type: `buy_now` or `auction`
  - condition
  - price range
- Sort options:
  - `newest`
  - `price_low`
  - `price_high`
  - `ending_soon`
- Marks boosted listings first using `is_boosted`.
- Loads categories from `categories` table.
- Checks saved status for logged-in users by reading `saved_listings`.

Navigation:
- Category pill click sets `activeCategory` and refreshes listings.
- Filter controls update local state and re-fetch listings.

### ListingDetail (`components/listing-detail.tsx`)
Primary UI:
- Image carousel
- Title, price, seller, category, location, condition, description
- Action buttons: Back, Save, Share, Chat, Bid
- Bid dialog and message dialog

Logic:
- Fetches listing by `selectedListingId` and joins `seller` and `category`.
- Increments `views` on each load.
- Saves / unsaves listing via `saved_listings`.
- Bidding:
  - Requires auth
  - Validates bid amount against current bid or base price
  - Inserts a `bids` row
  - Updates listing `current_bid` and `bid_count`
  - Creates a `notifications` row for seller
- Messaging:
  - Requires auth
  - Inserts into `messages`
  - Creates a `notifications` row for seller
- Share button uses Web Share API or clipboard fallback.

### CreateListing (`components/create-listing.tsx`)
Primary UI:
- Photo uploader
- Title, category, description, condition, price, listing type, location
- Auction duration dropdown
- Boost toggle and package selector
- Create Listing button

Logic:
- Loads categories and defaults from `lib/categories.ts` if table missing.
- If user is unauthenticated, opens sign-in modal.
- Image upload stores base64 data URLs in component state.
- AI description button fills description with generated text.
- Create listing:
  - Inserts into `listings`
  - Sets `is_auction`, `auction_end_time`, `current_bid` for auctions
  - Sets boost fields if enabled
  - Deducts coins from profile and writes `coin_transactions` if boost is used

### CategoriesScreen (`components/categories-screen.tsx`)
Primary UI:
- Category cards with icon, color, name, and active listing count

Logic:
- Loads categories and listing counts per category.
- On category selection, sets `activeCategory` and navigates to `home`.

### SearchScreen (`components/search-screen.tsx`)
Primary UI:
- Search bar with clear button
- Trending suggestions
- Recent searches
- Search result grid

Logic:
- Searches `listings` by title or description with `ilike`.
- Saves recent searches in `localStorage`.
- Clicking trending or recent search runs query.
- Clicking a category pill navigates to filtered home feed.

### SavedScreen (`components/saved-screen.tsx`)
Primary UI:
- Saved listing grid
- Empty state with sign-in prompt if unauthenticated

Logic:
- Fetches `saved_listings` for current user and joins listing data.
- If not signed in, prompts auth modal.

### ProfileScreen (`components/profile-screen.tsx`)
Primary UI:
- Profile card with avatar, name, rating, verified badge
- Coins balance and Get More button
- Stats for active listings, views, saved items
- Menu shortcuts for My Listings, Watchlist, Notifications, Messages
- Settings sheet with theme, language, help, and sign out
- Edit profile dialog
- Coins purchase dialog

Logic:
- Fetches user stats from `listings` and `saved_listings`.
- Profile edit updates `profiles` row.
- Purchase coins simulates credit and writes `coin_transactions`.
- Sign out resets auth and returns to home.

### NotificationsScreen (`components/notifications-screen.tsx`)
Primary UI:
- List of notifications
- Mark all read button

Logic:
- Reads `notifications` for user.
- Clicking notification marks it read and navigates to listing if linked.
- Notification types: `bid`, `message`, `sale`, `boost_expired`, `price_drop`, `system`.

### ChatScreen (`components/chat-screen.tsx`)
Primary UI:
- Conversation list grouped by listing + user
- Message preview and unread count

Logic:
- Queries `messages` involving current user.
- Builds conversation threads by `listing_id` + other user.
- Navigates to listing detail when tapped.

### MyListingsScreen (`components/my-listings-screen.tsx`)
Primary UI:
- User-created listing cards
- Buttons: View, Mark as Sold, Delete
- New listing button

Logic:
- Fetches listings where `user_id` equals current user.
- Supports deleting listings from `listings` table.
- Marks listing sold by updating `is_sold` and `is_active`.

## 5. Database Schema Summary

### `profiles`
- `id`: string (Supabase auth user UUID)
- `username`, `display_name`, `avatar_url`, `phone`, `location`
- `coins`: number
- `is_verified`: boolean
- `rating`: number
- `total_reviews`: number
- `created_at`, `updated_at`

### `categories`
- `id`: string
- `name`, `name_si`, `name_ta`
- `icon`: string
- `color`: string
- `listing_count`: number
- `created_at`

### `listings`
- `id`, `user_id`, `category_id`
- `title`, `description`
- `price`, `original_price`, `currency`
- `condition`: `new | like_new | good | fair`
- `location`
- `images`: `string[]`
- `is_auction`: boolean
- `auction_end_time`: string | null
- `current_bid`: number | null
- `bid_count`: number
- `is_boosted`: boolean
- `boost_level`: `basic | premium | ultra | null`
- `boost_expires_at`: string | null
- `views`: number
- `is_sold`: boolean
- `is_active`: boolean
- `created_at`, `updated_at`

### `saved_listings`
- `id`, `user_id`, `listing_id`, `created_at`

### `bids`
- `id`, `listing_id`, `user_id`, `amount`, `created_at`

### `coin_transactions`
- `id`, `user_id`, `amount`
- `type`: `purchase | boost | referral | reward | refund`
- `description`, `listing_id`, `created_at`

### `messages`
- `id`, `listing_id`, `sender_id`, `receiver_id`
- `content`, `is_read`, `created_at`

### `notifications`
- `id`, `user_id`
- `type`: `bid | message | sale | boost_expired | price_drop | system`
- `title`, `body`, `listing_id`, `is_read`, `created_at`

## 6. Key Data Flows

### Listing creation and boosting
- User submits `CreateListing` form.
- App writes a `listings` row.
- If boost selected:
  - Deduct `coins` from `profiles`
  - Create a `coin_transactions` row
  - Set `is_boosted`, `boost_level`, `boost_expires_at`

### Saving favorites
- Listing detail save button toggles `saved_listings`.
- SavedScreen reads joined saved listings for display.

### Bidding
- User places a bid from `ListingDetail`.
- App inserts `bids` and updates listing `current_bid` + `bid_count`.
- Creates a `notifications` row for seller.

### Messaging
- User sends chat from `ListingDetail`.
- App inserts `messages` and a `notifications` row for receiver.
- ChatScreen groups messages into conversations.

### Notifications
- Notifications are created when bids and messages happen.
- User can mark individual items read or use "Mark all read".
- Clicking a notification navigates to `ListingDetail`.

## 7. Screen Connection Map

- Bottom nav → `home`, `categories`, `sell`, `saved`, `profile`
- `CategoriesScreen` → `home` with category filter
- `SearchScreen` → `home` or listing detail via search result
- `ListingCard` / listing tap → `ListingDetail`
- `ListingDetail` chat/bid → `messages` / `bids` + `notifications`
- `ProfileScreen` menu → `my-listings`, `saved`, `notifications`, `chat`
- `MyListingsScreen` delete/mark sold → update `listings`
- `NotificationsScreen` → listing detail
- `AuthModal` appears from protected actions and sign-in flow

## 8. Helpful Notes

- `ensureCategoriesSeeded()` in `app/page.tsx` seeds default categories if `categories` table is empty.
- `HomeFeed` uses both `listings` and `categories` queries.
- `ProfileScreen` and `CreateListing` rely on authenticated `profile` and `user` state.
- `SearchScreen` uses `localStorage` for recent search terms.
- `BottomNav` is hidden on entry screens where a more focused experience is expected.

---

This document maps the UI elements to the underlying screen logic and database model for `v0-thriftstore-app`. Use it as a reference for feature changes or UI flow updates.