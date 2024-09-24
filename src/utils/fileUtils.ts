import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';

export interface FileSelectResult {
  fileName: string;
  content: string;
}

export const selectAndReadFile = async (accept: string[]): Promise<FileSelectResult> => {
  try {
    console.log('Opening file dialog');
    await invoke('plugin_log', { message: 'Opening file dialog' });

    const selected = await open({
      multiple: false,
      filters: [{
        name: 'JavaScript',
        extensions: accept
      }]
    });

    if (selected === null) {
      throw new Error('No file selected');
    }


    const content = await readTextFile(selected as string);

    return {
      fileName: selected as string,
      content: content
    };
  } catch (error) {
    console.error('Error in selectAndReadFile:', error);
    throw error;
  }
};
