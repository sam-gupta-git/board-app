<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Real-Time Collaboration Board</title>
</svelte:head>

<div id="app" class="h-full">
	<slot />
</div>
