<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	let boardId = '';
	let isCreating = false;
	let isDarkMode = false; // Dark mode state
	
	// Save dark mode to localStorage when it changes
	$: if (typeof window !== 'undefined') {
		localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
	}
	
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
	
	// Toggle dark mode
	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
	}
	
	// Load dark mode preference on mount
	onMount(() => {
		const savedDarkMode = localStorage.getItem('darkMode');
		if (savedDarkMode !== null) {
			isDarkMode = JSON.parse(savedDarkMode);
		}
	});
</script>

<svelte:head>
	<title>Real-Time Collaboration Board</title>
	<meta name="description" content="Collaborate in real-time with sticky notes and drawings" />
</svelte:head>

<main class="min-h-screen flex items-center justify-center p-4 {isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}">
	<!-- Dark Mode Toggle Button -->
	<button
		on:click={toggleDarkMode}
		class="fixed top-4 right-4 p-3 rounded-lg shadow-lg transition-colors font-medium z-10 {isDarkMode 
			? 'bg-yellow-500 text-white hover:bg-yellow-600' 
			: 'bg-gray-800 text-white hover:bg-gray-700'}"
		title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
	>
		{#if isDarkMode}
			<!-- Sun Icon (Light Mode) -->
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
			</svg>
		{:else}
			<!-- Moon Icon (Dark Mode) -->
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
			</svg>
		{/if}
	</button>
	
	<div class="{isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold {isDarkMode ? 'text-white' : 'text-gray-800'} mb-2">Collaboration Board</h1>
			<p class="{isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Create sticky notes and draw together in real-time</p>
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
				<p class="text-sm {isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2">Start a new collaboration session</p>
			</div>
			
			<!-- Divider -->
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t {isDarkMode ? 'border-gray-600' : 'border-gray-300'}"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 {isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}">or</span>
				</div>
			</div>
			
			<!-- Join Existing Board -->
			<div>
				<label for="boardId" class="block text-sm font-medium {isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
					Join Existing Board
				</label>
				<div class="flex gap-2">
					<input
						id="boardId"
						bind:value={boardId}
						on:keydown={handleKeydown}
						type="text"
						placeholder="Enter board ID"
						class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}"
					/>
					<button
						on:click={joinBoard}
						disabled={!boardId.trim()}
						class="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Join
					</button>
				</div>
				<p class="text-sm {isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2">Enter the board ID shared by your collaborator</p>
			</div>
		</div>
		
		<!-- Features -->
		<div class="mt-8 pt-6 border-t {isDarkMode ? 'border-gray-600' : 'border-gray-200'}">
			<h3 class="text-sm font-medium {isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3">Features</h3>
			<ul class="text-sm {isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1">
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
