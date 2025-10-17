# Subscription Card Height Tests

## Overview
This test suite verifies that subscription cards maintain consistent height regardless of their content (with or without billing cycle information).

## Prerequisites
1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install chromium`

## Running the Tests

### Run all tests
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run specific test file
```bash
npx playwright test tests/subscription-card-height.spec.ts
```

## Test Coverage

### 1. All cards have the same height
Verifies that all subscription cards on the page have identical heights.

### 2. Height remains consistent after adding monthly billing
Tests that adding a monthly billing cycle and next payment date to a subscription doesn't increase the card height.

### 3. Cards have a square aspect ratio (1:1)
Verifies that cards are approximately square with a 1:1 width-to-height ratio (with 10% tolerance).

### 4. Cards with billing cycle badge are not taller
Tests that newly created subscriptions with billing cycle information have the same height as existing cards.

## Implementation Details

The card height consistency is achieved through:
- Using `aspect-square` Tailwind class to enforce 1:1 aspect ratio
- The CSS Grid layout ensures all cards in a row have the same dimensions
- All cards use `data-testid="subscription-card"` for easy testing

## Troubleshooting

If tests fail:
1. Ensure the dev server is running properly
2. Check that the database has at least 2 subscriptions for comparison
3. Verify that the browser window size is consistent
4. Look at test screenshots in `test-results/` directory for visual debugging
