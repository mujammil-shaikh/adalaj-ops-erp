import { db } from './storage';

/**
 * Triggers an instant download of the complete ERP state as a JSON file.
 * Fired automatically upon login or at regular intervals.
 */
export function triggerAutomaticJsonBackup(userName?: string): { success: boolean; filename: string } {
  try {
    const jsonStr = db.exportFullDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `adalaj-ops-erp-backup-${timestampStr}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.info(`[Backup] Automated snapshot saved: ${filename}${userName ? ` by ${userName}` : ''}`);
    return { success: true, filename };
  } catch (err) {
    console.error('[Backup] Automatic backup generation failed:', err);
    return { success: false, filename: '' };
  }
}
