const DEFAULT_MIN_TAB_GROUP = 2

export const setMinTabsPerGroup = async (
  minTabsPerGroup: number
): Promise<void> => {
  await chrome.storage.local.set({ minTabsPerGroup })
}

export const getMinTabsPerGroup = async (): Promise<number> => {
  const { minTabsPerGroup } = await chrome.storage.local.get('minTabsPerGroup')

  return minTabsPerGroup || DEFAULT_MIN_TAB_GROUP
}
