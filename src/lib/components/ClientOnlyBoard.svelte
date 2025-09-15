<script lang="ts">
	import { onMount } from 'svelte';
	import Board from './Board.svelte';
	
	export let boardId: string;
	
	let isLoaded = false;
	
	onMount(() => {
		// For now, just load the board without Convex
		// We'll add Convex integration later
		isLoaded = true;
	});
</script>

{#if isLoaded}
	<Board {boardId} />
{:else}
	<div class="h-screen w-screen bg-gray-100 flex items-center justify-center">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
			<h1 class="text-2xl font-bold text-gray-600 mb-4">Loading...</h1>
			<p class="text-gray-500">Initializing collaboration board...</p>
		</div>
	</div>
{/if}
