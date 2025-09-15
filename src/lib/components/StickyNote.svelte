<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import type { Note } from '$lib/types';
	
	export let note: Note;
	export let boardId: string;
	
	const dispatch = createEventDispatcher();
	
	let noteElement: HTMLDivElement;
	let textareaElement: HTMLTextAreaElement;
	let isEditing = false;
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };
	let currentText = note.text;
	let currentPosition = { x: note.x, y: note.y };
	let boardRect: DOMRect | null = null;
	
	// Update current values when note prop changes
	$: if (!isEditing) {
		currentText = note.text;
	}
	$: currentPosition = { x: note.x, y: note.y };
	
	// Debug currentText changes
	$: console.log('currentText changed to:', currentText);
	
	// Focus textarea when editing starts
	$: if (isEditing && textareaElement) {
		setTimeout(() => {
			textareaElement.focus();
			textareaElement.select(); // Select all text for easy editing
		}, 0);
	}
	
	// Handle text editing
	function startEditing(event: MouseEvent) {
		event.stopPropagation();
		console.log('Starting text editing, current text:', note.text);
		isEditing = true;
	}
	
	function stopEditing() {
		console.log('Stopping text editing, currentText:', currentText, 'note.text:', note.text);
		isEditing = false;
		if (currentText !== note.text) {
			// Update local state
			note.text = currentText;
			note.updatedAt = Date.now();
			console.log('Dispatching update with text:', currentText);
			dispatch('update', note);
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			stopEditing();
		}
		if (event.key === 'Escape') {
			currentText = note.text;
			stopEditing();
		}
	}
	
	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		console.log('Textarea input:', target?.value);
	}
	
	// Handle dragging
	function startDrag(event: MouseEvent) {
		// Don't start dragging if clicking on text area or controls
		const target = event.target as HTMLElement;
		if (isEditing || target.tagName === 'TEXTAREA' || target.closest('button')) {
			return;
		}
		
		isDragging = true;
		const rect = noteElement.getBoundingClientRect();
		dragOffset = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		
		// Cache the board rect to avoid repeated getBoundingClientRect calls
		boardRect = noteElement.parentElement?.getBoundingClientRect() || null;
		
		noteElement.classList.add('dragging');
		event.preventDefault();
	}
	
	function handleDrag(event: MouseEvent) {
		if (!isDragging || !boardRect) return;
		
		const newX = event.clientX - boardRect.left - dragOffset.x;
		const newY = event.clientY - boardRect.top - dragOffset.y;
		
		// Update position directly without reactive variables for smoother dragging
		noteElement.style.left = `${newX}px`;
		noteElement.style.top = `${newY}px`;
	}
	
	function stopDrag() {
		if (!isDragging) return;
		
		isDragging = false;
		noteElement.classList.remove('dragging');
		
		// Get the final position from the element's style
		const finalX = parseFloat(noteElement.style.left) || currentPosition.x;
		const finalY = parseFloat(noteElement.style.top) || currentPosition.y;
		
		// Update position in local state
		currentPosition = { x: finalX, y: finalY };
		note.x = finalX;
		note.y = finalY;
		note.updatedAt = Date.now();
		dispatch('update', note);
	}
	
	// Handle color change
	function changeColor(event: MouseEvent) {
		event.stopPropagation();
		const colors = ['yellow', 'pink', 'blue', 'green', 'purple'];
		const currentIndex = colors.indexOf(note.color);
		const nextColor = colors[(currentIndex + 1) % colors.length];
		
		note.color = nextColor;
		note.updatedAt = Date.now();
		dispatch('update', note);
	}
	
	// Handle delete
	function deleteNoteHandler(event: MouseEvent) {
		event.stopPropagation();
		if (confirm('Delete this note?')) {
			dispatch('delete', note.id);
		}
	}
	
	// Set up global mouse events for dragging
	onMount(() => {
		const handleGlobalMouseMove = (event: MouseEvent) => handleDrag(event);
		const handleGlobalMouseUp = () => stopDrag();
		
		document.addEventListener('mousemove', handleGlobalMouseMove);
		document.addEventListener('mouseup', handleGlobalMouseUp);
		
		return () => {
			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseup', handleGlobalMouseUp);
		};
	});
</script>

<div
	bind:this={noteElement}
	class="sticky-note {note.color}"
	style="left: {currentPosition.x}px; top: {currentPosition.y}px;"
	on:mousedown={startDrag}
	role="button"
	tabindex="0"
>
	<!-- Note content -->
	<div class="relative h-full">
		{#if isEditing}
			<textarea
				bind:this={textareaElement}
				bind:value={currentText}
				on:blur={stopEditing}
				on:keydown={handleKeydown}
				on:input={handleInput}
				on:click={(e) => e.stopPropagation()}
				on:mousedown={(e) => e.stopPropagation()}
				class="w-full h-full bg-transparent border-none outline-none resize-none text-gray-800"
			></textarea>
		{:else}
			<div 
				class="w-full h-full cursor-text"
				on:click={(e) => startEditing(e)}
				on:dblclick={(e) => startEditing(e)}
				on:mousedown={(e) => e.stopPropagation()}
			>
				{currentText}
			</div>
		{/if}
		
		<!-- Controls -->
		<div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
			<button
				on:click={(e) => changeColor(e)}
				on:mousedown={(e) => e.stopPropagation()}
				class="w-4 h-4 rounded-full border border-gray-400 hover:scale-110 transition-transform"
				style="background-color: var(--color-{note.color})"
				title="Change color"
			></button>
			<button
				on:click={(e) => deleteNoteHandler(e)}
				on:mousedown={(e) => e.stopPropagation()}
				class="w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
				title="Delete note"
			>
				×
			</button>
		</div>
	</div>
</div>

<style>
	:global(.sticky-note) {
		--color-yellow: #fef3c7;
		--color-pink: #fce7f3;
		--color-blue: #dbeafe;
		--color-green: #dcfce7;
		--color-purple: #e9d5ff;
		position: absolute;
		width: 200px;
		height: 150px;
		cursor: move;
		user-select: none;
	}
	
	.sticky-note:hover .opacity-0 {
		opacity: 1;
	}
	
	.sticky-note.dragging {
		transition: none !important;
		z-index: 1000;
	}
</style>
