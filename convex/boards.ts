import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create a board
export const getOrCreateBoard = mutation({
  args: { boardId: v.string() },
  handler: async (ctx, { boardId }) => {
    const existingBoard = await ctx.db
      .query("boards")
      .filter((q) => q.eq(q.field("id"), boardId))
      .first();
    
    if (existingBoard) {
      // Update last accessed time
      await ctx.db.patch(existingBoard._id, {
        lastAccessedAt: Date.now(),
      });
      return existingBoard;
    }
    
    // Create new board
    const newBoard = await ctx.db.insert("boards", {
      id: boardId,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    });
    
    return { _id: newBoard, id: boardId, createdAt: Date.now(), lastAccessedAt: Date.now() };
  },
});

// Get board data
export const getBoard = query({
  args: { boardId: v.string() },
  handler: async (ctx, { boardId }) => {
    const board = await ctx.db
      .query("boards")
      .filter((q) => q.eq(q.field("id"), boardId))
      .first();
    
    if (!board) return null;
    
    const notes = await ctx.db
      .query("notes")
      .filter((q) => q.eq(q.field("boardId"), boardId))
      .collect();
    
    const drawings = await ctx.db
      .query("drawings")
      .filter((q) => q.eq(q.field("boardId"), boardId))
      .collect();
    
    return {
      ...board,
      notes,
      drawings,
    };
  },
});

// Clean up old boards (run this periodically)
export const cleanupOldBoards = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    
    const oldBoards = await ctx.db
      .query("boards")
      .filter((q) => q.lt(q.field("lastAccessedAt"), cutoffTime))
      .collect();
    
    for (const board of oldBoards) {
      // Delete associated notes
      const notes = await ctx.db
        .query("notes")
        .filter((q) => q.eq(q.field("boardId"), board.id))
        .collect();
      
      for (const note of notes) {
        await ctx.db.delete(note._id);
      }
      
      // Delete associated drawings
      const drawings = await ctx.db
        .query("drawings")
        .filter((q) => q.eq(q.field("boardId"), board.id))
        .collect();
      
      for (const drawing of drawings) {
        await ctx.db.delete(drawing._id);
      }
      
      // Delete the board
      await ctx.db.delete(board._id);
    }
    
    return { deletedCount: oldBoards.length };
  },
});
