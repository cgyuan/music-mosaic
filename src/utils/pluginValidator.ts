
export function validatePlugin(plugin: IPlugin.IPluginInstance): plugin is IPlugin.IPluginInstance {
    const requiredProperties = ['platform', 'version'];

    // const requiredMethods = ['search', 'getMediaSource'];


    // Check required properties
    for (const prop of requiredProperties) {
        if (!(prop in plugin)) {
            console.error(`Missing required property: ${prop}`);
            return false;
        }
    }

    // Check required methods
    // for (const method of requiredMethods) {
    //     if (typeof plugin[method as keyof IPlugin.IPluginInstance] !== 'function') {
    //         console.error(`Missing required method: ${method}`);
    //         return false;
    //     }
    // }

    // Check types of specific properties
    if (plugin.supportedSearchType && !Array.isArray(plugin.supportedSearchType)) {
        console.error('supportedSearchType must be an array');
        return false;
    }


    return true;
}
