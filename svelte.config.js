import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	handleHttpError: ({ path, referrer, message }) => {
		if (message.includes('Not found') || message.includes('404')) {
			return;
		}
		throw new Error(message);
	},
	kit: {
		adapter: adapter()
	}
};

export default config;
