<script lang="ts">
	import { onMount } from 'svelte';
	import { ConvexProvider } from 'convex/react';
	import Board from '$lib/components/Board.svelte';
	import { page } from '$app/stores';
	import { convex } from '$lib/convex';
	
	let boardId: string = '';
	
	$: boardId = $page.params.id || '';
</script>

<ConvexProvider client={convex}>
	<div class="h-screen w-screen bg-gray-100">
		{#if boardId}
			<Board {boardId} />
		{:else}
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<h1 class="text-2xl font-bold text-gray-600 mb-4">Loading board...</h1>
				</div>
			</div>
		{/if}
	</div>
</ConvexProvider>
