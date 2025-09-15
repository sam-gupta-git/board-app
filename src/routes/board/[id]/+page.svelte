<script lang="ts">
	import { page } from '$app/stores';
	import ClientOnlyBoard from '$lib/components/ClientOnlyBoard.svelte';
	
	let boardId: string = '';
	
	$: boardId = $page.params.id || '';
</script>

<div class="h-screen w-screen bg-gray-100">
	{#if boardId}
		<ClientOnlyBoard {boardId} />
	{:else}
		<div class="flex items-center justify-center h-full">
			<div class="text-center">
				<h1 class="text-2xl font-bold text-gray-600 mb-4">Loading board...</h1>
			</div>
		</div>
	{/if}
</div>
