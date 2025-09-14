<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { useQuery, useMutation } from 'convex/react';
	import { api } from '../../../convex/_generated/api';
	import type { Drawing } from '$lib/types';
	
	export let boardId: string;
	
	const dispatch = createEventDispatcher();
	
	// Convex queries
	const drawings = useQuery(api.drawings.getDrawings, { boardId });
	
	// Type-safe drawings data
	$: drawingsData = drawings || [];
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let isDrawing = false;
	let currentPath: Array<{x: number, y: number}> = [];
	let currentColor = '#000000';
	let currentStrokeWidth = 2;
	
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
	
	function redrawAllDrawings() {
		if (!ctx || !drawingsData) return;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		drawingsData.forEach((drawing: Drawing) => {
			drawPath(drawing.points, drawing.color, drawing.strokeWidth);
		});
	}
	
	function drawPath(points: Array<{x: number, y: number}>, color: string, strokeWidth: number) {
		if (points.length < 2) return;
		
		ctx.strokeStyle = color;
		ctx.lineWidth = strokeWidth;
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		
		for (let i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		
		ctx.stroke();
	}
	
	function startDrawing(event: MouseEvent) {
		isDrawing = true;
		const rect = canvas.getBoundingClientRect();
		const point = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		
		currentPath = [point];
		lastPoint = point;
		
		// Start drawing immediately for better UX
		ctx.strokeStyle = currentColor;
		ctx.lineWidth = currentStrokeWidth;
		ctx.beginPath();
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
		
		// Draw line to current point
		ctx.lineTo(point.x, point.y);
		ctx.stroke();
		
		lastPoint = point;
	}
	
	function stopDrawing() {
		if (!isDrawing) return;
		
		isDrawing = false;
		
		// Only save if we have enough points
		if (currentPath.length > 1) {
			dispatch('drawing-complete', {
				points: currentPath,
				color: currentColor,
				strokeWidth: currentStrokeWidth
			});
		}
		
		currentPath = [];
	}
	
	function handleMouseDown(event: MouseEvent) {
		event.preventDefault();
		startDrawing(event);
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
	class="absolute inset-0 w-full h-full cursor-crosshair"
	on:mousedown={handleMouseDown}
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
	on:touchstart={handleTouchStart}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
	style="touch-action: none;"
></canvas>
