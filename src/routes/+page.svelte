<script lang="ts">
	import { goto } from '$app/navigation';
	
	let boardId = '';
	let isCreating = false;
	
	function createBoard() {
		const newBoardId = crypto.randomUUID().substring(0, 8);
		goto(`/board/${newBoardId}`);
	}
	
	function joinBoard() {
		if (boardId.trim()) {
			goto(`/board/${boardId.trim()}`);
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			joinBoard();
		}
	}
</script>

<svelte:head>
	<title>Real-Time Collaboration Board</title>
	<meta name="description" content="Collaborate in real-time with sticky notes and drawings" />
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
	<div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-800 mb-2">Collaboration Board</h1>
			<p class="text-gray-600">Create sticky notes and draw together in real-time</p>
		</div>
		
		<div class="space-y-6">
			<!-- Create New Board -->
			<div class="text-center">
				<button
					on:click={createBoard}
					class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
				>
					Create New Board
				</button>
				<p class="text-sm text-gray-500 mt-2">Start a new collaboration session</p>
			</div>
			
			<!-- Divider -->
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-white text-gray-500">or</span>
				</div>
			</div>
			
			<!-- Join Existing Board -->
			<div>
				<label for="boardId" class="block text-sm font-medium text-gray-700 mb-2">
					Join Existing Board
				</label>
				<div class="flex gap-2">
					<input
						id="boardId"
						bind:value={boardId}
						on:keydown={handleKeydown}
						type="text"
						placeholder="Enter board ID"
						class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					<button
						on:click={joinBoard}
						disabled={!boardId.trim()}
						class="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Join
					</button>
				</div>
				<p class="text-sm text-gray-500 mt-2">Enter the board ID shared by your collaborator</p>
			</div>
		</div>
		
		<!-- Features -->
		<div class="mt-8 pt-6 border-t border-gray-200">
			<h3 class="text-sm font-medium text-gray-700 mb-3">Features</h3>
			<ul class="text-sm text-gray-600 space-y-1">
				<li class="flex items-center gap-2">
					<span class="text-green-500">✓</span>
					Real-time sticky notes
				</li>
				<li class="flex items-center gap-2">
					<span class="text-green-500">✓</span>
					Drag and drop notes
				</li>
				<li class="flex items-center gap-2">
					<span class="text-green-500">✓</span>
					Freehand drawing
				</li>
				<li class="flex items-center gap-2">
					<span class="text-green-500">✓</span>
					No login required
				</li>
			</ul>
		</div>
	</div>
</main>
