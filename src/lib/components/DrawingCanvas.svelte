<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import type { Drawing } from '$lib/types';
	
	export let boardId: string;
	export let drawings: Drawing[] = [];
	export let disabled: boolean = false;
	export let brushSize: number = 2;
	export let brushColor: string = '#000000';
	export let currentTool: string = 'brush';
	export let isDarkMode: boolean = false;
	
	const dispatch = createEventDispatcher();
	
	// Type-safe drawings data
	$: drawingsData = drawings || [];
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let isDrawing = false;
	let currentPath: Array<{x: number, y: number}> = [];
	
	// Drawing state
	let lastPoint = { x: 0, y: 0 };
	
	onMount(() => {
		if (canvas) {
			ctx = canvas.getContext('2d')!;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			// Set canvas size to match container
			const resizeCanvas = () => {
				const rect = canvas.parentElement?.getBoundingClientRect();
				if (rect) {
					canvas.width = rect.width;
					canvas.height = rect.height;
					drawGrid();
					redrawAllDrawings();
				}
			};

			resizeCanvas();
			window.addEventListener('resize', resizeCanvas);

			return () => {
				window.removeEventListener('resize', resizeCanvas);
			};
		}
	});
	
	// Redraw all drawings when data changes
	$: if (drawingsData && ctx) {
		redrawAllDrawings();
	}
	
	// Redraw grid when dark mode changes
	$: if (ctx) {
		redrawAllDrawings();
	}
	
	function redrawAllDrawings() {
		if (!ctx || !drawingsData) return;

		// Draw grid background first
		drawGrid();

		// Reset canvas state to prevent path bleeding
		ctx.beginPath();

		// Draw all existing drawings on main canvas
		drawingsData.forEach((drawing: Drawing) => {
			drawPath(drawing.points, drawing.color, drawing.strokeWidth);
		});

		// Reset canvas state after drawing
		ctx.beginPath();
	}
	
	function drawPath(points: Array<{x: number, y: number}>, color: string, strokeWidth: number) {
		if (points.length < 2) return;
		
		// Save current context state
		ctx.save();
		
		// Set up this specific path
		ctx.strokeStyle = color;
		ctx.lineWidth = strokeWidth;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		
		for (let i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		
		ctx.stroke();
		
		// Restore context state
		ctx.restore();
	}
	
	
	function startDrawing(event: MouseEvent) {
		if (disabled) return;

		isDrawing = true;
		const rect = canvas.getBoundingClientRect();
		const point = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};

		currentPath = [point];
		lastPoint = point;

		// Redraw grid and existing drawings
		redrawAllDrawings();

		// Clear any existing path and start fresh
		ctx.beginPath();

		// Set up drawing context for real-time drawing
		ctx.strokeStyle = brushColor;
		ctx.lineWidth = brushSize;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.moveTo(point.x, point.y);
	}
	
	function draw(event: MouseEvent) {
		if (!isDrawing) return;
		
		const rect = canvas.getBoundingClientRect();
		const point = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		
		currentPath.push(point);
		
		// Draw directly on main canvas for real-time feedback
		ctx.lineTo(point.x, point.y);
		ctx.stroke();
		
		lastPoint = point;
	}
	
	function stopDrawing() {
		if (!isDrawing) return;
		
		isDrawing = false;
		
		// Reset canvas state to prevent path bleeding
		ctx.beginPath();
		
		// Only save if we have enough points
		if (currentPath.length > 1) {
			dispatch('drawing-complete', {
				points: currentPath,
				color: brushColor,
				strokeWidth: brushSize
			});
		}
		
		currentPath = [];
	}
	
	function handleColorPick(event: MouseEvent) {
		if (disabled) return;
		
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		// Sample color from canvas at the clicked position
		const imageData = ctx.getImageData(x, y, 1, 1);
		const data = imageData.data;
		
		// Convert RGBA to hex
		const r = data[0];
		const g = data[1];
		const b = data[2];
		const a = data[3];
		
		// Convert to hex color
		const hexColor = rgbToHex(r, g, b);
		
		// Dispatch the color pick event
		dispatch('color-pick', { color: hexColor });
	}
	
	function rgbToHex(r: number, g: number, b: number): string {
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}
	
	function drawGrid() {
		if (!ctx) return;
		
		const gridSize = 20; // Grid spacing in pixels
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;
		
		// Clear canvas
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		// Set grid style based on dark mode
		const minorColor = isDarkMode ? '#374151' : '#e5e7eb'; // Dark gray for dark mode, light gray for light mode
		const majorColor = isDarkMode ? '#4b5563' : '#d1d5db'; // Slightly lighter dark gray for dark mode
		
		ctx.strokeStyle = minorColor;
		ctx.lineWidth = 1;
		ctx.setLineDash([]);
		
		// Draw vertical lines
		for (let x = 0; x <= canvasWidth; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvasHeight);
			ctx.stroke();
		}
		
		// Draw horizontal lines
		for (let y = 0; y <= canvasHeight; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvasWidth, y);
			ctx.stroke();
		}
		
		// Draw major grid lines (every 5th line) with slightly darker color
		ctx.strokeStyle = majorColor;
		ctx.lineWidth = 1;
		
		// Major vertical lines
		for (let x = 0; x <= canvasWidth; x += gridSize * 5) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvasHeight);
			ctx.stroke();
		}
		
		// Major horizontal lines
		for (let y = 0; y <= canvasHeight; y += gridSize * 5) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvasWidth, y);
			ctx.stroke();
		}
	}
	
	function handleMouseDown(event: MouseEvent) {
		event.preventDefault();
		
		if (currentTool === 'color-picker') {
			handleColorPick(event);
		} else {
			startDrawing(event);
		}
	}
	
	function handleMouseMove(event: MouseEvent) {
		event.preventDefault();
		draw(event);
	}
	
	function handleMouseUp(event: MouseEvent) {
		event.preventDefault();
		stopDrawing();
	}
	
	// Handle touch events for mobile
	function handleTouchStart(event: TouchEvent) {
		event.preventDefault();
		if (disabled) return;
		
		const touch = event.touches[0];
		const mouseEvent = new MouseEvent('mousedown', {
			clientX: touch.clientX,
			clientY: touch.clientY
		});
		startDrawing(mouseEvent);
	}
	
	function handleTouchMove(event: TouchEvent) {
		event.preventDefault();
		const touch = event.touches[0];
		const mouseEvent = new MouseEvent('mousemove', {
			clientX: touch.clientX,
			clientY: touch.clientY
		});
		draw(mouseEvent);
	}
	
	function handleTouchEnd(event: TouchEvent) {
		event.preventDefault();
		stopDrawing();
	}
</script>

<canvas
	bind:this={canvas}
	class="absolute inset-0 w-full h-full {disabled ? 'cursor-default' : 'cursor-crosshair'}"
	on:mousedown={handleMouseDown}
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
	on:touchstart={handleTouchStart}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
	style="touch-action: none;"
></canvas>
