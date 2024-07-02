<!-- <script>
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

h1 {
		width: 100%;
	}  
	
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
	} 
</style>-->
<script>
	import { _client_canister_actor } from './+page.js';
	import { loginII, logout, isAuthenticated, principalId } from './auth.js';
	import { Principal } from '@dfinity/principal';
	import './index.scss';
	import copy_icon from '$lib/images/copy_icon.png';

	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

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

	let messagesMapStore = writable(new Map());
	const TARGET_PRINCIPAL = 'mmt3g-qiaaa-aaaal-qi6ra-cai';

	function createSampleEntity(id) {
		return {
			id: BigInt(id),
			eventId: BigInt(1000 + id),
			preEventId: null,
			timestamp: BigInt(Date.now()),
			namespace: 'event.profile.update',
			data: {
				'#Class': [
					{ key: 'name', value: { '#Text': `Пользователь ${id}` } },
					{ key: 'age', value: { '#Nat': BigInt(25 + (id % 50)) } },
					{ key: 'isActive', value: { '#Bool': true } }
				]
			},
			source: Principal.fromText(`aaaaa-aa`),
			headers: {
				'#Map': [
					['Content-Type', { '#Text': 'application/json' }],
					['X-Request-ID', { '#Text': `req-${id}` }]
				]
			},
			filter: 'user.profile.*'
		};
	}

	function initializeMessagesMap() {
		const principals = [TARGET_PRINCIPAL, 'mls5s-5qaaa-aaaal-qi6rq-cai'];

		principals.forEach((principal, index) => {
			const notifications = [
				createSampleEntity(index * 100 + 1),
				createSampleEntity(index * 100 + 2),
				createSampleEntity(index * 100 + 3)
			];
			$messagesMapStore.set(principal, notifications);
		});
	}
	let entity = {
		id: 1234n,
		eventId: 5678n,
		preEventId: null,
		timestamp: 1625097600000n, // 1 июля 2021 года, 00:00:00 UTC
		namespace: 'event.hub.update',
		data: {
			'#Class': [
				{ key: 'name', value: { '#Text': 'Иван Петров' } },
				{ key: 'age', value: { '#Nat': 30n } },
				{ key: 'isActive', value: { '#Bool': true } },
				{
					key: 'interests',
					value: {
						'#Array': [
							{ '#Text': 'программирование' },
							{ '#Text': 'путешествия' },
							{ '#Text': 'фотография' }
						]
					}
				}
			]
		},
		source: Principal.fromText('mmt3g-qiaaa-aaaal-qi6ra-cai'),
		headers: {
			'#Map': [
				['Content-Type', { '#Text': 'application/json' }],
				['X-Request-ID', { '#Text': 'abcdef123456' }]
			]
		},
		filter: 'user.profile.*'
	};

	onMount(() => {
		console.log('onMount start');
		let res = handleNotifications();
		console.log('Got res:', res);
		messagesMapStore.update((map) => {
			map.set(TARGET_PRINCIPAL, [entity]);
			return map;
		});
		// initializeMessagesMap();
		console.log('messagesMap after init:', $messagesMapStore);
	});

	function formatTimestamp(timestamp) {
		return new Date(Number(timestamp)).toLocaleString();
	}

	function renderICRC16(data) {
		if (typeof data === 'object' && data !== null) {
			if (Array.isArray(data)) {
				return `[${data.map(renderICRC16).join(', ')}]`;
			} else if (data instanceof Uint8Array) {
				return `Blob(${data.length} bytes)`;
			} else if (data.constructor === Object) {
				return JSON.stringify(data, (key, value) =>
					typeof value === 'bigint' ? value.toString() : value
				);
			}
		}
		return typeof data === 'bigint' ? data.toString() : String(data);
	}

	$: console.log('Reactive messagesMap size:', $messagesMapStore.size);

	async function handleNotifications() {
		let result = await _client_canister_actor
			.getNotificationsByUser(TARGET_PRINCIPAL)
			.then((res) => {
				console.log('res', res);
				messagesMapStore.update((map) => {
					map.set(TARGET_PRINCIPAL, res);
					return map;
				});
			});
	}
</script>

<div class="notifications-container">
	<h1>Notifications for Principal</h1>
	<p class="principal-id">{TARGET_PRINCIPAL}</p>

	{#if $messagesMapStore && $messagesMapStore.has(TARGET_PRINCIPAL)}
		{@const notifications = $messagesMapStore.get(TARGET_PRINCIPAL)}
		<p class="notification-count">
			Total notifications: {notifications.length}
		</p>

		<div class="card-list">
			{#each notifications as notification}
				<div class="card">
					<h2 class="card-title">Event ID: {notification.eventId}</h2>
					<p>
						<strong>Timestamp:</strong>
						{formatTimestamp(notification.timestamp)}
					</p>
					<p><strong>Namespace:</strong> {notification.namespace}</p>
					<details>
						<summary>More details</summary>
						<p><strong>ID:</strong> {notification.id}</p>
						<p>
							<strong>Source:</strong>
							{notification.source.toText()}
						</p>
						<p>
							<strong>Pre-Event ID:</strong>
							{notification.preEventId || 'None'}
						</p>
						<p>
							<strong>Filter:</strong>
							{notification.filter || 'None'}
						</p>
						<div class="data-section">
							<h4>Data:</h4>
							<pre>{renderICRC16(notification.data)}</pre>
						</div>
						{#if notification.headers}
							<div class="headers-section">
								<h4>Headers:</h4>
								<pre>{JSON.stringify(notification.headers, null, 2)}</pre>
							</div>
						{/if}
					</details>
				</div>
			{/each}
		</div>
	{:else}
		<p>No notifications available for this principal</p>
	{/if}
</div>
<div>
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
</div>

<style>
	.notifications-container {
		font-family: 'Baumans', Arial, sans-serif;
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	h1 {
		color: #333;
		text-align: center;
	}

	.principal-id {
		text-align: center;
		color: #2c3e50;
		font-weight: bold;
		margin-bottom: 20px;
	}

	.notification-count {
		text-align: center;
		color: #7f8c8d;
		margin-bottom: 20px;
	}

	.card-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.card {
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: 20px;
		transition: transform 0.3s ease;
	}

	.card:hover {
		transform: translateY(-5px);
	}

	.card-title {
		color: #2c3e50;
		font-size: 1.2em;
		margin-bottom: 10px;
	}

	details {
		margin-top: 10px;
	}

	summary {
		cursor: pointer;
		color: #3498db;
	}

	.data-section,
	.headers-section {
		background-color: #f8f9fa;
		border-radius: 4px;
		padding: 10px;
		margin-top: 10px;
	}

	pre {
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
