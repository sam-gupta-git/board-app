<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let isOpen: boolean = false;
	export let title: string = 'Confirm Action';
	export let message: string = 'Are you sure?';
	export let confirmText: string = 'Confirm';
	export let cancelText: string = 'Cancel';
	export let confirmButtonClass: string = 'bg-red-500 hover:bg-red-600';
	
	const dispatch = createEventDispatcher();
	
	function handleConfirm() {
		dispatch('confirm');
	}
	
	function handleCancel() {
		dispatch('cancel');
	}
	
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- Modal -->
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
			<!-- Header -->
			<div class="px-6 py-4 border-b border-gray-200">
				<h3 class="text-lg font-semibold text-gray-900">{title}</h3>
			</div>
			
			<!-- Body -->
			<div class="px-6 py-4">
				<p class="text-gray-600">{message}</p>
			</div>
			
			<!-- Footer -->
			<div class="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
				<button
					on:click={handleCancel}
					class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
				>
					{cancelText}
				</button>
				<button
					on:click={handleConfirm}
					class="px-4 py-2 text-white rounded-lg transition-colors font-medium {confirmButtonClass}"
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
