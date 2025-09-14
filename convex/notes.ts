import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new note
export const createNote = mutation({
  args: {
    boardId: v.string(),
    text: v.string(),
    x: v.number(),
    y: v.number(),
    color: v.string(),
  },
  handler: async (ctx, { boardId, text, x, y, color }) => {
    const noteId = crypto.randomUUID();
    const now = Date.now();
    
    const noteId_db = await ctx.db.insert("notes", {
      boardId,
      id: noteId,
      text,
      x,
      y,
      color,
      createdAt: now,
      updatedAt: now,
    });
    
    return { _id: noteId_db, id: noteId, boardId, text, x, y, color, createdAt: now, updatedAt: now };
  },
});

// Update note text
export const updateNoteText = mutation({
  args: {
    noteId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, { noteId, text }) => {
    const note = await ctx.db
      .query("notes")
      .filter((q) => q.eq(q.field("id"), noteId))
      .first();
    
    if (!note) throw new Error("Note not found");
    
    await ctx.db.patch(note._id, {
      text,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Update note position
export const updateNotePosition = mutation({
  args: {
    noteId: v.string(),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, { noteId, x, y }) => {
    const note = await ctx.db
      .query("notes")
      .filter((q) => q.eq(q.field("id"), noteId))
      .first();
    
    if (!note) throw new Error("Note not found");
    
    await ctx.db.patch(note._id, {
      x,
      y,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Update note color
export const updateNoteColor = mutation({
  args: {
    noteId: v.string(),
    color: v.string(),
  },
  handler: async (ctx, { noteId, color }) => {
    const note = await ctx.db
      .query("notes")
      .filter((q) => q.eq(q.field("id"), noteId))
      .first();
    
    if (!note) throw new Error("Note not found");
    
    await ctx.db.patch(note._id, {
      color,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Delete a note
export const deleteNote = mutation({
  args: { noteId: v.string() },
  handler: async (ctx, { noteId }) => {
    const note = await ctx.db
      .query("notes")
      .filter((q) => q.eq(q.field("id"), noteId))
      .first();
    
    if (!note) throw new Error("Note not found");
    
    await ctx.db.delete(note._id);
    
    return { success: true };
  },
});

// Get all notes for a board
export const getNotes = query({
  args: { boardId: v.string() },
  handler: async (ctx, { boardId }) => {
    return await ctx.db
      .query("notes")
      .filter((q) => q.eq(q.field("boardId"), boardId))
      .collect();
  },
});
