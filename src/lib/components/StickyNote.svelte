<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import type { Note } from '$lib/types';
	
	export let note: Note;
	export let boardId: string;
	
	const dispatch = createEventDispatcher();
	
	let noteElement: HTMLDivElement;
	let isEditing = false;
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };
	let currentText = note.text;
	let currentPosition = { x: note.x, y: note.y };
	
	// Update current values when note prop changes
	$: currentText = note.text;
	$: currentPosition = { x: note.x, y: note.y };
	
	// Handle text editing
	function startEditing() {
		isEditing = true;
	}
	
	function stopEditing() {
		isEditing = false;
		if (currentText !== note.text) {
			// Update local state
			note.text = currentText;
			note.updatedAt = Date.now();
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
	
	// Handle dragging
	function startDrag(event: MouseEvent) {
		if (isEditing) return;
		
		isDragging = true;
		const rect = noteElement.getBoundingClientRect();
		dragOffset = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		
		noteElement.classList.add('dragging');
		event.preventDefault();
	}
	
	function handleDrag(event: MouseEvent) {
		if (!isDragging) return;
		
		const boardRect = noteElement.parentElement?.getBoundingClientRect();
		if (!boardRect) return;
		
		const newX = event.clientX - boardRect.left - dragOffset.x;
		const newY = event.clientY - boardRect.top - dragOffset.y;
		
		currentPosition = { x: newX, y: newY };
	}
	
	function stopDrag() {
		if (!isDragging) return;
		
		isDragging = false;
		noteElement.classList.remove('dragging');
		
		// Update position in local state
		note.x = currentPosition.x;
		note.y = currentPosition.y;
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
				bind:value={currentText}
				on:blur={stopEditing}
				on:keydown={handleKeydown}
				class="w-full h-full bg-transparent border-none outline-none resize-none text-gray-800"
				autofocus
			></textarea>
		{:else}
			<div 
				class="w-full h-full cursor-text"
				on:click={startEditing}
				on:dblclick={startEditing}
			>
				{currentText}
			</div>
		{/if}
		
		<!-- Controls -->
		<div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
			<button
				on:click={(e) => changeColor(e)}
				class="w-4 h-4 rounded-full border border-gray-400 hover:scale-110 transition-transform"
				style="background-color: var(--color-{note.color})"
				title="Change color"
			></button>
			<button
				on:click={(e) => deleteNoteHandler(e)}
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
	}
	
	.sticky-note:hover .opacity-0 {
		opacity: 1;
	}
</style>
