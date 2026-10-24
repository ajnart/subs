# Subs

Subs tracks one person's recurring service commitments in a private collection shared across their devices.

## Language

**Installation**:
One privately operated instance of Subs containing one Collection.
_Avoid_: Tenant, workspace, account

**Collection**:
The Installation's complete set of Subscriptions and shared tracking preferences.
_Avoid_: Portfolio, household, user account

**Operator**:
The person who deploys and controls access to an Installation.
_Avoid_: Administrator account, owner account

**Subscription**:
A recorded recurring commitment to a Service, including its Price, Billing Cycle, and Lifecycle State.
_Avoid_: Payment, transaction, invoice

**Service**:
The product or provider a Subscription concerns; several Subscriptions may concern the same Service.
_Avoid_: Vendor account, merchant transaction

**Lifecycle State**:
A Subscription's active, paused, or cancelled condition. Paused and cancelled Subscriptions remain recorded but contribute no ongoing projected spending.
_Avoid_: Payment status, paid status

**Price**:
The amount and Currency charged once per Billing Cycle, rather than a normalized monthly estimate.
_Avoid_: Monthly price, balance

**Currency**:
The denomination of a Price or Budget, with its own minor-unit precision.
_Avoid_: Display symbol alone

**Billing Cycle**:
The daily, weekly, monthly, quarterly, or yearly recurrence of a Subscription's Price.
_Avoid_: Payment frequency, plan length

**Billing Anchor**:
The original calendar day and, for yearly cycles, month that determine recurrence after shorter months are clamped.
_Avoid_: Last displayed day, drifting renewal

**Due Date**:
A calendar date on which a tracked charge is expected, not evidence that a payment occurred.
_Avoid_: Payment timestamp, receipt date

**Trial Deadline**:
An optional calendar date identifying the end of a trial or the user's decision deadline; it does not itself change Lifecycle State.
_Avoid_: Automatic cancellation

**Monthly Equivalent**:
The projected monthly cost of an active Subscription, normalized from its Billing Cycle.
_Avoid_: Actual monthly spend, payment history

**Annual Equivalent**:
The projected yearly cost of an active Subscription, normalized from its Billing Cycle.
_Avoid_: Actual annual spend

**Category**:
A user-facing grouping of Subscriptions by purpose, with an Other fallback.
_Avoid_: Tag hierarchy

**Budget**:
A monthly spending target for the Collection in a chosen Currency, compared with the Monthly Equivalent.
_Avoid_: Spending limit, payment cap

**Savings Scenario**:
A temporary selection of active Subscriptions whose removal estimates reduced projected spending without changing the Collection.
_Avoid_: Executed cancellation, guaranteed savings

**Starter Template**:
An optional Service suggestion used to prefill a Subscription that the user reviews and explicitly saves.
_Avoid_: Demo subscription, automatically subscribed service

**Price Change**:
A recorded change to a Subscription's Price at a known date, not a historical payment record.
_Avoid_: Transaction history

**Import Preview**:
A review of proposed additions, replacements, skipped duplicates, and validation problems before an import changes the Collection.
_Avoid_: Automatic merge

**Backup**:
A portable export of the Collection's tracking data, excluding access credentials and live sessions.
_Avoid_: Authentication recovery file, full server snapshot
