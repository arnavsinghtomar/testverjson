/**
 * Roundhouse database schema.
 *
 * Ticketing for independent music venues: venues run events, events sell ticket
 * types, punters place orders, orders take payments.
 *
 * Money is stored in minor units (pence) as integers throughout — never floats.
 * The API converts at the boundary.
 */

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

/** Punters and venue staff. One row per person. */
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: text('display_name').notNull(),
    phone: text('phone'),
    /** The event shown on a user's public profile. */
    featuredEventId: text('featured_event_id').references((): AnyPgColumn => events.id),
    marketingOptIn: boolean('marketing_opt_in').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('users_email_uq').on(t.email)],
);

/** A physical room that puts on shows. */
export const venues = pgTable(
  'venues',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    city: text('city').notNull(),
    addressLine1: text('address_line1').notNull(),
    capacity: integer('capacity').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('venues_slug_uq').on(t.slug)],
);

/** A show at a venue. `doorPriceCents` is the walk-up price. */
export const events = pgTable(
  'events',
  {
    id: text('id').primaryKey(),
    venueId: text('venue_id').notNull().references((): AnyPgColumn => venues.id),
    /** Staff member who programmed the show. */
    curatorId: text('curator_id').references((): AnyPgColumn => users.id),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    startsAt: timestamp('starts_at').notNull(),
    doorPriceCents: integer('door_price_cents').notNull(),
    status: text('status').notNull(),
    ageRestriction: integer('age_restriction'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('events_slug_uq').on(t.slug)],
);

/** Advance, early-bird, guest list — one row per tier on an event. */
export const ticketTypes = pgTable('ticket_types', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references((): AnyPgColumn => events.id),
  name: text('name').notNull(),
  priceCents: integer('price_cents').notNull(),
  quantity: integer('quantity').notNull(),
  sold: integer('sold').notNull().default(0),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references((): AnyPgColumn => users.id),
  eventId: text('event_id').notNull().references((): AnyPgColumn => events.id),
  totalCents: integer('total_cents').notNull(),
  discountCents: integer('discount_cents').notNull().default(0),
  promoCodeId: text('promo_code_id').references((): AnyPgColumn => promoCodes.id),
  status: text('status').notNull(),
  reference: text('reference').notNull(),
  placedAt: timestamp('placed_at').notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references((): AnyPgColumn => orders.id),
  ticketTypeId: text('ticket_type_id').notNull().references((): AnyPgColumn => ticketTypes.id),
  quantity: integer('quantity').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
});

/** Card payments, taken through Stripe. Only the last four digits are kept. */
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references((): AnyPgColumn => orders.id),
  provider: text('provider').notNull(),
  providerRef: text('provider_ref'),
  amountCents: integer('amount_cents').notNull(),
  cardLast4: text('card_last4'),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/** Genre tags. `parentId` points at a broader tag, so they nest. */
export const tags = pgTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    parentId: text('parent_id').references((): AnyPgColumn => tags.id),
  },
  (t) => [uniqueIndex('tags_slug_uq').on(t.slug)],
);

/** Many-to-many between events and tags. Nothing but keys. */
export const eventTags = pgTable('event_tags', {
  eventId: text('event_id').notNull().references((): AnyPgColumn => events.id),
  tagId: text('tag_id').notNull().references((): AnyPgColumn => tags.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references((): AnyPgColumn => events.id),
  userId: text('user_id').notNull().references((): AnyPgColumn => users.id),
  rating: integer('rating').notNull(),
  body: text('body'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/** Sign-ups for sold-out shows. Email only — no account required. */
export const waitlist = pgTable('waitlist', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references((): AnyPgColumn => events.id),
  email: text('email').notNull(),
  notified: boolean('notified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/** Discount codes. A venue can run one per event, or a site-wide code. */
export const promoCodes = pgTable(
  'promo_codes',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull(),
    eventId: text('event_id').references((): AnyPgColumn => events.id),
    percentOff: integer('percent_off').notNull(),
    maxRedemptions: integer('max_redemptions'),
    redeemed: integer('redeemed').notNull().default(0),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('promo_codes_code_uq').on(t.code)],
);

/**
 * Append-only record of staff actions. Written by a nightly job that does not
 * live in this repo, so nothing here reads or writes it.
 */
export const auditLog = pgTable('audit_log', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').references((): AnyPgColumn => users.id),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
