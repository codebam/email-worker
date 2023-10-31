import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

export interface Env {
	send_emails: any;
	email_reminders: any;
}

const name = 'Sean';

export default {
	fetch: async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => new Response(),
	scheduled: async (event: any, env: Env, ctx: ExecutionContext): Promise<Response> => {
		const reminders = JSON.parse(await env.email_reminders.get('reminders')).join('\n');
		if (reminders.length !== 0) {
			const msg = createMimeMessage();
			msg.setSender({ name: 'Cloudflare Workers', addr: 'cloudflare-workers@seanbehan.ca' });
			msg.setRecipient('codebam@riseup.net');
			msg.setSubject(new Date().toISOString());
			msg.addMessage({
				contentType: 'text/plain',
				data: `Hi ${name}, here are your reminders.\n\n${reminders.toString()}`,
			});
			const message = new EmailMessage('cloudflare-workers@seanbehan.ca', 'codebam@riseup.net', msg.asRaw());
			return new Response(await env.send_emails.send(message));
		} else {
			return new Response('ok');
		}
	},
	email: async (message: any, env: Env, ctx: ExecutionContext) => {
		const subject = message.headers.get('subject');
		if (subject === 'clear') {
			await env.email_reminders.put('reminders', JSON.stringify([]));
			const msg = createMimeMessage();
			msg.setSender({ name: 'Cloudflare Workers', addr: 'cloudflare-workers@seanbehan.ca' });
			msg.setRecipient('codebam@riseup.net');
			msg.setSubject(new Date().toISOString());
			msg.addMessage({
				contentType: 'text/plain',
				data: 'reminders cleared',
			});
			const message = new EmailMessage('cloudflare-workers@seanbehan.ca', 'codebam@riseup.net', msg.asRaw());
			await env.send_emails.send(message);
		} else {
			const reminders = JSON.parse(await env.email_reminders.get('reminders'));
			await env.email_reminders.put('reminders', JSON.stringify([...reminders, subject]));
			const msg = createMimeMessage();
			msg.setSender({ name: 'Cloudflare Workers', addr: 'cloudflare-workers@seanbehan.ca' });
			msg.setRecipient('codebam@riseup.net');
			msg.setSubject(new Date().toISOString());
			msg.addMessage({
				contentType: 'text/plain',
				data: 'reminder created',
			});
			const message = new EmailMessage('cloudflare-workers@seanbehan.ca', 'codebam@riseup.net', msg.asRaw());
			await env.send_emails.send(message);
		}
	},
};
