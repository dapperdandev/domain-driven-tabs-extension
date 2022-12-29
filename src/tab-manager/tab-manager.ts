import { TAB_GROUP_ID_NONE } from '../constants'
import { Tab, TabGroupUpdateProps, TabGroup } from '../models'

export const getDomainMap = async (): Promise<Record<string, number[]>> => {
  const tabs = await chrome.tabs.query({})
  const domainMap = tabs.reduce((prev: any, curr: Tab): Record<string, number[]> => {
    if (!curr.url) return prev
    const domain = new URL(curr?.url).hostname
    return {
      ...prev,
      [domain]: [...(prev[domain] || []), curr.id]
    }
  }, {})

  return domainMap
}

export const groupTabs = (domainMap: Record<string, number[]>, minTabs: number): void => {
  const domains = Object.keys(domainMap)

  domains.forEach((domain: string): void => {
    if (domainMap[domain].length < minTabs) return

    const title = getTitleFromDomain(domain)
    const options: TabGroupUpdateProps = {
      title,
      collapsed: true
    }
    chrome.tabs.group({ tabIds: domainMap[domain] },
      async (groupId: number): Promise<TabGroup> => await chrome.tabGroups.update(groupId, options))
  })
}

const getTitleFromDomain = (domain: string): string => {
  const domainArr = domain.split('.')
  const result = domainArr.slice(0, domainArr.length - 1).join('.').replace('www.', '')

  return result
}

export const unGroupTabs = async (minTabs: number): Promise<void> => {
  const tabs = await chrome.tabs.query({})
  const tabGroupMap = tabs.reduce((prev: Record<string, number[]>, curr: Tab): Record<string, number[]> => {
    if (!curr.id) return prev
    return {
      ...prev,
      [curr.groupId]: [...prev[curr.groupId] || [], curr.id]
    }
  }, {})

  // separate concerns / SRP
  const groupIds = Object.keys(tabGroupMap)
  groupIds.forEach(async (groupId: string) => {
    if (tabGroupMap[groupId].length >= minTabs) return
    if (+groupId === TAB_GROUP_ID_NONE) return

    await chrome.tabs.ungroup(tabGroupMap[groupId])
  })
}
