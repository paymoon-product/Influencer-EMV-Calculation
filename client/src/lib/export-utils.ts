import { EmvCalculation } from "@shared/schema";

// CSV Export Functions
export function exportCalculationsToCSV(calculations: EmvCalculation[], filename?: string) {
  const csvData = convertCalculationsToCSV(calculations);
  downloadCSV(csvData, filename || `emv-calculations-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportSingleCalculationToCSV(calculation: EmvCalculation, filename?: string) {
  const csvData = convertSingleCalculationToCSV(calculation);
  downloadCSV(csvData, filename || `emv-calculation-${calculation.id}-${new Date().toISOString().split('T')[0]}.csv`);
}

function convertCalculationsToCSV(calculations: EmvCalculation[]): string {
  const headers = [
    'ID',
    'Date',
    'Platform',
    'Post Type',
    'Creator Size',
    'Content Topic',
    'Likes',
    'Comments',
    'Shares',
    'Views',
    'Saves',
    'Creator Factor',
    'Post Type Factor',
    'Topic Factor',
    'Total EMV',
    'Breakdown Types',
    'Breakdown Values'
  ];

  const rows = calculations.map(calc => {
    const params = calc.parameters as any;
    const result = calc.result as any;
    
    // Format breakdown data
    const breakdownTypes = result.breakdown?.map((item: any) => item.type).join('; ') || '';
    const breakdownValues = result.breakdown?.map((item: any) => `$${item.emv.toFixed(2)}`).join('; ') || '';

    return [
      calc.id,
      new Date(calc.createdAt).toLocaleDateString(),
      params.platform || '',
      params.postType || '',
      params.creatorSize || '',
      params.contentTopic || '',
      params.likes || 0,
      params.comments || 0,
      params.shares || 0,
      params.views || 0,
      params.saves || 0,
      result.creatorFactor || 0,
      result.postTypeFactor || 0,
      result.topicFactor || 0,
      result.totalEMV || 0,
      breakdownTypes,
      breakdownValues
    ];
  });

  return [headers, ...rows].map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

function convertSingleCalculationToCSV(calculation: EmvCalculation): string {
  const params = calculation.parameters as any;
  const result = calculation.result as any;

  const data = [
    ['Field', 'Value'],
    ['Calculation ID', calculation.id],
    ['Date', new Date(calculation.createdAt).toLocaleDateString()],
    ['Platform', params.platform || ''],
    ['Post Type', params.postType || ''],
    ['Creator Size', params.creatorSize || ''],
    ['Content Topic', params.contentTopic || ''],
    ['Likes', params.likes || 0],
    ['Comments', params.comments || 0],
    ['Shares', params.shares || 0],
    ['Views', params.views || 0],
    ['Saves', params.saves || 0],
    ['Creator Factor', result.creatorFactor || 0],
    ['Post Type Factor', result.postTypeFactor || 0],
    ['Topic Factor', result.topicFactor || 0],
    ['Total EMV', `$${(result.totalEMV || 0).toFixed(2)}`],
    ['', ''], // Empty row
    ['Breakdown Details', ''],
  ];

  // Add breakdown details
  if (result.breakdown && Array.isArray(result.breakdown)) {
    result.breakdown.forEach((item: any) => {
      data.push([
        `${item.type} (${item.count})`,
        `$${item.emv.toFixed(2)}`
      ]);
    });
  }

  return data.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// PDF Export Functions
export function exportCalculationToPDF(calculation: EMVCalculation, filename?: string) {
  const htmlContent = generatePDFHTML(calculation);
  const pdfFilename = filename || `emv-calculation-${calculation.id}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }
}

export function exportCalculationsToPDF(calculations: EMVCalculation[], filename?: string) {
  const htmlContent = generateMultiplePDFHTML(calculations);
  const pdfFilename = filename || `emv-calculations-report-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }
}

function generatePDFHTML(calculation: EMVCalculation): string {
  const params = calculation.parameters as any;
  const result = calculation.result as any;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>EMV Calculation Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 20px;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #666;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #1e40af;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .field {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .field-label {
          font-weight: 500;
          color: #475569;
        }
        .field-value {
          font-weight: 600;
          color: #1e293b;
        }
        .emv-total {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        .emv-amount {
          font-size: 36px;
          font-weight: bold;
          color: #0369a1;
        }
        .breakdown-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .breakdown-table th,
        .breakdown-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        .breakdown-table th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #374151;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Aspire EMV Calculator</div>
        <div class="title">Earned Media Value Calculation Report</div>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="section">
        <div class="section-title">Calculation Parameters</div>
        <div class="grid">
          <div>
            <div class="field">
              <span class="field-label">Platform:</span>
              <span class="field-value">${params.platform || 'N/A'}</span>
            </div>
            <div class="field">
              <span class="field-label">Post Type:</span>
              <span class="field-value">${params.postType || 'N/A'}</span>
            </div>
            <div class="field">
              <span class="field-label">Creator Size:</span>
              <span class="field-value">${params.creatorSize || 'N/A'}</span>
            </div>
            <div class="field">
              <span class="field-label">Content Topic:</span>
              <span class="field-value">${params.contentTopic || 'N/A'}</span>
            </div>
          </div>
          <div>
            <div class="field">
              <span class="field-label">Likes:</span>
              <span class="field-value">${(params.likes || 0).toLocaleString()}</span>
            </div>
            <div class="field">
              <span class="field-label">Comments:</span>
              <span class="field-value">${(params.comments || 0).toLocaleString()}</span>
            </div>
            <div class="field">
              <span class="field-label">Shares:</span>
              <span class="field-value">${(params.shares || 0).toLocaleString()}</span>
            </div>
            <div class="field">
              <span class="field-label">Views:</span>
              <span class="field-value">${(params.views || 0).toLocaleString()}</span>
            </div>
            ${params.saves !== undefined ? `
            <div class="field">
              <span class="field-label">Saves:</span>
              <span class="field-value">${(params.saves || 0).toLocaleString()}</span>
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="emv-total">
        <div style="margin-bottom: 10px; font-size: 18px; color: #374151;">Total Earned Media Value</div>
        <div class="emv-amount">$${(result.totalEMV || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>

      <div class="section">
        <div class="section-title">Calculation Factors</div>
        <div class="field">
          <span class="field-label">Creator Factor:</span>
          <span class="field-value">${result.creatorFactor || 0}x</span>
        </div>
        <div class="field">
          <span class="field-label">Post Type Factor:</span>
          <span class="field-value">${result.postTypeFactor || 0}x</span>
        </div>
        <div class="field">
          <span class="field-label">Topic Factor:</span>
          <span class="field-value">${result.topicFactor || 0}x</span>
        </div>
      </div>

      ${result.breakdown && result.breakdown.length > 0 ? `
      <div class="section">
        <div class="section-title">EMV Breakdown</div>
        <table class="breakdown-table">
          <thead>
            <tr>
              <th>Engagement Type</th>
              <th>Count</th>
              <th>Base Value</th>
              <th>EMV</th>
            </tr>
          </thead>
          <tbody>
            ${result.breakdown.map((item: any) => `
            <tr>
              <td>${item.type}</td>
              <td>${item.count?.toLocaleString() || 0}</td>
              <td>$${(item.baseValue || 0).toFixed(3)}</td>
              <td>$${(item.emv || 0).toFixed(2)}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="footer">
        <div>This report was generated by the Aspire EMV Calculator</div>
        <div>Calculation ID: ${calculation.id} | Generated: ${new Date().toLocaleString()}</div>
      </div>
    </body>
    </html>
  `;
}

function generateMultiplePDFHTML(calculations: EMVCalculation[]): string {
  const totalEMV = calculations.reduce((sum, calc) => {
    const result = calc.result as any;
    return sum + (result.totalEMV || 0);
  }, 0);

  const avgEMV = calculations.length > 0 ? totalEMV / calculations.length : 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>EMV Calculations Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 20px;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #666;
          font-size: 14px;
        }
        .summary {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }
        .summary-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #0369a1;
        }
        .summary-label {
          color: #6b7280;
          font-size: 14px;
          margin-top: 5px;
        }
        .calculations-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .calculations-table th,
        .calculations-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
        }
        .calculations-table th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #374151;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Aspire EMV Calculator</div>
        <div class="title">EMV Calculations Summary Report</div>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="summary">
        <div class="summary-card">
          <div class="summary-value">${calculations.length}</div>
          <div class="summary-label">Total Calculations</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">$${totalEMV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="summary-label">Total EMV</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">$${avgEMV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="summary-label">Average EMV</div>
        </div>
      </div>

      <table class="calculations-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Platform</th>
            <th>Post Type</th>
            <th>Creator Size</th>
            <th>Topic</th>
            <th>Likes</th>
            <th>Comments</th>
            <th>Shares</th>
            <th>Total EMV</th>
          </tr>
        </thead>
        <tbody>
          ${calculations.map(calc => {
            const params = calc.parameters as any;
            const result = calc.result as any;
            return `
            <tr>
              <td>${new Date(calc.createdAt).toLocaleDateString()}</td>
              <td>${params.platform || ''}</td>
              <td>${params.postType || ''}</td>
              <td>${params.creatorSize || ''}</td>
              <td>${params.contentTopic || ''}</td>
              <td>${(params.likes || 0).toLocaleString()}</td>
              <td>${(params.comments || 0).toLocaleString()}</td>
              <td>${(params.shares || 0).toLocaleString()}</td>
              <td>$${(result.totalEMV || 0).toFixed(2)}</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        <div>This report was generated by the Aspire EMV Calculator</div>
        <div>Report Period: ${calculations.length > 0 ? new Date(calculations[calculations.length - 1].createdAt).toLocaleDateString() : 'N/A'} - ${calculations.length > 0 ? new Date(calculations[0].createdAt).toLocaleDateString() : 'N/A'} | Generated: ${new Date().toLocaleString()}</div>
      </div>
    </body>
    </html>
  `;
}