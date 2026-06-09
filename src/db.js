import { get as idbGet, set as idbSet, del as idbDel, createStore } from 'idb-keyval'

const store = createStore('kirobit-cache', 'data')

function noteKey(userId) { return `notes:${userId}` }
function folderKey(userId) { return `folders:${userId}` }

export async function getCachedNotes(userId) {
  try { return await idbGet(noteKey(userId), store) ?? null }
  catch { return null }
}

export async function cacheNotes(userId, notes) {
  try { await idbSet(noteKey(userId), notes, store) }
  catch { /* IndexedDB unavailable (private browsing etc.) — ignore */ }
}

export async function getCachedFolders(userId) {
  try { return await idbGet(folderKey(userId), store) ?? null }
  catch { return null }
}

export async function cacheFolders(userId, folders) {
  try { await idbSet(folderKey(userId), folders, store) }
  catch { /* ignore */ }
}

export async function clearUserCache(userId) {
  try {
    await idbDel(noteKey(userId), store)
    await idbDel(folderKey(userId), store)
  } catch { /* ignore */ }
}
