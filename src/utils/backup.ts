import { exportDB, importInto } from "dexie-export-import";
import { db } from "@/db/database";

export async function exportDatabase(): Promise<void> {
  try {
    const blob = await exportDB(db);
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to trigger download
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `theomin-backup-${dateStr}.json`;
    
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao exportar banco de dados:", error);
    throw error;
  }
}

export async function importDatabase(file: File): Promise<void> {
  try {
    // Import into the existing database instance
    // This will overwrite existing data based on the file contents
    // We clear the DB first to ensure a clean slate
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        await table.clear();
      }
    });
    
    await importInto(db, file, {
      clearTablesBeforeImport: true, // Double safety
    });
    
  } catch (error) {
    console.error("Erro ao importar banco de dados:", error);
    throw error;
  }
}
