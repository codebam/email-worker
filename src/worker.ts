import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

export interface Env {
	send_emails: any;
}

const name = 'Sean';
const reminders: any = [];

reminders.push('go to sleep');

reminders.map((reminder: string) => reminder + '\n\n');

export default {
	fetch: async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => new Response(),
	scheduled: async (event: any, env: Env, ctx: ExecutionContext): Promise<Response> => {
		const msg = createMimeMessage();
		msg.setSender({ name: 'Cloudflare Workers', addr: 'cloudflare-workers@seanbehan.ca' });
		msg.setRecipient('codebam@riseup.net');
		msg.setSubject(new Date().toISOString());
		msg.addMessage({
			contentType: 'text/plain',
			data: `Hi ${name},\n\n${reminders.toString()}`,
		});
		const message = new EmailMessage('cloudflare-workers@seanbehan.ca', 'codebam@riseup.net', msg.asRaw());
		return new Response(await env.send_emails.send(message));
	},
};
