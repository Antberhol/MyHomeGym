import { db } from '../lib/db'

export const routineFolderRepository = {
  async listFolders() {
    return db.getAllRoutineFolders()
  },

  async createFolder(folder) {
    const now = new Date().toISOString()
    return db.addRoutineFolder({
      ...folder,
      updatedAt: folder.updatedAt ?? now,
    })
  },

  async updateFolder(folderId, changes) {
    const now = new Date().toISOString()
    return db.updateRoutineFolder(folderId, {
      ...changes,
      updatedAt: changes.updatedAt ?? now,
    })
  },

  async deleteFolder(folderId) {
    await db.deleteRoutineFolder(folderId)
  },
}
