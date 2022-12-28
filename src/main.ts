import { DomainMap, Tab, TabGroup, TabGroupUpdateProps } from './models'

const groupTabsBtn = document.querySelector('button#group-tabs') as HTMLButtonElement

groupTabsBtn.onclick = async () => {
  const domainMap = await getDomainMap()
  groupTabs(domainMap)
}

const getDomainMap = async (): Promise<DomainMap> => {
  const tabs = await chrome.tabs.query({})
  const domainMap = tabs.reduce((prev: any, curr: Tab) => {
    if (!curr?.url) return prev
    const domain = new URL(curr?.url).hostname
    return {
      ...prev,
      [domain]: [...(prev[domain] || []), curr.id]
    }
  }, {})

  return domainMap
}

const groupTabs = (domainMap: DomainMap): void => {
  const domains = Object.keys(domainMap)
  domains.forEach((domain: string): void => {
    const options: TabGroupUpdateProps = {
      title: domain,
      collapsed: true
    }
    chrome.tabs.group({ tabIds: domainMap[domain] },
      async (groupId: number): Promise<TabGroup> => await chrome.tabGroups.update(groupId, options))
  })
}
