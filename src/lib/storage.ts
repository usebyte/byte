export function calculateStorageUsage() {
  let chatHistorySize = 0
  let sparksSize = 0
  let appDataSize = 0

  try {
    const storedData = localStorage.getItem('byte_store')
    
    if (storedData) {
      appDataSize = new Blob([storedData]).size
      
      const data = JSON.parse(storedData)
      const state = data.state || data
      
      console.log('[Storage] State keys:', Object.keys(state || {}))
      
      const chats = state?.chats || []
      
      // Chat history - unsaved chats
      const regularChats = chats.filter((c: any) => !c.saved)
      regularChats.forEach((chat: any) => {
        chatHistorySize += new Blob([JSON.stringify(chat)]).size
      })
      
      // Sparks cache - saved chats
      const savedChats = chats.filter((c: any) => c.saved)
      savedChats.forEach((chat: any) => {
        sparksSize += new Blob([JSON.stringify(chat)]).size
      })
      
      // Log individual state sizes
      console.log('[Storage] Chats total:', chats.length, '| Regular:', regularChats.length, '| Saved:', savedChats.length)
      if (state?.memories) console.log('[Storage] memories:', new Blob([JSON.stringify(state.memories)]).size)
      if (state?.quickPrompts) console.log('[Storage] quickPrompts:', new Blob([JSON.stringify(state.quickPrompts)]).size)
      if (state?.projects) console.log('[Storage] projects:', new Blob([JSON.stringify(state.projects)]).size)
      if (state?.providers) console.log('[Storage] providers:', new Blob([JSON.stringify(state.providers)]).size)
      if (state?.theme) console.log('[Storage] theme:', new Blob([JSON.stringify(state.theme)]).size)
      if (state?.layoutMode) console.log('[Storage] layoutMode:', new Blob([JSON.stringify(state.layoutMode)]).size)
    }
    
  } catch (e) {
    console.error('[Storage] Error calculating storage:', e)
  }

  return { 
    chatHistorySize, 
    sparksSize, 
    appDataSize: appDataSize || chatHistorySize + sparksSize 
  }
}
       
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function getTotalStorage(): { chatHistorySize: number; sparksSize: number } {
  const { chatHistorySize, sparksSize } = calculateStorageUsage()
  return { chatHistorySize, sparksSize }
}