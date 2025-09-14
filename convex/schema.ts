import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  boards: defineTable({
    id: v.string(),
    createdAt: v.number(),
    lastAccessedAt: v.number(),
  }),
  
  notes: defineTable({
    boardId: v.string(),
    id: v.string(),
    text: v.string(),
    x: v.number(),
    y: v.number(),
    color: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  
  drawings: defineTable({
    boardId: v.string(),
    id: v.string(),
    points: v.array(v.object({
      x: v.number(),
      y: v.number(),
    })),
    color: v.string(),
    strokeWidth: v.number(),
    createdAt: v.number(),
  }),
});
