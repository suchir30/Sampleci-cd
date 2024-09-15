import { ComponentLoader } from 'adminjs'

const componentLoader = new ComponentLoader();
const components = {
     connectivitPlanner : componentLoader.add('connectivitPlanner', '../import-export-handler/components/ConnectivityPlanner'),
};

export { componentLoader, components };
