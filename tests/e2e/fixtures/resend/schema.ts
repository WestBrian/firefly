import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  emails: defineTable({ to: v.string(), text: v.string() }).index("by_to", [
    "to",
  ]),
});
