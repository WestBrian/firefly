import {
  mutationGeneric,
  queryGeneric,
  type DataModelFromSchemaDefinition,
  type MutationBuilder,
  type QueryBuilder,
} from "convex/server";
import { v } from "convex/values";
import type schema from "./schema";

type DataModel = DataModelFromSchemaDefinition<typeof schema>;
const mutation: MutationBuilder<DataModel, "public"> = mutationGeneric;
const query: QueryBuilder<DataModel, "public"> = queryGeneric;

export const sendEmail = mutation({
  args: {
    options: v.object({
      apiKey: v.string(),
      testMode: v.boolean(),
      initialBackoffMs: v.number(),
      retryAttempts: v.number(),
    }),
    from: v.string(),
    to: v.array(v.string()),
    subject: v.string(),
    text: v.string(),
  },
  returns: v.id("emails"),
  handler: (ctx, { to, text }) => {
    if (to.length !== 1 || !to[0]) {
      throw new Error("Auth email must have exactly one recipient.");
    }
    return ctx.db.insert("emails", { to: to[0], text });
  },
});

export const latest = query({
  args: { to: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { to }) => {
    const email = await ctx.db
      .query("emails")
      .withIndex("by_to", (q) => q.eq("to", to))
      .order("desc")
      .first();
    return email?.text ?? null;
  },
});
