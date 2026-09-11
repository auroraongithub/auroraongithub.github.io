export const themes = [
  { id: 'cyan', label: 'Cyan', from: '#6de6e2', to: '#a8f5f2' },
  { id: 'pink', label: 'Pink', from: '#ff6b9d', to: '#ffa4c4' },
  { id: 'purple', label: 'Purple', from: '#9b59b6', to: '#bb8fce' },
  { id: 'green', label: 'Green', from: '#2ecc71', to: '#7fd99f' },
  { id: 'orange', label: 'Orange', from: '#ff9f43', to: '#ffbe76' },
  { id: 'blue', label: 'Blue', from: '#5dade2', to: '#85c1e9' },
  { id: 'red', label: 'Red', from: '#e74c3c', to: '#ec7063' },
  { id: 'yellow', label: 'Yellow', from: '#f1c40f', to: '#f7dc6f' },
  { id: 'teal', label: 'Teal', from: '#1abc9c', to: '#48c9b0' }
] as const;

export type ThemeColor = (typeof themes)[number]['id'];
