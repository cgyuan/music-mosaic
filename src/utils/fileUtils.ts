import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';

export interface FileSelectResult {
  fileName: string;
  content: string;
}

export const selectAndReadFile = async (accept: string): Promise<FileSelectResult> => {
  try {
    console.log('Opening file dialog');
    await invoke('plugin_log', { message: 'Opening file dialog' });

    const selected = await open({
      multiple: false,
      filters: [{
        name: 'JavaScript',
        extensions: ['js', 'json']
      }]
    });

    if (selected === null) {
      console.log('No file selected');
      await invoke('plugin_log', { message: 'No file selected' });
      throw new Error('No file selected');
    }

    console.log('File selected:', selected);
    await invoke('plugin_log', { message: `File selected: ${selected}` });

    const content = await readTextFile(selected as string);
    console.log('File content read, length:', content.length);
    await invoke('plugin_log', { message: `File content read, length: ${content.length}` });

    return {
      fileName: selected as string,
      content: content
    };
  } catch (error) {
    console.error('Error in selectAndReadFile:', error);
    await invoke('plugin_log', { message: `Error in selectAndReadFile: ${error}` });
    throw error;
  }
};
