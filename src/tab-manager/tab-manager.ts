import { TAB_GROUP_ID_NONE } from './tab-manager.constants'
import { Tab, TabGroupUpdateProps, TabGroup } from './tab-manager.models'

const getTitleFromDomain = (domain: string): string => {
  const domainArr = domain.split('.')
  const result = domainArr.slice(0, domainArr.length - 1).join('.').replace('www.', '')

  return result
}

const sortTabs = async (): Promise<void> => {
  const tabs = await chrome.tabs.query({ currentWindow: true })
  const promises: Array<Promise<Tab>> = []

  tabs.forEach((tab: Tab) => {
    if (!tab.id || tab.groupId !== TAB_GROUP_ID_NONE) return
    promises.push(chrome.tabs.move(tab.id, { index: -1 }))
  })
  await Promise.all(promises)
}

const getTabGroupMap = async (): Promise<Record<string, number[]>> => {
  const tabs = await chrome.tabs.query({ currentWindow: true })
  return tabs.reduce((prev: Record<string, number[]>, curr: Tab): Record<string, number[]> => {
    if (!curr.id) return prev
    return {
      ...prev,
      [curr.groupId]: [...prev[curr.groupId] || [], curr.id]
    }
  }, {})
}

export const getDomainMap = async (): Promise<Record<string, number[]>> => {
  const tabs = await chrome.tabs.query({ currentWindow: true })
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

export const groupTabs = async (domainMap: Record<string, number[]>, minTabs: number): Promise<void> => {
  const domains = Object.keys(domainMap).sort() // TODO: sort after titles
  const promises: Array<Promise<TabGroup>> = []

  domains.forEach((domain: string): void => {
    if (domainMap[domain].length < minTabs) return

    const title = getTitleFromDomain(domain)
    const options: TabGroupUpdateProps = {
      title,
      collapsed: true
    }
    chrome.tabs.group({ tabIds: domainMap[domain] },
      (groupId: number) => promises.push(chrome.tabGroups.update(groupId, options)))
  })

  await Promise.all(promises)
}

export const unGroupTabs = async (minTabs: number): Promise<void> => {
  // TODO: Break apart more / SRP
  const tabGroupMap = await getTabGroupMap()
  const groupIds = Object.keys(tabGroupMap)

  const promises: Array<Promise<void>> = []
  groupIds.forEach((groupId: string) => {
    if (tabGroupMap[groupId].length >= minTabs) return
    if (+groupId === TAB_GROUP_ID_NONE) return

    promises.push(chrome.tabs.ungroup(tabGroupMap[groupId]))
  })

  await Promise.all(promises)
  await sortTabs()
}
