import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new drawing stroke
export const createDrawing = mutation({
  args: {
    boardId: v.string(),
    points: v.array(v.object({
      x: v.number(),
      y: v.number(),
    })),
    color: v.string(),
    strokeWidth: v.number(),
  },
  handler: async (ctx, { boardId, points, color, strokeWidth }) => {
    const drawingId = crypto.randomUUID();
    const now = Date.now();
    
    const drawingId_db = await ctx.db.insert("drawings", {
      boardId,
      id: drawingId,
      points,
      color,
      strokeWidth,
      createdAt: now,
    });
    
    return { _id: drawingId_db, id: drawingId, boardId, points, color, strokeWidth, createdAt: now };
  },
});

// Get all drawings for a board
export const getDrawings = query({
  args: { boardId: v.string() },
  handler: async (ctx, { boardId }) => {
    return await ctx.db
      .query("drawings")
      .filter((q) => q.eq(q.field("boardId"), boardId))
      .collect();
  },
});

// Delete a drawing
export const deleteDrawing = mutation({
  args: { drawingId: v.string() },
  handler: async (ctx, { drawingId }) => {
    const drawing = await ctx.db
      .query("drawings")
      .filter((q) => q.eq(q.field("id"), drawingId))
      .first();
    
    if (!drawing) throw new Error("Drawing not found");
    
    await ctx.db.delete(drawing._id);
    
    return { success: true };
  },
});
