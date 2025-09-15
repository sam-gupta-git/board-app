<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import type { Image } from '$lib/types';
	
	export let image: Image;
	export let boardId: string;
	
	const dispatch = createEventDispatcher();
	
	let imageElement: HTMLDivElement;
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };
	let currentPosition = { x: image.x, y: image.y };
	let currentSize = { width: image.width, height: image.height };
	let isResizing = false;
	let resizeHandle = '';
	
	// Update current values when image prop changes
	$: currentPosition = { x: image.x, y: image.y };
	$: currentSize = { width: image.width, height: image.height };
	
	// Handle dragging
	function startDrag(event: MouseEvent) {
		if (isResizing) return;
		
		isDragging = true;
		const rect = imageElement.getBoundingClientRect();
		dragOffset = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		
		imageElement.classList.add('dragging');
		event.preventDefault();
	}
	
	function handleDrag(event: MouseEvent) {
		if (!isDragging) return;
		
		const boardRect = imageElement.parentElement?.getBoundingClientRect();
		if (!boardRect) return;
		
		const newX = event.clientX - boardRect.left - dragOffset.x;
		const newY = event.clientY - boardRect.top - dragOffset.y;
		
		currentPosition = { x: newX, y: newY };
	}
	
	function stopDrag() {
		if (!isDragging) return;
		
		isDragging = false;
		imageElement.classList.remove('dragging');
		
		// Update position in local state
		image.x = currentPosition.x;
		image.y = currentPosition.y;
		image.updatedAt = Date.now();
		dispatch('update', image);
	}
	
	// Handle resizing
	function startResize(event: MouseEvent, handle: string) {
		event.stopPropagation();
		isResizing = true;
		resizeHandle = handle;
		
		const rect = imageElement.getBoundingClientRect();
		dragOffset = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		
		event.preventDefault();
	}
	
	function handleResize(event: MouseEvent) {
		if (!isResizing) return;
		
		const boardRect = imageElement.parentElement?.getBoundingClientRect();
		if (!boardRect) return;
		
		const mouseX = event.clientX - boardRect.left;
		const mouseY = event.clientY - boardRect.top;
		
		let newWidth = currentSize.width;
		let newHeight = currentSize.height;
		let newX = currentPosition.x;
		let newY = currentPosition.y;
		
		switch (resizeHandle) {
			case 'se': // Southeast
				newWidth = mouseX - currentPosition.x;
				newHeight = mouseY - currentPosition.y;
				break;
			case 'sw': // Southwest
				newWidth = currentPosition.x + currentSize.width - mouseX;
				newHeight = mouseY - currentPosition.y;
				newX = mouseX;
				break;
			case 'ne': // Northeast
				newWidth = mouseX - currentPosition.x;
				newHeight = currentPosition.y + currentSize.height - mouseY;
				newY = mouseY;
				break;
			case 'nw': // Northwest
				newWidth = currentPosition.x + currentSize.width - mouseX;
				newHeight = currentPosition.y + currentSize.height - mouseY;
				newX = mouseX;
				newY = mouseY;
				break;
		}
		
		// Ensure minimum size
		newWidth = Math.max(50, newWidth);
		newHeight = Math.max(50, newHeight);
		
		currentSize = { width: newWidth, height: newHeight };
		currentPosition = { x: newX, y: newY };
	}
	
	function stopResize() {
		if (!isResizing) return;
		
		isResizing = false;
		resizeHandle = '';
		
		// Update size and position in local state
		image.width = currentSize.width;
		image.height = currentSize.height;
		image.x = currentPosition.x;
		image.y = currentPosition.y;
		image.updatedAt = Date.now();
		dispatch('update', image);
	}
	
	// Handle delete
	function deleteImage(event: MouseEvent) {
		event.stopPropagation();
		if (confirm('Delete this image?')) {
			dispatch('delete', image.id);
		}
	}
	
	// Set up global mouse events for dragging and resizing
	onMount(() => {
		const handleGlobalMouseMove = (event: MouseEvent) => {
			handleDrag(event);
			handleResize(event);
		};
		const handleGlobalMouseUp = () => {
			stopDrag();
			stopResize();
		};
		
		document.addEventListener('mousemove', handleGlobalMouseMove);
		document.addEventListener('mouseup', handleGlobalMouseUp);
		
		return () => {
			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseup', handleGlobalMouseUp);
		};
	});
</script>

<div
	bind:this={imageElement}
	class="image-component absolute"
	style="left: {currentPosition.x}px; top: {currentPosition.y}px; width: {currentSize.width}px; height: {currentSize.height}px;"
	on:mousedown={startDrag}
	role="button"
	tabindex="0"
>
	<!-- Image -->
	<img
		src={image.src}
		alt="Uploaded image"
		class="w-full h-full object-contain border border-gray-300 rounded-lg"
		draggable="false"
	/>
	
	<!-- Controls -->
	<div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
		<button
			on:click={deleteImage}
			class="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
			title="Delete image"
		>
			×
		</button>
	</div>
	
	<!-- Resize handles -->
	<div class="absolute inset-0 pointer-events-none">
		<!-- Southeast handle -->
		<div
			class="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize pointer-events-auto"
			on:mousedown={(e) => startResize(e, 'se')}
		></div>
		<!-- Southwest handle -->
		<div
			class="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 cursor-sw-resize pointer-events-auto"
			on:mousedown={(e) => startResize(e, 'sw')}
		></div>
		<!-- Northeast handle -->
		<div
			class="absolute top-0 right-0 w-3 h-3 bg-blue-500 cursor-ne-resize pointer-events-auto"
			on:mousedown={(e) => startResize(e, 'ne')}
		></div>
		<!-- Northwest handle -->
		<div
			class="absolute top-0 left-0 w-3 h-3 bg-blue-500 cursor-nw-resize pointer-events-auto"
			on:mousedown={(e) => startResize(e, 'nw')}
		></div>
	</div>
</div>

<style>
	.image-component:hover .opacity-0 {
		opacity: 1;
	}
	
	.image-component.dragging {
		z-index: 1000;
	}
</style>
