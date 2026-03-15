import Dexie from 'dexie';
import { encryptData, decryptData } from '../utils/crypto';

// Initialize Dexie using a custom schema
class EncryptedDatabase extends Dexie {
  constructor() {
    super('UrbanLifeDB');
    this.version(1).stores({
      settings: 'id', // just unencrypted metadata
      members: 'id' // we store all encrypted data as a blob in the "data" field
    });
  }

  // Wrappers to automatically encrypt/decrypt
  async saveMember(member, pin) {
    if (!member.id) {
       member.id = crypto.randomUUID();
    }
    const encryptedPayload = encryptData(member, pin);
    await this.members.put({
      id: member.id,
      data: encryptedPayload
    });
    return member.id;
  }

  async getMember(id, pin) {
    const record = await this.members.get(id);
    if (!record || !record.data) return null;
    return decryptData(record.data, pin);
  }

  async getAllMembers(pin) {
    const records = await this.members.toArray();
    return records.map(r => decryptData(r.data, pin)).filter(Boolean);
  }

  async deleteMember(id) {
    await this.members.delete(id);
  }

  async getSettings(id) {
    return await this.settings.get(id);
  }

  async saveSettings(id, value) {
    await this.settings.put({ id, value });
  }
}

export const db = new EncryptedDatabase();
