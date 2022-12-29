import { getDomainMap, groupTabs, unGroupTabs } from './tab-manager/tab-manager'

const groupTabsBtn = document.querySelector('button#group-tabs') as HTMLButtonElement || 1

groupTabsBtn.onclick = async () => {
  const domainMap = await getDomainMap()
  const minTabsPerGroup = (document.querySelector('input#min-tabs') as HTMLInputElement).valueAsNumber

  groupTabs(domainMap, minTabsPerGroup)
  await unGroupTabs(minTabsPerGroup)
}
