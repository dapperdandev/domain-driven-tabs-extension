import { TabGroupRepository } from './data';
import {
  getDomainMap,
  groupTabs,
  unGroupTabs,
} from './tab-manager/tab-manager';

const groupTabsBtn = document.querySelector(
  'button#group-tabs'
) as HTMLButtonElement;
const minTabsInput = document.querySelector(
  'input#min-tabs'
) as HTMLInputElement;

TabGroupRepository.getMinTabsPerGroup()
  .then((result) => {
    minTabsInput.value = result.toString();
    minTabsInput.disabled = false;
  })
  .catch((err) => console.error(err)); // TODO: Add error handling

minTabsInput.addEventListener('change', async ({ target }) => {
  const minTabsPerGroup = (target as HTMLInputElement).valueAsNumber;
  await TabGroupRepository.setMinTabsPerGroup(minTabsPerGroup);
});

groupTabsBtn.onclick = async () => {
  const domainMap = await getDomainMap();
  const minTabsPerGroup = await TabGroupRepository.getMinTabsPerGroup();

  await groupTabs(domainMap, minTabsPerGroup);
  await unGroupTabs(minTabsPerGroup);
};
