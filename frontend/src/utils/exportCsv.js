/**
 * Utility to export an array of objects or rows to CSV and trigger browser download
 * @param {Array<Object>} data 
 * @param {string} filename 
 * @param {Array<{key: string, label: string}>} columns Optional custom headers & key mapping
 */
export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  let headers = [];
  let keys = [];

  if (columns && columns.length) {
    headers = columns.map(c => c.label);
    keys = columns.map(c => c.key);
  } else {
    keys = Object.keys(data[0]);
    headers = keys.map(k => k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
  }

  const csvRows = [];
  // Add header row
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = keys.map(k => {
      let val = row[k];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

