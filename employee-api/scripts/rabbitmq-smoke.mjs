import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { connect } from 'amqplib';

config({ path: resolve(import.meta.dirname, '../../.env'), quiet: true });
if (!process.env.RABBITMQ_URL) throw new Error('RABBITMQ_URL wajib diisi');
const connection = await connect(process.env.RABBITMQ_URL, { timeout: 10000 });
try {
  const channel = await connection.createConfirmChannel();
  const { queue } = await channel.assertQueue('', {
    exclusive: true,
    durable: false,
  });
  const payload = 'dexa-smoke';
  channel.sendToQueue(queue, Buffer.from(payload));
  await channel.waitForConfirms();

  const message = await channel.get(queue, { noAck: false });
  assert.ok(message, 'Pesan tidak ditemukan');
  assert.equal(message.content.toString(), payload);
  channel.ack(message);
  await channel.close();
  console.log('RabbitMQ OK: pesan terkirim dan diterima.');
} finally {
  await connection.close();
}
