<script>
	import { loginII, logout, isAuthenticated, principalId } from './auth.js';
	import copy_icon from '$lib/images/copy_icon.png';
	import './index.scss';

	let loggedIn = false;
	let principal = '';
	principalId.subscribe((value) => {
		principal = value;
	});

	function handleLogin() {
		loginII();
	}

	function handleLogout() {
		logout();
	}

	isAuthenticated.subscribe((value) => {
		loggedIn = value;
	});

	async function copyValue() {
		await navigator.clipboard.writeText(principal);
		alert('ID скопирован: ' + principal);
	}
</script>

<svelte:head>
	<title>Client for aVa Event Hub</title>
	<meta name="description" content="Client for aVa Event Hub demo app" />
</svelte:head>

<section>
	{#if loggedIn}
		<h2>Your aVa id is:</h2>
		<span class="user_principal"
			>{principal}
			<button on:click={copyValue}><img class="copy_icon" src={copy_icon} alt="Copy ID" /></button>
		</span>
		<br />
		<h2>Save your this id and Internet Identity number for later use. <br /></h2>
		<br />
		<button class="logout" on:click={handleLogout}> Logout</button>
	{:else}
		<button class="login" on:click={handleLogin}> Please Login with Internet Identity</button>
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	/* h1 {
		width: 100%;
	} */

	/* .welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	} */
</style>
