# Requirements Document

## Introduction

Auth Integration adds Clerk-based authentication to the AnnounceKit product site with fully custom UI. The integration connects Clerk user identity to the existing Stripe billing infrastructure, enabling user-aware subscription management. Sign Up and Sign In pages use custom Tailwind-styled forms (not Clerk's pre-built components) matching the site's existing design system (blue #2563EB primary, Inter font, slate grays). The Navigation component is updated to reflect authentication state, the Settings page is upgraded from a placeholder to a real account dashboard, and protected route middleware gates access where appropriate.

## Glossary

- **Site**: The AnnounceKit Next.js App Router product website at `site/`
- **Clerk_Provider**: The `<ClerkProvider>` context wrapper from `@clerk/nextjs` that provides authentication state to all components
- **Auth_Middleware**: The Clerk middleware (`clerkMiddleware`) configured in `site/middleware.ts` that enforces route protection rules
- **Sign_Up_Page**: The custom-built registration page at `/sign-up` using Clerk's `useSignUp()` hook with Tailwind-styled form components
- **Sign_In_Page**: The custom-built login page at `/sign-in` using Clerk's `useSignIn()` hook with Tailwind-styled form components
- **Navigation**: The persistent site-wide navigation component at `site/components/Navigation.tsx`
- **Settings_Page**: The account dashboard page at `/settings` displaying user info, subscription status, and management controls
- **Analysis_Tool**: The interactive accessibility analysis tool at `/tool`
- **Pricing_Page**: The page at `/pricing` displaying subscription tiers
- **Clerk_Metadata**: The `user.publicMetadata` object on a Clerk user record, used to store Stripe-related data
- **Stripe_Webhook_Handler**: The API route at `/api/webhooks/stripe` that processes Stripe events
- **Checkout_Route**: The API route at `/api/checkout` that creates Stripe Checkout Sessions
- **Portal_Route**: The API route at `/api/portal` that creates Stripe Customer Portal sessions
- **Email_Verification_Flow**: The Clerk-managed process where a user receives a verification code via email during sign-up and must enter it to complete registration
- **Stitch**: The design tool (project ID: 6816746516377145281) used to generate page designs before implementation

## Requirements

### Requirement 1: Clerk Provider and Middleware Setup

**User Story:** As a developer, I want Clerk integrated into the Next.js application shell, so that authentication state is available throughout the site and protected routes are enforced.

#### Acceptance Criteria

1. THE Site SHALL include `@clerk/nextjs` as a dependency and wrap the root layout in a Clerk_Provider component
2. THE Clerk_Provider SHALL be configured with the application's Clerk publishable key via the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variable
3. THE Auth_Middleware SHALL be defined in `site/middleware.ts` using Clerk's `clerkMiddleware` function
4. THE Auth_Middleware SHALL protect the `/settings` route, requiring an authenticated session before granting access
5. WHEN an unauthenticated user requests the `/settings` route, THE Auth_Middleware SHALL redirect the user to the Sign_In_Page
6. THE Auth_Middleware SHALL allow unauthenticated access to all other routes including `/`, `/pricing`, `/docs`, `/tool`, `/sign-up`, and `/sign-in`
7. THE Auth_Middleware SHALL configure the sign-in redirect path as `/sign-in` and the sign-up redirect path as `/sign-up`

### Requirement 2: Custom Sign Up Page

**User Story:** As a new user, I want to create an account using a registration form that matches the site design, so that I have a consistent visual experience.

#### Acceptance Criteria

1. THE Sign_Up_Page SHALL be accessible at the `/sign-up` route
2. THE Sign_Up_Page SHALL render a form with three labeled input fields: email address, password, and confirm password
3. THE Sign_Up_Page SHALL use Clerk's `useSignUp()` hook to manage the registration flow without using any Clerk pre-built UI components
4. THE Sign_Up_Page SHALL style all form elements using Tailwind CSS with the site's design tokens: blue #2563EB primary color, Inter font, and slate gray palette
5. WHEN a user submits the sign-up form with valid credentials, THE Sign_Up_Page SHALL initiate the Email_Verification_Flow by sending a verification code to the provided email address
6. WHEN the Email_Verification_Flow is initiated, THE Sign_Up_Page SHALL display a verification code input field where the user enters the code received via email
7. WHEN a user submits a valid verification code, THE Sign_Up_Page SHALL complete the registration, create an active session, and redirect the user to the Analysis_Tool page
8. IF the email address is already registered, THEN THE Sign_Up_Page SHALL display an error message indicating the email is already in use
9. IF the password and confirm password fields do not match, THEN THE Sign_Up_Page SHALL display an error message indicating the passwords do not match
10. IF the password does not meet Clerk's strength requirements, THEN THE Sign_Up_Page SHALL display an error message describing the password requirements
11. IF the verification code is invalid or expired, THEN THE Sign_Up_Page SHALL display an error message and allow the user to request a new code
12. THE Sign_Up_Page SHALL include a link to the Sign_In_Page with the text "Already have an account? Sign in"

### Requirement 3: Custom Sign In Page

**User Story:** As a returning user, I want to sign in using a login form that matches the site design, so that I can access my account.

#### Acceptance Criteria

1. THE Sign_In_Page SHALL be accessible at the `/sign-in` route
2. THE Sign_In_Page SHALL render a form with two labeled input fields: email address and password
3. THE Sign_In_Page SHALL use Clerk's `useSignIn()` hook to manage the authentication flow without using any Clerk pre-built UI components
4. THE Sign_In_Page SHALL style all form elements using Tailwind CSS with the site's design tokens: blue #2563EB primary color, Inter font, and slate gray palette
5. WHEN a user submits the sign-in form with valid credentials, THE Sign_In_Page SHALL create an active session and redirect the user to the Analysis_Tool page
6. IF the email address is not registered, THEN THE Sign_In_Page SHALL display an error message indicating the credentials are invalid
7. IF the password is incorrect, THEN THE Sign_In_Page SHALL display a generic error message indicating the credentials are invalid, without revealing whether the email exists
8. THE Sign_In_Page SHALL include a "Forgot password?" link that initiates Clerk's password reset flow
9. THE Sign_In_Page SHALL include a link to the Sign_Up_Page with the text "Don't have an account? Sign up"

### Requirement 4: Navigation Authentication State

**User Story:** As a user, I want the navigation to reflect whether I am signed in, so that I can access account actions or sign up.

#### Acceptance Criteria

1. WHILE the user is unauthenticated, THE Navigation SHALL display a "Log In" link pointing to the Sign_In_Page and a "Sign Up" link pointing to the Sign_Up_Page
2. WHILE the user is authenticated, THE Navigation SHALL display the user's name and avatar image retrieved from Clerk, and a "Sign Out" button
3. WHEN the user activates the "Sign Out" button, THE Navigation SHALL sign the user out via Clerk and redirect to the Landing Page
4. WHILE the user is unauthenticated, THE Navigation "Get Started" button SHALL link to the Sign_Up_Page
5. WHILE the user is authenticated, THE Navigation "Get Started" button SHALL link to the Analysis_Tool page
6. THE Navigation SHALL use Clerk's `useUser()` and `useAuth()` hooks to determine authentication state without additional API calls
7. WHILE Clerk is loading the authentication state, THE Navigation SHALL display a non-interactive placeholder in place of the auth controls to prevent layout shift

### Requirement 5: Protected Routes and Conditional Redirects

**User Story:** As a product owner, I want certain pages gated behind authentication and pricing CTAs to guide unauthenticated users to sign up, so that the conversion funnel works correctly.

#### Acceptance Criteria

1. THE Auth_Middleware SHALL require authentication for the `/settings` route
2. THE Analysis_Tool at `/tool` SHALL remain accessible to both authenticated and unauthenticated users
3. WHILE the user is unauthenticated, THE Pricing_Page Pro tier CTA button SHALL link to the Sign_Up_Page instead of the Checkout_Route
4. WHILE the user is unauthenticated, THE Pricing_Page Team/Enterprise tier CTA button SHALL link to the Sign_Up_Page instead of the contact sales destination
5. WHILE the user is authenticated, THE Pricing_Page Pro tier CTA button SHALL initiate the Stripe Checkout flow via the Checkout_Route
6. WHILE the user is authenticated, THE Pricing_Page Team/Enterprise tier CTA button SHALL link to the contact sales destination

### Requirement 6: Stripe and Clerk Account Linking

**User Story:** As a subscribing user, I want my Stripe subscription linked to my Clerk account, so that the site knows my current plan.

#### Acceptance Criteria

1. WHEN the Checkout_Route creates a Stripe Checkout Session, THE Checkout_Route SHALL include the authenticated Clerk user ID as the `client_reference_id` field on the session
2. WHEN the Stripe_Webhook_Handler receives a `checkout.session.completed` event, THE Stripe_Webhook_Handler SHALL extract the `client_reference_id` (Clerk user ID) and the `customer` (Stripe customer ID) from the session object
3. WHEN the Stripe_Webhook_Handler processes a `checkout.session.completed` event with a valid Clerk user ID, THE Stripe_Webhook_Handler SHALL store the Stripe customer ID in the Clerk user's `publicMetadata.stripeCustomerId` field using the Clerk Backend API
4. WHEN the Stripe_Webhook_Handler receives a `customer.subscription.updated` event, THE Stripe_Webhook_Handler SHALL update the Clerk user's `publicMetadata.subscriptionStatus` field with the current subscription status
5. WHEN the Stripe_Webhook_Handler receives a `customer.subscription.deleted` event, THE Stripe_Webhook_Handler SHALL set the Clerk user's `publicMetadata.subscriptionStatus` field to "canceled" and remove the `publicMetadata.subscriptionTier` field
6. IF the Stripe_Webhook_Handler receives a `checkout.session.completed` event without a `client_reference_id`, THEN THE Stripe_Webhook_Handler SHALL log a warning and acknowledge the event without updating Clerk metadata
7. THE Checkout_Route SHALL authenticate the request using Clerk's `auth()` helper and reject unauthenticated requests with a 401 status code

### Requirement 7: Settings Page Upgrade

**User Story:** As an authenticated user, I want the Settings page to show my account information and subscription status, so that I can manage my account.

#### Acceptance Criteria

1. THE Settings_Page SHALL display the authenticated user's email address and full name retrieved from Clerk
2. THE Settings_Page SHALL display the user's current plan as "Free", "Pro", or "Enterprise" by reading the `publicMetadata.subscriptionTier` field from the Clerk user object
3. WHEN the `publicMetadata.subscriptionTier` field is absent or empty, THE Settings_Page SHALL display "Free" as the current plan
4. WHILE the user has a `publicMetadata.stripeCustomerId` value and an active subscription, THE Settings_Page SHALL render an enabled "Manage Subscription" button
5. WHEN the user activates the "Manage Subscription" button, THE Settings_Page SHALL call the Portal_Route with the user's Stripe customer ID and redirect the user to the Stripe Customer Portal
6. WHILE the user does not have an active paid subscription, THE Settings_Page SHALL render the "Manage Subscription" button in a disabled state with a tooltip or helper text indicating "Available for paid plans"
7. THE Settings_Page SHALL render a "Sign Out" button that signs the user out via Clerk and redirects to the Landing Page
8. THE Settings_Page SHALL display the Account section and Subscription section as labeled regions with appropriate headings

### Requirement 8: Auth Form Accessibility

**User Story:** As a user who relies on assistive technology, I want the authentication forms to be fully accessible, so that I can sign up and sign in without barriers.

#### Acceptance Criteria

1. THE Sign_Up_Page and Sign_In_Page SHALL associate every input field with a visible `<label>` element using matching `for` and `id` attributes
2. WHEN a validation error occurs on a form field, THE form SHALL display the error message in a container linked to the input via `aria-describedby` and set `aria-invalid="true"` on the input
3. WHEN a validation error occurs on form submission, THE form SHALL move keyboard focus to the first input field that has an error
4. THE Sign_Up_Page and Sign_In_Page SHALL be fully operable using keyboard alone, with a logical tab order through all interactive elements
5. THE Sign_Up_Page and Sign_In_Page SHALL use `<form>` elements with appropriate `role` and submit handling, allowing submission via the Enter key
6. WHEN the Email_Verification_Flow is displayed, THE Sign_Up_Page SHALL move keyboard focus to the verification code input field
7. THE Sign_Up_Page and Sign_In_Page SHALL maintain a minimum color contrast ratio of 4.5:1 for all text and 3:1 for all interactive element borders against their backgrounds

### Requirement 9: Stitch Design Integration

**User Story:** As a designer, I want the Sign Up and Sign In pages designed in Stitch before implementation, so that the auth experience matches the existing site theme.

#### Acceptance Criteria

1. THE Sign_Up_Page design SHALL be created in Stitch (project ID: 6816746516377145281) before implementation begins
2. THE Sign_In_Page design SHALL be created in Stitch (project ID: 6816746516377145281) before implementation begins
3. THE Stitch designs SHALL use the site's existing design tokens: blue #2563EB primary, Inter font family, slate gray color palette, and Tailwind CSS utility classes
4. THE implemented Sign_Up_Page and Sign_In_Page React components SHALL visually match the approved Stitch designs
